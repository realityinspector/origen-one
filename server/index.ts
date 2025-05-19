
import express from "express";
import cors from "cors";
import path from "path";
import { registerRoutes } from "./routes";
import http from "http";

const app = express();
const PORT = Number(process.env.PORT || 5000);
const HTTP_PORT = Number(process.env.HTTP_PORT || 8000);

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Determine the correct client dist path based on environment
let clientDistPath;
if (process.env.NODE_ENV === 'production') {
  clientDistPath = path.join(process.cwd(), "client/dist");
} else {
  clientDistPath = path.join(__dirname, "../client/dist");
}

console.log(`Client dist path: ${clientDistPath}`);

// Serve static files from the client dist folder
app.use(express.static(clientDistPath));

// Register API routes first
const server = registerRoutes(app);

// Serve React app for all other routes - this must come after API routes
app.use((req, res) => {
  const indexPath = path.join(clientDistPath, "index.html");
  console.log(`Serving index from: ${indexPath}`);
  res.sendFile(indexPath);
});

// Start server on port 5000
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

// Create HTTP server for port 8000 that forwards to port 5000
const httpServer = http.createServer((req, res) => {
  // Forward request to port 5000
  const options = {
    hostname: '0.0.0.0',
    port: PORT,
    path: req.url,
    method: req.method,
    headers: req.headers
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  req.pipe(proxyReq, { end: true });
});

httpServer.listen(HTTP_PORT, "0.0.0.0", () => {
  console.log(`HTTP server running on http://0.0.0.0:${HTTP_PORT}`);
});
