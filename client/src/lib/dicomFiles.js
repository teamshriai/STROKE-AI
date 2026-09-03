// Helpers for accepting a whole DICOM series from the browser — either a
// picked folder or a folder dragged onto the drop zone.

// PACS exports often ship slices without a file extension, so accept those too
// and let the server's DICOM reader reject anything that isn't really a slice.
export function isDicomLike(file) {
  const name = file.name.split('/').pop() ?? '';
  if (name.startsWith('.')) return false; // .DS_Store, Thumbs.db-style noise
  if (/\.(dcm|dicom)$/i.test(name)) return true;
  return !name.includes('.');
}

async function readAllEntries(reader) {
  // readEntries() returns at most 100 entries per call, so it has to be
  // drained in a loop — otherwise a 272-slice series arrives truncated.
  const entries = [];
  let batch;
  do {
    batch = await new Promise((resolve, reject) => reader.readEntries(resolve, reject));
    entries.push(...batch);
  } while (batch.length > 0);
  return entries;
}

async function collectFromEntry(entry, out) {
  if (entry.isFile) {
    const file = await new Promise((resolve, reject) => entry.file(resolve, reject));
    out.push(file);
    return;
  }
  if (entry.isDirectory) {
    const children = await readAllEntries(entry.createReader());
    for (const child of children) {
      await collectFromEntry(child, out);
    }
  }
}

/**
 * Pull every file out of a drop event, walking into any dropped folders.
 * The entries must be read synchronously from the event, before awaiting —
 * DataTransfer items are cleared once the handler returns.
 */
export async function filesFromDropEvent(event) {
  const entries = Array.from(event.dataTransfer?.items ?? [])
    .map((item) => (typeof item.webkitGetAsEntry === 'function' ? item.webkitGetAsEntry() : null))
    .filter(Boolean);

  if (entries.length === 0) {
    return Array.from(event.dataTransfer?.files ?? []);
  }

  const files = [];
  for (const entry of entries) {
    await collectFromEntry(entry, files);
  }
  return files;
}

export function totalMegabytes(files) {
  return files.reduce((sum, f) => sum + f.size, 0) / (1024 * 1024);
}
