// Where the backend lives.
//
// Unset in a production build means "same origin" — the deployment serves the
// built frontend and proxies /api to the backend from one host (see
// DEPLOYMENT.md), so a relative path is correct and needs no configuration.
// Unset in dev means the local uvicorn on port 8000. Set VITE_API_BASE_URL to
// override either, e.g. when the API is on a separate host.
const configured = import.meta.env.VITE_API_BASE_URL;
const fallback = import.meta.env.DEV ? 'http://localhost:8000' : '';
const API_BASE_URL = (configured === undefined ? fallback : configured).replace(/\/+$/, '');

async function readError(response) {
  try {
    const body = await response.json();
    return body.detail ?? response.statusText;
  } catch {
    return response.statusText;
  }
}

export async function fetchSamples() {
  const response = await fetch(`${API_BASE_URL}/api/samples`);
  if (!response.ok) throw new Error(await readError(response));
  const body = await response.json();
  return body.samples;
}

export async function predictSample(sampleId) {
  const form = new FormData();
  form.append('sample_id', sampleId);
  const response = await fetch(`${API_BASE_URL}/api/predict`, { method: 'POST', body: form });
  if (!response.ok) throw new Error(await readError(response));
  return response.json();
}

export async function predictUpload(files) {
  const form = new FormData();
  files.forEach((file) => form.append('files', file, file.name));
  const response = await fetch(`${API_BASE_URL}/api/predict`, { method: 'POST', body: form });
  if (!response.ok) throw new Error(await readError(response));
  return response.json();
}
