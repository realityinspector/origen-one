"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const routes_1 = require("./routes");
const neon_serverless_1 = require("drizzle-orm/neon-serverless");
const serverless_1 = require("@neondatabase/serverless");
const migrator_1 = require("drizzle-orm/neon-serverless/migrator");
const ws_1 = __importDefault(require("ws"));
const schema = __importStar(require("../shared/schema"));
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT || 5000);
// Run database migrations on startup
async function runMigrations() {
    try {
        console.log('Running database migrations...');
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL is required');
        }
        // Configure Neon to use ws instead of browser WebSocket
        serverless_1.neonConfig.webSocketConstructor = ws_1.default;
        const pool = new serverless_1.Pool({ connectionString: process.env.DATABASE_URL });
        const db = (0, neon_serverless_1.drizzle)(pool, { schema });
        const migrationsFolder = path_1.default.resolve('drizzle', 'migrations');
        await (0, migrator_1.migrate)(db, { migrationsFolder });
        console.log('✓ Database migrations applied successfully!');
        await pool.end();
    }
    catch (error) {
        console.error('Error applying migrations:', error);
        // Don't exit - allow server to start even if migrations fail
        // This prevents deployment failures for already-applied migrations
    }
}
// Run migrations before starting server
runMigrations().then(() => {
    console.log('Migration check complete, starting server...');
}).catch((err) => {
    console.error('Migration check failed:', err);
});
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
    // For development, use the path relative to the project root
    clientDistPath = path_1.default.join(process.cwd(), "client/dist");
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