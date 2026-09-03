# Stroke-AI — Deployment

```
Server:   52.89.98.162
Project:  /var/www/stroke-ai.org
User:     anand
```

This is the existing deployment procedure with the backend added. The frontend
steps are unchanged from what you already run; everything under
**[Part A](#part-a--one-time-backend-setup)** is one-time setup for the new API,
and **[Part B](#part-b--routine-deployment)** is the everyday deploy.

## What is new

The site now has two in-app pages behind the **Explore Stroke-AI** button:

| Route | Needs the backend? |
|---|---|
| `/` — landing page | no |
| `/app` — Patient Report (static sample report) | no |
| `/app/brain-haemorrhage-pathway` — runs the CT model | **yes** |

So there are three additions to the current setup:

1. A Python service (`server/`) run by systemd on `127.0.0.1:8000`
2. Four small nginx changes — `/api/` proxy, SPA fallback, upload limit, timeouts
3. Node 20+ for the build (Vite 8 will not build on Node 18)

The model checkpoint (17 MB) and six demo CT studies (~256 MB, 1,028 DICOM
slices) are committed to the repo, so `git pull` brings everything. Nothing to
download separately.

---

# Part A — one-time backend setup

Do this once. Skip to Part B for normal deploys.

## A1. SSH in

```bash
ssh -i /home/shri-ai/shri-deploy/shri-key.pem anand@52.89.98.162
```

## A2. Pull the code that includes the backend

```bash
cd /var/www/stroke-ai.org
sudo chown -R anand:anand /var/www/stroke-ai.org
git config --global --add safe.directory /var/www/stroke-ai.org
git pull origin main

# confirm the model and demo studies arrived
ls -lh server/checkpoints/best_model.pt        # ~17 MB
find server/test_data -name '*.dcm' | wc -l    # 1028
```

## A3. Check the toolchain

```bash
node --version     # must be v20+ ; if v18, install Node 20 (see A3a)
python3 --version  # 3.10+
```

### A3a. Only if Node is older than 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
```

## A4. Python virtualenv and dependencies

```bash
sudo apt-get install -y python3-venv

cd /var/www/stroke-ai.org/server
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
```

**Install PyTorch from its CPU index.** This is the normal, supported way to
install PyTorch on a server without a GPU — about 990 MB installed, and the
model runs on it exactly as it does anywhere else:

```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt
```

The `--index-url` is the part that matters. Leave it off and pip takes torch
from PyPI, whose Linux build is the CUDA one — it still runs, but it drags in
~3 GB of NVIDIA libraries this instance has no GPU to use.

## A5. Smoke-test the API before wiring up systemd

```bash
cd /var/www/stroke-ai.org/server
source .venv/bin/activate
uvicorn main:app --host 127.0.0.1 --port 8000
```

In a second SSH session:

```bash
curl -s localhost:8000/api/health
curl -s localhost:8000/api/samples | head -c 200

# real inference on a bundled study (first call also loads the model)
time curl -s -X POST -F "sample_id=patient_048_ICHpos_severe_multi" \
  localhost:8000/api/predict | head -c 120
```

That study is a known haemorrhage-positive case, so expect `"ICH":0.99...`.
Then stop the foreground uvicorn with `Ctrl-C`.

## A6. Run it as a service

```bash
sudo cp /var/www/stroke-ai.org/deploy/stroke-ai-api.service \
        /etc/systemd/system/stroke-ai-api.service
sudo systemctl daemon-reload
sudo systemctl enable --now stroke-ai-api

systemctl status stroke-ai-api --no-pager
curl -s localhost:8000/api/health
```

Logs whenever needed:

```bash
sudo journalctl -u stroke-ai-api -f
```

## A7. nginx changes

`deploy/nginx-additions.conf` in the repo lists exactly what to add, with the
reasoning. **Do not replace the existing site file** — it holds the certbot TLS
config. Edit it and add the four pieces into the `listen 443 ssl` server block:

```bash
sudo nano /etc/nginx/sites-available/stroke-ai.org
```

- `client_max_body_size 600M;` — a CT series upload is 250 MB+; nginx's default
  is 1 MB and would fail with `413`
- change `location /` to `try_files $uri $uri/ /index.html;` — client-side
  routing means `/app` must fall back to index.html or it 404s on refresh
- add the `location /api/ { proxy_pass http://127.0.0.1:8000; ... }` block
  (copy it from `deploy/nginx-additions.conf` — it carries the 300 s timeouts
  that a large upload plus CPU inference needs)
- add the `location /assets/` long-cache block

Also confirm `root` is the build directory, not the repo root:

```nginx
root /var/www/stroke-ai.org/dist;
```

If it pointed at `/var/www/stroke-ai.org`, the whole repo would be
web-readable, including the demo DICOM studies.

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Port 8000 must stay **closed** in the AWS security group — nginx reaches the
API over localhost. Only 22, 80 and 443 need to be open.

---

# Part B — routine deployment

The usual flow, with two backend lines added.

```bash
# 1. SSH in
ssh -i /home/shri-ai/shri-deploy/shri-key.pem anand@52.89.98.162

# 2. Go to the project
cd /var/www/stroke-ai.org

# 3. Ensure anand owns the repository
sudo chown -R anand:anand /var/www/stroke-ai.org

# 4. Mark the repository safe for git (usually only needed once)
git config --global --add safe.directory /var/www/stroke-ai.org

# 5. Pull the latest code
git pull origin main

# 6. Frontend: install dependencies (no sudo)
cd /var/www/stroke-ai.org/client
npm install

# 7. Frontend: build (no sudo)
npm run build

# 8. Publish the build to the directory nginx serves
cd /var/www/stroke-ai.org
rm -rf dist
cp -r client/dist dist

# 9. NEW — backend: update dependencies only if server/ changed
cd /var/www/stroke-ai.org/server
source .venv/bin/activate
pip install -r requirements.txt

# 10. NEW — backend: restart the service to pick up new code
sudo systemctl restart stroke-ai-api

# 11. Ownership stays with anand
sudo chown -R anand:anand /var/www/stroke-ai.org

# 12. Let nginx read the files
sudo chmod -R u=rwX,go=rX /var/www/stroke-ai.org

# 13. Test and reload nginx
sudo nginx -t
sudo systemctl reload nginx
```

If only the frontend changed, steps 9 and 10 can be skipped. If only the
backend changed, steps 6-8 can be skipped.

## Verify the deployment

```bash
curl -s -o /dev/null -w "landing   %{http_code}\n" https://stroke-ai.org/
curl -s -o /dev/null -w "report    %{http_code}\n" https://stroke-ai.org/app
curl -s -o /dev/null -w "pathway   %{http_code}\n" https://stroke-ai.org/app/brain-haemorrhage-pathway
curl -s -o /dev/null -w "api       %{http_code}\n" https://stroke-ai.org/api/health
systemctl is-active stroke-ai-api
```

All four must be `200` and the service `active`. A 404 on `report`/`pathway`
means the SPA fallback is missing (step A7).

Then in a browser:

1. Landing page → click **Explore Stroke-AI** (top right)
2. **Patient Report** renders
3. Sidebar → **Brain Haemorrhage Pathway**
4. Pick a bundled study → **Run inference** → verdict and probabilities appear
5. **Upload DICOM slices** tab → **Browse folder** → pick a whole series folder
   → **Run inference**

Warm the model after a restart so the first real visitor doesn't wait for it to
load:

```bash
curl -s -X POST -F "sample_id=patient_011_ICHneg_clean" \
  localhost:8000/api/predict -o /dev/null
```

## Measured behaviour

| | |
|---|---|
| API memory, model loaded | ~800 MB resident, one worker |
| Warm inference | ~1 s per study on a 16-core box; expect 3-6 s on 2 vCPU |
| First request after restart | slower — the model loads lazily |
| Slices analysed per study | 24, evenly spaced, whatever the series length |
| Disk needed | ~1.6 GB (repo 280 MB + venv ~1.1 GB + node_modules ~200 MB) |

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| `npm run build` fails with a syntax/engine error | Node 18. Install Node 20+ (A3a). |
| pip pulls gigabytes of `nvidia-*`, or disk fills | The `--index-url` was left off, so pip took the CUDA build from PyPI. Reinstall per A4. |
| Upload fails, nginx log shows `413` | `client_max_body_size` missing (A7). |
| Upload or inference dies near 60 s with `504` | `proxy_read_timeout` missing (A7). |
| `/app` loads but refreshing it 404s | SPA fallback missing (A7). |
| Pathway page says it cannot reach the API | `systemctl status stroke-ai-api`, then `sudo journalctl -u stroke-ai-api -n 50`. |
| `502 Bad Gateway` on `/api/` | Service down or not on 127.0.0.1:8000. |
| Service fails: `No such file or directory: checkpoints/best_model.pt` | Incomplete pull. Re-run `git pull origin main`; the checkpoint is committed. |
| Service killed, journal shows OOM | Too little RAM for the worker count. Keep `--workers 1`. |
| `git pull` refuses: "dubious ownership" | Step 3 and 4 of Part B. |

## Note on what this is

The Brain Haemorrhage Pathway model is a **research prototype** trained on ~320
CQ500 studies (held-out AUROC 0.878) and is **not for clinical use**. The
Patient Report page is a static design demonstration of one sample case, not
live model output. Both carry on-screen notices to that effect — please keep
them in place on the public deployment.
