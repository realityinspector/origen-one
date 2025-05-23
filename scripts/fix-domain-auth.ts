/**
 * This script fixes TypeScript type issues and deployment errors
 * related to the sunschool.xyz domain authentication integration.
 */
import * as fs from 'fs';
import * as path from 'path';

// File paths to fix
const ROUTES_PATH = path.join(__dirname, '../server/routes.ts');
const AUTH_PATH = path.join(__dirname, '../server/auth.ts');

function fixRoutesFile() {
  console.log('Fixing routes.ts file...');
  let content = fs.readFileSync(ROUTES_PATH, 'utf8');

  // Fix type conversion issues (type 'number' is not assignable to type 'string')
  // This usually happens with IDs that need to be strings for the storage layer
  const stringConversionFixes = [
    {
      search: /storage\.getSyncConfigsByParentId\(req\.user\.id\)/g,
      replace: 'storage.getSyncConfigsByParentId(req.user.id.toString())'
    },
    {
      search: /storage\.getUserByParentId\(req\.user\.id\)/g,
      replace: 'storage.getUserByParentId(req.user.id.toString())'
    },
    {
      search: /await storage\.getUserById\(userId\)/g,
      replace: 'await storage.getUserById(userId.toString())'
    },
    {
      search: /storage\.getLearnersForParent\(req\.user\.id\)/g,
      replace: 'storage.getLearnersForParent(req.user.id.toString())'
    },
    {
      search: /storage\.getLearnersByParentId\(req\.user\.id\)/g,
      replace: 'storage.getLearnersByParentId(req.user.id.toString())'
    }
  ];

  for (const fix of stringConversionFixes) {
    content = content.replace(fix.search, fix.replace);
  }

  // Fix return type errors
  const responseTypeFixes = [
    {
      search: /app\.get\("\/api\/reports", isAuthenticated, asyncHandler\(async \(req: AuthRequest, res\)/g,
      replace: 'app.get("/api/reports", isAuthenticated, asyncHandler(async (req: AuthRequest, res: Response)'
    },
    {
      search: /app\.get\("\/api\/sync-configs", hasRole\(\["PARENT"\]\), asyncHandler\(async \(req: AuthRequest, res\)/g,
      replace: 'app.get("/api/sync-configs", hasRole(["PARENT"]), asyncHandler(async (req: AuthRequest, res: Response)'
    }
  ];

  for (const fix of responseTypeFixes) {
    content = content.replace(fix.search, fix.replace);
  }

  fs.writeFileSync(ROUTES_PATH, content);
  console.log('routes.ts file fixed successfully!');
}

function fixAuthFile() {
  console.log('Fixing auth.ts file...');
  let content = fs.readFileSync(AUTH_PATH, 'utf8');

  // Fix syntax errors (closing brackets)
  const syntaxFixes = [
    {
      search: /};\s*}\)\);(\s*}\);)/g,
      replace: '  });\n}'
    },
    {
      search: /app\.get\("\/api\/user", authenticateJwt, asyncHandler\(async \(req: AuthRequest, res: Response\)/g,
      replace: 'app.get("/api/user", authenticateJwt, asyncHandler(async (req: AuthRequest, res: Response)'
    }
  ];

  for (const fix of syntaxFixes) {
    content = content.replace(fix.search, fix.replace);
  }

  // Add proper typing for generateToken to handle number | string
  const tokenGenerationFix = {
    search: /export function generateToken\(user: { id: string, role: string }\): string {/g,
    replace: 'export function generateToken(user: { id: string | number, role: string }): string {\n  const userId = typeof user.id === "number" ? user.id.toString() : user.id;'
  };

  content = content.replace(
    tokenGenerationFix.search, 
    tokenGenerationFix.replace
  );

  // Update payload construction with stringified userId
  content = content.replace(
    /const payload: JwtPayload = {\s*userId: user\.id,/g,
    'const payload: JwtPayload = {\n    userId: userId,'
  );

  fs.writeFileSync(AUTH_PATH, content);
  console.log('auth.ts file fixed successfully!');
}

function main() {
  console.log('🛠️ Running domain authentication fixes for sunschool.xyz integration');
  fixRoutesFile();
  fixAuthFile();
  console.log('✅ All fixes applied successfully!');
}

main();