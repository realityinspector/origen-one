
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

// Add middleware
httpApp.use(cors({
  origin: true,
  credentials: true
}));
httpApp.use(express.json());
httpApp.use(express.urlencoded({ extended: true }));

// Create a simple proxy middleware that forwards requests from the HTTP server to the API server
function createProxyMiddleware(targetPath: string) {
  return function(req: any, res: any) {
    console.log(`HTTP proxy: Forwarding ${req.method} request to ${targetPath}`);
    
    // Create a simple http request to the API server
    const options = {
      hostname: 'localhost',
      port: PORT, 
      path: targetPath,
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        // Forward cookies for authentication
        'Cookie': req.headers.cookie || ''
      }
    };
    
    const apiReq = require('http').request(options, (apiRes: any) => {
      // Copy status code 
      res.statusCode = apiRes.statusCode;
      
      // Copy headers (including cookies)
      Object.keys(apiRes.headers).forEach(key => {
        res.setHeader(key, apiRes.headers[key]);
      });
      
      // Collect data chunks
      let data = '';
      apiRes.on('data', (chunk: any) => {
        data += chunk;
      });
      
      // When the response is complete, send it back
      apiRes.on('end', () => {
        try {
          // Try to parse as JSON
          const json = JSON.parse(data);
          res.json(json);
        } catch (e) {
          // If not valid JSON, just send the raw data
          res.send(data);
        }
      });
    });
    
    // Handle errors
    apiReq.on('error', (error: any) => {
      console.error('Error forwarding request:', error);
      res.status(500).json({ error: 'Failed to forward request' });
    });
    
    // If this is a POST request, forward the body
    if (req.method === 'POST' && req.body) {
      apiReq.write(JSON.stringify(req.body));
    }
    
    apiReq.end();
  };
}

// Configure the routes with our proxy middleware
httpApp.post("/login", createProxyMiddleware("/api/login"));
httpApp.post("/register", createProxyMiddleware("/api/register"));
httpApp.post("/logout", createProxyMiddleware("/api/logout"));
httpApp.get("/user", createProxyMiddleware("/api/user"));

// Serve static files after API routes are defined
httpApp.use(express.static(clientDistPath));

// Forward all remaining requests to index.html for React Router
httpApp.use((req, res) => {
  const indexPath = path.join(clientDistPath, "index.html");
  res.sendFile(indexPath);
});

httpApp.listen(HTTP_PORT, "0.0.0.0", () => {
  console.log(`HTTP server running on http://0.0.0.0:${HTTP_PORT}`);
});
