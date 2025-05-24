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
const PORT = Number(process.env.PORT || 8000);
// Middleware
// Enhanced CORS to specifically handle sunschool.xyz domain
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl requests)
        if (!origin)
            return callback(null, true);
        // Define allowed origins
        const allowedOrigins = [
            'https://sunschool.xyz',
            'http://sunschool.xyz',
            'https://www.sunschool.xyz',
            'http://localhost:5000',
            'http://localhost:3000'
        ];
        // Check if the request origin is in our allowed list
        if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('replit.dev')) {
            callback(null, true);
        }
        else {
            // Log the request origin for debugging
            console.log(`CORS request from origin: ${origin}`);
            // Still allow it for now during development
            callback(null, true);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-Sunschool-Auth']
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Determine the correct client dist path based on environment
let clientDistPath;
if (process.env.NODE_ENV === 'production') {
    clientDistPath = path_1.default.join(process.cwd(), "client/dist");
}
else {
    clientDistPath = path_1.default.join(__dirname, "../client/dist");
}
console.log(`Client dist path: ${clientDistPath}`);
// Serve static files from the client dist folder
app.use(express_1.default.static(clientDistPath));
// Register API routes first
const server = (0, routes_1.registerRoutes)(app);
// Serve React app for all other routes - this must come after API routes
app.use((req, res) => {
    const indexPath = path_1.default.join(clientDistPath, "index.html");
    console.log(`Serving index from: ${indexPath}`);
    res.sendFile(indexPath);
});
// Start server
server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    // Signal that server is ready for connections
    console.log(`Server ready to accept connections on port ${PORT}`);
});
//# sourceMappingURL=index.js.map