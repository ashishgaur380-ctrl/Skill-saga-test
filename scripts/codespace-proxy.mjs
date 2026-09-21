import http from "node:http";
import net from "node:net";

const PORT = Number(process.env.PORT || 3100);
const NEXT_PORT = Number(process.env.NEXT_PORT || 3000);
const AUTH_PORT = Number(process.env.AUTH_PORT || 9099);
const FUNCTIONS_PORT = Number(process.env.FUNCTIONS_PORT || 5001);

function targetFor(pathname) {
  if (pathname.startsWith("/__skill_saga_auth/") || pathname === "/__skill_saga_auth") {
    return { port: AUTH_PORT, prefix: "/__skill_saga_auth" };
  }
  if (pathname.startsWith("/__skill_saga_functions/") || pathname === "/__skill_saga_functions") {
    return { port: FUNCTIONS_PORT, prefix: "/__skill_saga_functions" };
  }
  return { port: NEXT_PORT, prefix: "" };
}

function forward(req, res) {
  const pathname = new URL(req.url || "/", "http://localhost").pathname;
  const target = targetFor(pathname);
  const targetPath = target.prefix ? pathname.slice(target.prefix.length) || "/" : pathname;
  const query = new URL(req.url || "/", "http://localhost").search;

  const headers = { ...req.headers, host: `127.0.0.1:${target.port}` };
  delete headers["content-length"];

  const upstream = http.request(
    {
      hostname: "127.0.0.1",
      port: target.port,
      method: req.method,
      path: targetPath + query,
      headers,
    },
    (upstreamRes) => {
      res.writeHead(upstreamRes.statusCode || 502, upstreamRes.headers);
      upstreamRes.pipe(res);
    },
  );

  upstream.on("error", (error) => {
    if (!res.headersSent) res.writeHead(502, { "content-type": "text/plain" });
    res.end(`Codespace proxy upstream error: ${error.message}`);
  });

  req.pipe(upstream);
}

const server = http.createServer(forward);

server.on("upgrade", (req, clientSocket, head) => {
  // Next.js dev HMR/WebSocket traffic is forwarded to the learner dev server.
  const upstream = net.connect(NEXT_PORT, "127.0.0.1", () => {
    const lines = [
      `${req.method} ${req.url} HTTP/1.1`,
      ...Object.entries(req.headers).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`),
      "",
      "",
    ];
    upstream.write(lines.join("\r\n"));
    if (head.length) upstream.write(head);
    clientSocket.pipe(upstream);
    upstream.pipe(clientSocket);
  });

  upstream.on("error", () => clientSocket.destroy());
  clientSocket.on("error", () => upstream.destroy());
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Skill Saga Codespaces proxy: http://0.0.0.0:${PORT}`);
  console.log(`Learner -> 127.0.0.1:${NEXT_PORT}`);
  console.log(`Auth    -> 127.0.0.1:${AUTH_PORT}`);
  console.log(`Functions -> 127.0.0.1:${FUNCTIONS_PORT}`);
});
