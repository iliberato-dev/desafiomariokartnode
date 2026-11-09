const fs = require("node:fs/promises");
const http = require("node:http");
const path = require("node:path");

const PORT = Number(process.env.PORT) || 3000;
const ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const DOCS_DIR = path.join(ROOT, "docs");

const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

function resolveFile(pathname) {
  const isDoc = pathname.startsWith("/docs/");
  const baseDir = isDoc ? DOCS_DIR : PUBLIC_DIR;
  const relativePath = isDoc ? pathname.slice("/docs/".length) : pathname.slice(1);
  const file = path.resolve(baseDir, relativePath || "index.html");

  return file.startsWith(baseDir + path.sep) ? file : null;
}

const server = http.createServer(async (request, response) => {
  try {
    const { pathname } = new URL(request.url, "http://localhost");
    const file = resolveFile(decodeURIComponent(pathname));

    if (!file) {
      response.writeHead(403).end("Forbidden");
      return;
    }

    const content = await fs.readFile(file);
    response.writeHead(200, {
      "Content-Type": CONTENT_TYPES[path.extname(file)] || "application/octet-stream",
    });
    response.end(content);
  } catch (error) {
    const notFound = error.code === "ENOENT" || error.code === "EISDIR";
    response.writeHead(notFound ? 404 : 500).end(notFound ? "Not found" : "Internal error");
  }
});

server.listen(PORT, () => {
  console.log(`Mario Kart está no ar em http://localhost:${PORT}`);
});
