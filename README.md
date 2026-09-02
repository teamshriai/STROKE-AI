# Stroke-AI

The intelligent command centre for stroke care — a joint initiative of
[SHRI-AI](https://shri-ai.org) and [IndoStates Health Hospital](https://indostates.com/).

```
client/    Vite + React SPA — the landing page and the in-app Patient Report
assets/    images for the root-level static landing page
server/    placeholder for the future backend
```

## Pages

| Route | What it is |
|---|---|
| `/` | Public landing page. The top-right **Explore Stroke-AI** button leads into the app. |
| `/app` | **Patient Report** — a sample Acute Stroke Imaging & Triage Report. |

The Patient Report is a **static demonstration page**: it is populated with one published
sample case (SA-2026-0871) and calls no backend. It is a design and product artefact, not a
real patient and not live model output.

## Running locally

Requires **Node 20+** (Vite 8 will not run on Node 18).

```bash
cd client
npm install
npm run dev          # http://localhost:5173
```

## Building for deployment

```bash
cd client
npm install
npm run build        # emits client/dist/
npm run preview      # optional: serve the production build locally
```

Deploy the contents of `client/dist/` as static files.

### Important: SPA routing

Routing is client-side (`react-router-dom` with `BrowserRouter`), so the host **must rewrite
unknown paths to `/index.html`** or a direct visit to `/app` (or a refresh while on it) will
return 404. The usual form of this:

- **Nginx** — `location / { try_files $uri $uri/ /index.html; }`
- **Apache** — `FallbackResource /index.html`
- **Netlify** — `/* /index.html 200` in `_redirects`
- **Vercel / Cloudflare Pages / S3+CloudFront** — enable the SPA/single-page-app rewrite,
  or point the 404 handler at `/index.html`

No environment variables and no backend are required for what's in this branch.

## Notes for whoever picks this up

- Tailwind v4 is configured **CSS-first** — theme tokens live in the `@theme` block of
  `client/src/index.css`, and there is deliberately no `tailwind.config.js`.
- Charts on the report page are hand-rolled inline SVG (`client/src/components/report/`), so
  there is no charting dependency to install or upgrade.
- Lint with `npm run lint` (oxlint). One pre-existing warning in `FadeSection.jsx` is
  inherited from the original landing-page code and is not a new issue.
- The app shell (`AppLayout` + `Sidebar`) is built to take further pages; the sidebar
  currently has a single entry.
