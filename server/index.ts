import express from "express";
import cors from "cors";
import path from "path";
import { registerRoutes } from "./routes";

const app = express();
const PORT = Number(process.env.PORT || 5000);
const HTTP_PORT = 8000;

// Middleware
app.use(cors({
  origin: true, // Allow requests from any origin in development
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from client/dist in all environments
const clientDistPath = path.join(__dirname, "../client/dist");
app.use(express.static(clientDistPath));

// Register API routes first
const server = registerRoutes(app);

// Serve React app for all other routes - this must come after API routes
app.use((req, res) => {
  // For any route that is not handled by the API or static files
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  } else {
    res.status(404).json({ error: "API endpoint not found" });
  }
});

// Start API server on port 5000
server.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`API server running on http://0.0.0.0:${PORT}`);
});

// Create HTTP server on port 8000 for web traffic
const httpApp = express();
httpApp.use(express.static(clientDistPath));
httpApp.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

httpApp.listen(HTTP_PORT, "0.0.0.0", () => {
  console.log(`HTTP server running on http://0.0.0.0:${HTTP_PORT}`);
});

