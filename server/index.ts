import express from "express";
import cors from "cors";
import path from "path";
import { registerRoutes } from "./routes";

const app = express();
const PORT = process.env.PORT || 5000;

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

// Start server
server.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

