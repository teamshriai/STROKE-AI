# Deploying Stroke-AI on AWS EC2

Runbook for a single EC2 instance serving both the frontend and the model API.
Every command below is copy-pasteable in order.

## What you are deploying

```
                    ┌──────────────────── EC2 instance ────────────────────┐
  browser ──:443──▶ │  nginx                                               │
                    │    /            ──▶ /var/www/stroke-ai  (static SPA) │
                    │    /api/        ──▶ 127.0.0.1:8000                   │
                    │                        └─ uvicorn + FastAPI          │
                    │                             └─ PyTorch model (CPU)   │
                    └──────────────────────────────────────────────────────┘
```

Both come from one origin, so the frontend needs **no API URL configuration** —
it calls `/api/...` relative. Port 8000 is bound to localhost and stays closed
in the security group.

The model checkpoint (17 MB) and six demo NCCT studies (~256 MB, 1,028 DICOM
slices) are **committed to the repo**, so `git clone` brings everything needed.
There is nothing to download separately and no S3 bucket to wire up.

## 1. Launch the instance

| Setting | Value |
|---|---|
| AMI | Ubuntu Server 24.04 LTS (x86_64) |
| Instance type | **t3.large** recommended (2 vCPU / 8 GB). `t3.medium` (4 GB) works — the API alone holds ~800 MB once the model loads. |
| Storage | **20 GB** gp3. The default 8 GB will not fit OS + repo (280 MB) + PyTorch venv (~1.5 GB) + node_modules. |
| Key pair | your usual `.pem` |

Security group inbound rules:

| Port | Source | Why |
|---|---|---|
| 22 | **your IP only** | SSH |
| 80 | 0.0.0.0/0 | HTTP |
| 443 | 0.0.0.0/0 | HTTPS (after step 8) |

Do **not** open 8000 — nginx reaches the API over localhost.

```bash
ssh -i ~/path/to/key.pem ubuntu@<EC2_PUBLIC_IP>
```

## 2. Install system packages

```bash
sudo apt-get update && sudo apt-get upgrade -y

# Node 20 — Vite 8 will NOT build on Node 18, which is what Ubuntu ships
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

sudo apt-get install -y git nginx python3-venv python3-pip

node --version     # expect v20.x or newer
python3 --version  # expect 3.12.x
```

## 3. Clone the repository

```bash
sudo mkdir -p /opt/stroke-ai
sudo chown ubuntu:ubuntu /opt/stroke-ai
git clone https://github.com/teamshriai/STROKE-AI.git /opt/stroke-ai
cd /opt/stroke-ai

# Confirm the model and demo studies came down with it
ls -lh server/checkpoints/best_model.pt          # ~17 MB
ls server/test_data/ | head                      # 6 patient_* folders + CSV
find server/test_data -name '*.dcm' | wc -l       # 1028
```

## 4. Backend: virtualenv and dependencies

**Install the CPU build of PyTorch first.** A plain `pip install torch` pulls
the CUDA build plus ~2-3 GB of NVIDIA packages, which this instance has no GPU
to use and may not have the disk for.

```bash
cd /opt/stroke-ai/server
python3 -m venv .venv
source .venv/bin/activate

pip install --upgrade pip
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt
```

Smoke-test it before wiring up systemd:

```bash
cd /opt/stroke-ai/server
source .venv/bin/activate
uvicorn main:app --host 127.0.0.1 --port 8000
```

In a second SSH session:

```bash
curl -s localhost:8000/api/health
curl -s localhost:8000/api/samples | head -c 300

# Real inference on a bundled study (first call also loads the model)
time curl -s -X POST -F "sample_id=patient_048_ICHpos_severe_multi" \
  localhost:8000/api/predict | head -c 200
```

You should see `"ICH":0.99...` for that study — it is a known haemorrhage-positive
case. Then stop the foreground uvicorn with `Ctrl-C`.

## 5. Run the backend as a service

```bash
sudo cp /opt/stroke-ai/deploy/stroke-ai-api.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now stroke-ai-api

systemctl status stroke-ai-api --no-pager
curl -s localhost:8000/api/health
```

Logs, whenever you need them:

```bash
journalctl -u stroke-ai-api -f
```

## 6. Frontend: build and publish

```bash
cd /opt/stroke-ai/client
npm ci
npm run build          # emits client/dist/

sudo mkdir -p /var/www/stroke-ai
sudo rsync -a --delete dist/ /var/www/stroke-ai/
sudo chown -R www-data:www-data /var/www/stroke-ai
```

