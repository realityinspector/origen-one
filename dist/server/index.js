"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const routes_1 = require("./routes");
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT || 5000);
const HTTP_PORT = Number(process.env.HTTP_PORT || 8000);
// Middleware
app.use((0, cors_1.default)({
    origin: true, // Allow requests from any origin in development
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static files from client/dist in all environments
const clientDistPath = path_1.default.join(__dirname, "../client/dist");
app.use(express_1.default.static(clientDistPath));
// Register API routes first
const server = (0, routes_1.registerRoutes)(app);
// Serve React app for all other routes - this must come after API routes
app.use((req, res) => {
    // Send all non-API requests to the React app
    res.sendFile(path_1.default.join(__dirname, "../client/dist/index.html"));
});
// Start API server on port 5000
server.listen(PORT, "0.0.0.0", () => {
    console.log(`API server running on http://0.0.0.0:${PORT}`);
});
// Start HTTP server on port 8000 for web traffic
const httpApp = (0, express_1.default)();
httpApp.use(express_1.default.static(clientDistPath));
// Forward all requests to index.html for React Router
httpApp.use((req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../client/dist/index.html"));
});
httpApp.listen(HTTP_PORT, "0.0.0.0", () => {
    console.log(`HTTP server running on http://0.0.0.0:${HTTP_PORT}`);
});
//# sourceMappingURL=index.js.map