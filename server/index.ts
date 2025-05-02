
import express from "express";
import cors from "cors";
import path from "path";
import { registerRoutes } from "./routes";

const app = express();
const PORT = Number(process.env.PORT || 5000);
const HTTP_PORT = Number(process.env.HTTP_PORT || 8000);

// Middleware
app.use(cors({
  origin: true, // Allow requests from any origin in development
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Determine the correct client dist path based on environment
let clientDistPath;

// In production (after TypeScript compilation), we're running from dist/server/
if (process.env.NODE_ENV === 'production') {
  clientDistPath = path.join(process.cwd(), "client/dist");
} else {
  // In development, we're running from the project root
  clientDistPath = path.join(__dirname, "../client/dist");
}

console.log(`Client dist path: ${clientDistPath}`);

// Serve static files from the client dist folder
app.use(express.static(clientDistPath));

// Register API routes first
const server = registerRoutes(app);

// Serve React app for all other routes - this must come after API routes
app.use((req, res) => {
  // Send all non-API requests to the React app
  const indexPath = path.join(clientDistPath, "index.html");
  console.log(`Serving index from: ${indexPath}`);
  res.sendFile(indexPath);
});

// Start API server on port 5000
server.listen(PORT, "0.0.0.0", () => {
  console.log(`API server running on http://0.0.0.0:${PORT}`);
});

// Start HTTP server on port 8000 for web traffic
const httpApp = express();
httpApp.use(express.static(clientDistPath));

// Forward all requests to index.html for React Router
httpApp.use((req, res) => {
  const indexPath = path.join(clientDistPath, "index.html");
  res.sendFile(indexPath);
});

httpApp.listen(HTTP_PORT, "0.0.0.0", () => {
  console.log(`HTTP server running on http://0.0.0.0:${HTTP_PORT}`);
});
