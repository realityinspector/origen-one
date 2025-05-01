import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes";

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === "production" 
    ? "https://ai-tutor-app.example.com" 
    : "http://localhost:5000",
  credentials: true
}));
app.use(express.json());

// Register routes
const server = registerRoutes(app);

// Start server
server.listen(Number(PORT), () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
