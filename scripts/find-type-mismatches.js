#!/usr/bin/env node

/**
 * This script scans TypeScript files for type mismatch errors and generates a report
 * showing all locations where string/number type conversion issues occur.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const util = require('util');

// Configure directories to scan
const SCAN_DIRECTORIES = ['server', 'shared', 'scripts'];
const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'build'];
const OUTPUT_FILE = 'type-mismatch-report.md';

// Type mismatch patterns to look for
const TYPE_MISMATCH_PATTERNS = [
  { pattern: /Type '(string|number)' is not assignable to type '(number|string)'/g, description: "String vs Number Type Mismatch" },
  { pattern: /This comparison appears to be unintentional because the types '(string|number)' and '(number|string)' have no overlap/g, description: "String/Number Comparison Error" },
  { pattern: /Argument of type '(string|number)(\s\|\s(string|number))?' is not assignable to parameter of type '(string|number)'/g, description: "Function Argument Type Mismatch" }
];

// Store found issues
const issues = [];

/**
 * Run TypeScript compiler to get errors
 */
function runTsCheck() {
  try {
    console.log('Running TypeScript compiler check...');
    
    // The command below may fail, but we want to capture its output
    try {
      execSync('npx tsc --noEmit', { encoding: 'utf8' });
    } catch (error) {
      // That's expected - we want to parse the error output
      return error.stdout || error.stderr;
    }
    
    return '';
  } catch (error) {
    console.error('Error running TypeScript check:', error);
    return '';
  }
}

/**
 * Parse TypeScript compiler output for type mismatch errors
 */
function parseTypeErrors(tscOutput) {
  const lines = tscOutput.split('\n');
  const errors = [];
  
  let currentFile = null;
  let lineNumber = null;
  
  for (const line of lines) {
    // File location pattern: fileName(lineNumber,columnNumber)
    const fileMatch = line.match(/^(.+)\((\d+),(\d+)\):/);
    if (fileMatch) {
      currentFile = fileMatch[1];
      lineNumber = parseInt(fileMatch[2]);
      
      // Skip files in node_modules
      if (IGNORE_DIRS.some(dir => currentFile.includes(dir))) {
        currentFile = null;
        continue;
      }
      
      // Check if this is a type mismatch error
      const errorDesc = line.split(': ')[1];
      if (errorDesc) {
        for (const pattern of TYPE_MISMATCH_PATTERNS) {
          if (pattern.pattern.test(errorDesc)) {
            errors.push({
              file: currentFile,
              line: lineNumber,
              message: errorDesc.trim(),
              type: pattern.description
            });
            break;
          }
        }
      }
    }
  }
  
  return errors;
}

/**
 * Scan specific files for potential type mismatches
 */
