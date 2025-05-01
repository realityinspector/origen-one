import express from "express";
import cors from "cors";
import path from "path";
import { registerRoutes } from "./routes";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === "production" 
    ? "https://ai-tutor-app.replit.app" 
    : "http://localhost:5000",
  credentials: true
}));
app.use(express.json());

// Serve static files from client/dist in production
if (process.env.NODE_ENV === "production") {
  const clientDistPath = path.join(__dirname, "../client/dist");
  app.use(express.static(clientDistPath));
}

// Register routes
const server = registerRoutes(app);

// Serve React app for all non-API routes in production
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api/")) {
      res.sendFile(path.join(__dirname, "../client/dist/index.html"));
    }
  });
}

// Start server
server.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

