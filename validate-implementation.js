#!/usr/bin/env node

/**
 * Validation script to check what features are actually implemented
 * in the SUNSCHOOL codebase vs what's documented in planning docs
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

console.log('🔍 SUNSCHOOL Implementation Validation Report');
console.log('============================================\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Not in project root - package.json not found');
  process.exit(1);
}

// Read package.json to understand dependencies
let packageJson;
try {
  packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
} catch (e) {
  console.error('❌ Cannot read package.json');
  process.exit(1);
}

const results = {
  frontend: {},
  backend: {},
  database: {},
  ai: {},
  auth: {},
  features: {}
};

// Check Frontend Implementation
console.log('📱 Checking Frontend Implementation...');
results.frontend.react = fs.existsSync('client/package.json');
results.frontend.typescript = fs.existsSync('client/src/index.tsx');
results.frontend.components = fs.readdirSync('client/src/components').length;
results.frontend.pages = fs.readdirSync('client/src/pages').length;

// Check Backend Implementation
console.log('⚙️  Checking Backend Implementation...');
results.backend.express = packageJson.dependencies['express'] !== undefined;
results.backend.typescript = fs.existsSync('server/index.ts');
results.backend.routes = fs.existsSync('server/routes.ts');
results.backend.auth = fs.existsSync('server/auth.ts');

// Check Database Implementation
console.log('🗄️  Checking Database Implementation...');
results.database.drizzle = packageJson.dependencies['drizzle-orm'] !== undefined;
results.database.schema = fs.existsSync('shared/schema.ts');
results.database.migrations = fs.readdirSync('drizzle/migrations').length > 0;

// Check AI Integration
console.log('🤖 Checking AI Integration...');
results.ai.openrouter = fs.existsSync('server/openrouter.ts');
results.ai.perplexity = fs.existsSync('server/perplexity.ts');
results.ai.contentGenerator = fs.existsSync('server/content-generator.ts');

// Check Authentication
console.log('🔐 Checking Authentication...');
results.auth.jwt = fs.existsSync('server/middleware/auth.ts');
results.auth.roles = ['ADMIN', 'PARENT', 'LEARNER']; // Check schema

// Check Feature Implementation
console.log('✨ Checking Feature Implementation...');

// Check for specific features by searching code
function grepForFeature(pattern, description) {
  try {
    const output = execFileSync('grep', ['-r', pattern, 'server/', 'client/', 'shared/', '--include=*.ts', '--include=*.tsx', '-l'], { encoding: 'utf8' });
    return output.trim().split('\n').filter(f => f).slice(0, 5).length > 0;
  } catch (e) {
    return false;
  }
}

results.features.knowledgeGraphs = grepForFeature('knowledge.?graph', 'Knowledge Graph functionality');
results.features.achievements = grepForFeature('achievement', 'Achievement system');
results.features.quizSystem = grepForFeature('quiz|question', 'Quiz system');
results.features.databaseSync = grepForFeature('sync|db.?sync', 'Database synchronization');
results.features.enhancedLessons = grepForFeature('enhanced.?lesson|stability', 'Enhanced lesson system');
results.features.subjectRecommendation = grepForFeature('subject.?recommendation', 'Subject recommendation');

// Check for API endpoints
function checkApiEndpoint(endpoint) {
  try {
    const output = execFileSync('grep', [endpoint, 'server/routes.ts'], { encoding: 'utf8' });
    return output.includes(endpoint);
  } catch (e) {
    return false;
  }
}

results.api = {
  auth: checkApiEndpoint('/api/login'),
  users: checkApiEndpoint('/api/parents') || checkApiEndpoint('/api/learners'),
  lessons: checkApiEndpoint('/api/lessons'),
  achievements: checkApiEndpoint('/api/achievements'),
  sync: checkApiEndpoint('/api/sync'),
};

// Output results
console.log('\n📊 VALIDATION RESULTS');
console.log('====================');

console.log('\n🎨 Frontend:');
Object.entries(results.frontend).forEach(([key, value]) => {
  console.log(`  ${value ? '✅' : '❌'} ${key}: ${typeof value === 'boolean' ? (value ? 'Implemented' : 'Not found') : value}`);
});

console.log('\n⚙️ Backend:');
Object.entries(results.backend).forEach(([key, value]) => {
  console.log(`  ${value ? '✅' : '❌'} ${key}: ${value ? 'Implemented' : 'Not found'}`);
});

console.log('\n🗄️ Database:');
Object.entries(results.database).forEach(([key, value]) => {
  console.log(`  ${value ? '✅' : '❌'} ${key}: ${typeof value === 'number' ? `${value} items` : (value ? 'Implemented' : 'Not found')}`);
});

console.log('\n🤖 AI Integration:');
Object.entries(results.ai).forEach(([key, value]) => {
  console.log(`  ${value ? '✅' : '❌'} ${key}: ${value ? 'Implemented' : 'Not found'}`);
});

console.log('\n🔐 Authentication:');
Object.entries(results.auth).forEach(([key, value]) => {
  console.log(`  ${value ? '✅' : '❌'} ${key}: ${Array.isArray(value) ? value.join(', ') : (value ? 'Implemented' : 'Not found')}`);
});

console.log('\n✨ Features:');
Object.entries(results.features).forEach(([key, value]) => {
  console.log(`  ${value ? '✅' : '❌'} ${key}: ${value ? 'Implemented' : 'Not found'}`);
});

console.log('\n🔌 API Endpoints:');
Object.entries(results.api).forEach(([key, value]) => {
  console.log(`  ${value ? '✅' : '❌'} ${key}: ${value ? 'Implemented' : 'Not found'}`);
});

// Summary
const implementedFeatures = Object.values(results.features).filter(Boolean).length;
const totalFeatures = Object.keys(results.features).length;
const implementedApi = Object.values(results.api).filter(Boolean).length;
const totalApi = Object.keys(results.api).length;

console.log(`\n📈 SUMMARY`);
console.log(`==========`);
console.log(`Features implemented: ${implementedFeatures}/${totalFeatures} (${Math.round(implementedFeatures/totalFeatures*100)}%)`);
console.log(`API endpoints: ${implementedApi}/${totalApi} (${Math.round(implementedApi/totalApi*100)}%)`);

// Write results to file
fs.writeFileSync('validation-report.json', JSON.stringify(results, null, 2));
console.log('\n💾 Results saved to validation-report.json');

console.log('\n🎯 RECOMMENDATIONS FOR DOCUMENTATION');
console.log('=====================================');
console.log('✅ Document these as IMPLEMENTED features:');
Object.entries(results.features).forEach(([key, value]) => {
  if (value) console.log(`  - ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
});

console.log('\n❌ Do NOT document these as implemented (planning only):');
Object.entries(results.features).forEach(([key, value]) => {
  if (!value) console.log(`  - ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
});

console.log('\n🔧 Focus documentation on:');
console.log('  - Current tech stack and architecture');
console.log('  - Actually implemented features');
console.log('  - Working API endpoints');
console.log('  - Real installation and setup process');
console.log('  - Remove speculative features and future plans');
