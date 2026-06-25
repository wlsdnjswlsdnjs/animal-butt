const { createServer } = require("node:http");
const { readFile } = require("node:fs/promises");
const { existsSync } = require("node:fs");
const { extname, join, normalize, resolve } = require("node:path");
const { execFile } = require("node:child_process");

const root = resolve(__dirname, "..");
const port = Number(process.env.PORT || 5173);
const host = process.env.HOST || "127.0.0.1";
const shouldOpen = process.env.NO_OPEN !== "1";

const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function toFilePath(url) {
  const rawPath = decodeURIComponent(new URL(url, `http://${host}:${port}`).pathname);
  const pathname = rawPath === "/" ? "/index.html" : rawPath;
  const filePath = normalize(join(root, pathname));

  if (!filePath.startsWith(root)) {
    return null;
  }

  return filePath;
}

function openBrowser(url) {
  if (!shouldOpen) return;

  const command =
    process.platform === "darwin"
      ? "open"
      : process.platform === "win32"
        ? "cmd"
        : "xdg-open";
  const args = process.platform === "win32" ? ["/c", "start", "", url] : [url];

  execFile(command, args, { stdio: "ignore" }, () => {});
}

const server = createServer(async (request, response) => {
  const filePath = toFilePath(request.url);

  if (!filePath || !existsSync(filePath)) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("not found");
    return;
  }

  try {
    const body = await readFile(filePath);
    response.writeHead(200, {
      "cache-control": "no-store",
      "content-type": types[extname(filePath)] || "application/octet-stream",
    });
    response.end(body);
  } catch (error) {
    response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    response.end(error.message);
  }
});

server.listen(port, host, () => {
  const url = `http://${host}:${port}`;
  console.log(`동물 엉덩이 dev server`);
  console.log(`open ${url}`);
  openBrowser(url);
});