No `.env` is needed. An unset `VITE_API_BASE_URL` in a production build means
same-origin, which is exactly what the nginx config serves.

## 7. nginx

```bash
sudo cp /opt/stroke-ai/deploy/nginx-stroke-ai.conf /etc/nginx/sites-available/stroke-ai
sudo ln -sf /etc/nginx/sites-available/stroke-ai /etc/nginx/sites-enabled/stroke-ai
sudo rm -f /etc/nginx/sites-enabled/default

sudo nginx -t
sudo systemctl reload nginx
```

Set the real hostname in that file (`server_name`) once DNS points at the
instance.

### Verify

```bash
curl -s -o /dev/null -w "landing   %{http_code}\n" http://localhost/
curl -s -o /dev/null -w "deep link %{http_code}\n" http://localhost/app/brain-haemorrhage-pathway
curl -s -o /dev/null -w "api       %{http_code}\n" http://localhost/api/health
```

All three must return `200`. The deep link returning 404 means the SPA fallback
is not active — recheck `try_files` in the site config.

Then open `http://<EC2_PUBLIC_IP>/` in a browser and walk through it:

1. Landing page loads → click **Explore Stroke-AI** (top right)
2. **Patient Report** renders (the sample triage report)
3. Sidebar → **Brain Haemorrhage Pathway**
4. Pick a bundled study → **Run inference** → verdict and probabilities appear
5. Switch to **Upload DICOM slices** → **Browse folder** → pick a
   `server/test_data/patient_*` folder copied to your laptop → **Run inference**

## 8. HTTPS (once DNS is pointed at the instance)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d demo.stroke-ai.org      # use the real hostname
sudo systemctl status certbot.timer             # auto-renewal
```

Certbot rewrites the nginx site in place and keeps the upload limit and
timeouts.

## Redeploying after a change

```bash
cd /opt/stroke-ai
git pull

# backend changed?
cd server && source .venv/bin/activate && pip install -r requirements.txt
sudo systemctl restart stroke-ai-api

# frontend changed?
cd /opt/stroke-ai/client && npm ci && npm run build
sudo rsync -a --delete dist/ /var/www/stroke-ai/
sudo chown -R www-data:www-data /var/www/stroke-ai
```

nginx does not need reloading for a frontend rebuild.

## Performance notes, measured

| | |
|---|---|
| API memory, model loaded | ~800 MB resident, one worker |
| Warm inference, 272-slice study | ~1 s on a 16-core dev box; expect ~3-6 s on 2 vCPU |
| First request after restart | slower — the model loads lazily on first use |
| Slices actually analysed | 24, evenly spaced across the series, whatever its length |

To avoid a slow first visit, warm the model on deploy:

```bash
curl -s -X POST -F "sample_id=patient_011_ICHneg_clean" localhost:8000/api/predict -o /dev/null
```

Raise `--workers` in the service file only with RAM to spare — each worker
loads its own ~800 MB copy of the model.

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| `npm run build` fails with a syntax/engine error | Node 18. Install Node 20+ (step 2). |
| pip pulls gigabytes of `nvidia-*` packages, or disk fills | The CUDA torch build. Install the CPU wheels first (step 4). |
| Upload fails, nginx logs `413` | `client_max_body_size` — the shipped config sets 600M; confirm your site file is the one enabled. |
| Upload or inference dies at ~60 s with `504` | `proxy_read_timeout` — shipped config sets 300s. |
| `/app` works but a refresh 404s | SPA fallback missing; `try_files $uri $uri/ /index.html`. |
| Pathway page shows "Could not reach the API" | `systemctl status stroke-ai-api`, then `journalctl -u stroke-ai-api -n 50`. |
| Service dies on start, log says `No such file or directory: checkpoints/best_model.pt` | Clone is incomplete. Re-clone; the checkpoint is committed. |
| Service killed, `journalctl` shows OOM | Instance too small for the worker count. Use t3.large or `--workers 1`. |
| `502 Bad Gateway` | Backend down or not on 127.0.0.1:8000. Check the service, then `curl localhost:8000/api/health`. |

## Note on what this is

The Brain Haemorrhage Pathway model is a **research prototype** trained on ~320
CQ500 studies (held-out AUROC 0.878) and is **not for clinical use**. The
Patient Report page is a static design demonstration of one sample case, not
live model output. Both carry on-screen notices to that effect — please keep
them in place on any public deployment.
