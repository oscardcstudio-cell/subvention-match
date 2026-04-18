/**
 * Tiny static server with SPA fallback for Playwright E2E tests.
 * Serves dist/public/ on port 4174.
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, resolve } from "node:path";

const PORT = 4174;
const ROOT = resolve("dist/public");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
};

async function tryFile(filepath) {
  try {
    const s = await stat(filepath);
    if (s.isFile()) return filepath;
  } catch {}
  return null;
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let p = url.pathname;

  // Serve root as index.html
  if (p === "/") p = "/index.html";

  // Try direct file
  let file = await tryFile(join(ROOT, p));

  // SPA fallback: if no file and path has no extension, return index.html
  if (!file && !extname(p)) {
    file = await tryFile(join(ROOT, "index.html"));
  }

  if (!file) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404");
    return;
  }

  const ext = extname(file).toLowerCase();
  const mime = MIME[ext] || "application/octet-stream";
  const body = await readFile(file);
  res.writeHead(200, {
    "Content-Type": mime,
    "Cache-Control": "no-cache",
  });
  res.end(body);
}).listen(PORT, () => {
  console.log(`[e2e-server] http://localhost:${PORT} (root=${ROOT})`);
});
