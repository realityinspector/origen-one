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
exports.db = exports.pool = void 0;
exports.checkDatabaseConnection = checkDatabaseConnection;
exports.withRetry = withRetry;
const serverless_1 = require("@neondatabase/serverless");
const neon_serverless_1 = require("drizzle-orm/neon-serverless");
const ws_1 = __importDefault(require("ws"));
const schema = __importStar(require("../shared/schema"));
// Environment variables are accessed through the central config module
// Configure Neon to use ws instead of browser WebSocket
serverless_1.neonConfig.webSocketConstructor = ws_1.default;
// Configure the connection pool with more robust settings
exports.pool = new serverless_1.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 5000, // Return an error after 5 seconds if a connection cannot be established
    maxUses: 7500, // Close a connection after it has been used 7500 times
});
// Add event listeners to the pool for better error tracking
exports.pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
});
// Create a connection health check function
async function checkDatabaseConnection() {
    let client;
    try {
        client = await exports.pool.connect();
        await client.query('SELECT 1');
        console.log('Database connection successful');
        return true;
    }
    catch (error) {
        console.error('Database connection failed:', error);
        return false;
    }
    finally {
        if (client)
            client.release();
    }
}
// Set up a global keep-alive ping
const KEEP_ALIVE_INTERVAL = 60000; // 1 minute
setInterval(async () => {
    try {
        await exports.pool.query('SELECT 1');
        console.debug('Keep-alive ping successful');
    }
    catch (error) {
        console.error('Keep-alive ping failed:', error);
    }
}, KEEP_ALIVE_INTERVAL);
// Initialize the Drizzle ORM with the pool
exports.db = (0, neon_serverless_1.drizzle)(exports.pool, { schema });
// Expose a function to retry database operations with exponential backoff
async function withRetry(operation, maxRetries = 3, initialDelay = 300) {
    let retries = 0;
    while (true) {
        try {
            return await operation();
        }
        catch (error) {
            if (retries >= maxRetries ||
                // Don't retry on certain types of errors
                (error.code && ['23505', '23503', '42P01', '42703'].includes(error.code))) {
                throw error;
            }
            const delay = initialDelay * Math.pow(2, retries);
            console.log(`Retrying database operation in ${delay}ms. Attempt ${retries + 1}/${maxRetries}`);
            await new Promise(resolve => setTimeout(resolve, delay));
            retries++;
        }
    }
}
//# sourceMappingURL=db.js.map