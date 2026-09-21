import http from "node:http";
import net from "node:net";

const PORT = Number(process.env.PORT || 3100);
const NEXT_PORT = Number(process.env.NEXT_PORT || 3000);
const AUTH_PORT = Number(process.env.AUTH_PORT || 9099);
const FUNCTIONS_PORT = Number(process.env.FUNCTIONS_PORT || 5001);

function targetFor(pathname) {
  // Firebase Auth's Web SDK strips any path supplied to connectAuthEmulator()
  // and sends requests from the emulator host root. Route those Auth API
  // namespaces to the Auth emulator while keeping the Learner app at /.
  if (
    pathname.startsWith("/identitytoolkit.googleapis.com/") ||
    pathname.startsWith("/securetoken.googleapis.com/") ||
    pathname.startsWith("/www.googleapis.com/identitytoolkit/") ||
    pathname.startsWith("/emulator/") ||
    pathname.startsWith("/__/auth/") ||
    pathname.startsWith("/__/firebase/")
  ) {
    return { port: AUTH_PORT, prefix: "" };
  }
  if (pathname.startsWith("/__skill_saga_auth/") || pathname === "/__skill_saga_auth") {
    return { port: AUTH_PORT, prefix: "/__skill_saga_auth" };
  }
  if (pathname.startsWith("/__skill_saga_functions/") || pathname === "/__skill_saga_functions") {
    return { port: FUNCTIONS_PORT, prefix: "/__skill_saga_functions" };
  }
  return { port: NEXT_PORT, prefix: "" };
}

function forward(req, res) {
  const origin = req.headers.origin;
  if (req.method === "OPTIONS" && origin) {
    res.writeHead(204, {
      "access-control-allow-origin": origin,
      "access-control-allow-credentials": "true",
      "access-control-allow-methods": "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
      "access-control-allow-headers": req.headers["access-control-request-headers"] || "Content-Type, Authorization, X-Requested-With",
      "access-control-max-age": "600",
      "vary": "Origin, Access-Control-Request-Headers",
    });
    res.end();
    return;
  }

  const pathname = new URL(req.url || "/", "http://localhost").pathname;
  const target = targetFor(pathname);
  const targetPath = target.prefix ? pathname.slice(target.prefix.length) || "/" : pathname;
  const query = new URL(req.url || "/", "http://localhost").search;

  const headers = { ...req.headers, host: `127.0.0.1:${target.port}` };

  const upstream = http.request(
    {
      hostname: "127.0.0.1",
      port: target.port,
      method: req.method,
      path: targetPath + query,
      headers,
    },
    (upstreamRes) => {
      const responseHeaders = { ...upstreamRes.headers };
      const origin = req.headers.origin;
      if (origin) {
        responseHeaders["access-control-allow-origin"] = origin;
        responseHeaders["access-control-allow-credentials"] = "true";
        responseHeaders["vary"] = "Origin";
      }
      res.writeHead(upstreamRes.statusCode || 502, responseHeaders);
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