function scanSourceFiles() {
  console.log('Scanning source files for additional type issue patterns...');
  const sourceIssues = [];
  
  function scanFile(filePath) {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;
    
    // Skip files in ignored directories
    if (IGNORE_DIRS.some(dir => filePath.includes(dir))) return;
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      // Look for common type conversion patterns
      const patterns = [
        { pattern: /parseInt\(.*\)/g, description: "String to Number conversion" },
        { pattern: /toString\(\)/g, description: "Number to String conversion" },
        { pattern: /Number\(/g, description: "String to Number conversion" },
        { pattern: /\.toString\(\)/g, description: "Number to String conversion" },
        { pattern: /===|!==|==|!=/g, description: "Equality comparison that might involve type coercion" }
      ];
      
      lines.forEach((line, index) => {
        for (const pattern of patterns) {
          if (pattern.pattern.test(line)) {
            if (line.includes('string') && line.includes('number')) {
              sourceIssues.push({
                file: filePath,
                line: index + 1,
                message: line.trim(),
                type: pattern.description,
                code: line.trim()
              });
            }
          }
        }
      });
    } catch (error) {
      console.error(`Error scanning file ${filePath}:`, error);
    }
  }
  
  function scanDirectory(directory) {
    try {
      const items = fs.readdirSync(directory);
      for (const item of items) {
        const itemPath = path.join(directory, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory() && !IGNORE_DIRS.includes(item)) {
          scanDirectory(itemPath);
        } else if (stats.isFile()) {
          scanFile(itemPath);
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${directory}:`, error);
    }
  }
  
  // Scan directories
  for (const dir of SCAN_DIRECTORIES) {
    if (fs.existsSync(dir)) {
      scanDirectory(dir);
    }
  }
  
  return sourceIssues;
}

/**
 * Generate a readable report
 */
function generateReport(compilerIssues, sourceIssues) {
  console.log('Generating type mismatch report...');
  
  let report = `# TypeScript Type Mismatch Report\n\n`;
  report += `Generated on: ${new Date().toLocaleString()}\n\n`;
  
  // Add compiler errors section
  report += `## Compiler-Detected Type Mismatches\n\n`;
  if (compilerIssues.length === 0) {
    report += `No compiler-detected type mismatches found.\n\n`;
  } else {
    // Group by file
    const fileGroups = {};
    compilerIssues.forEach(issue => {
      if (!fileGroups[issue.file]) {
        fileGroups[issue.file] = [];
      }
      fileGroups[issue.file].push(issue);
    });
    
    for (const [file, issues] of Object.entries(fileGroups)) {
      report += `### ${file}\n\n`;
      issues.forEach(issue => {
        report += `- **Line ${issue.line}**: ${issue.message} (${issue.type})\n`;
      });
      report += `\n`;
    }
  }
  
  // Add source scan section
  report += `## Potential Type Conversion Locations\n\n`;
  if (sourceIssues.length === 0) {
    report += `No additional type conversion patterns found.\n\n`;
  } else {
    // Group by file
    const fileGroups = {};
    sourceIssues.forEach(issue => {
      if (!fileGroups[issue.file]) {
        fileGroups[issue.file] = [];
      }
      fileGroups[issue.file].push(issue);
    });
    
    for (const [file, issues] of Object.entries(fileGroups)) {
      report += `### ${file}\n\n`;
      issues.forEach(issue => {
        report += `- **Line ${issue.line}**: ${issue.type}\n`;
        report += `  \`${issue.code}\`\n`;
      });
      report += `\n`;
    }
  }
  
  // Add recommendations
  report += `## Recommendations\n\n`;
  report += `### General Approach for String/Number Type Mismatches\n\n`;
  report += `1. **Use consistent types in database schema and application code**\n`;
  report += `   - If IDs are strings in the schema, use strings throughout the application\n`;
  report += `   - If IDs are numbers in the schema, use numbers throughout the application\n\n`;
  report += `2. **Add explicit type conversions at boundaries**\n`;
  report += `   - Convert types at API boundaries or database interfaces\n`;
  report += `   - Use \`toString()\` for number → string conversion\n`;
  report += `   - Use \`Number()\` or \`parseInt()\` for string → number conversion\n\n`;
  report += `3. **Use TypeScript type guards for runtime safety**\n`;
  report += `   - \`typeof value === 'string' ? parseInt(value) : value\`\n\n`;
  report += `4. **For deployment, consider using transpile-only mode**\n`;
  report += `   - Add \`TS_NODE_TRANSPILE_ONLY=true\` to your environment variables\n`;
  report += `   - This allows the application to run despite type mismatches\n\n`;
  
  fs.writeFileSync(OUTPUT_FILE, report, 'utf8');
  console.log(`Report generated: ${OUTPUT_FILE}`);
}

// Main execution
(async function main() {
  console.log('Starting type mismatch detection...');
  
  const tscOutput = runTsCheck();
  const compilerIssues = parseTypeErrors(tscOutput);
  const sourceIssues = scanSourceFiles();
  
  generateReport(compilerIssues, sourceIssues);
  
  console.log(`Found ${compilerIssues.length} compiler type mismatches and ${sourceIssues.length} potential conversion points.`);
  console.log('Type mismatch detection completed.');
})();