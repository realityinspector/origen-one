#!/bin/bash

# Script to find all TypeScript type mismatch errors in the codebase
# Creates a mismatch-list.md file with the details

echo "# TypeScript Type Mismatch Report" > mismatch-list.md
echo "Generated on: $(date)" >> mismatch-list.md
echo "" >> mismatch-list.md

echo "Running TypeScript compiler to find type mismatches..."
ERRORS=$(npx tsc --noEmit 2>&1)

# Extract all type mismatch errors
echo "## Type Mismatch Errors" >> mismatch-list.md
echo "" >> mismatch-list.md

# Look for TS2367 (Types have no overlap) errors 
echo "### Type Comparison Errors (TS2367)" >> mismatch-list.md
echo "" >> mismatch-list.md
TS2367_ERRORS=$(echo "$ERRORS" | grep -E "TS2367")
if [ -n "$TS2367_ERRORS" ]; then
  echo "$TS2367_ERRORS" | while read -r line; do
    echo "- \`$line\`" >> mismatch-list.md
  done
else
  echo "No TS2367 errors found." >> mismatch-list.md
fi
echo "" >> mismatch-list.md

# Look for TS2345 (Argument type is not assignable) errors
echo "### Argument Type Mismatch Errors (TS2345)" >> mismatch-list.md
echo "" >> mismatch-list.md
TS2345_ERRORS=$(echo "$ERRORS" | grep -E "TS2345")
if [ -n "$TS2345_ERRORS" ]; then
  echo "$TS2345_ERRORS" | while read -r line; do
    echo "- \`$line\`" >> mismatch-list.md
  done
else
  echo "No TS2345 errors found." >> mismatch-list.md
fi
echo "" >> mismatch-list.md

# Look for other related type mismatch errors
echo "### Other Type Mismatch Errors" >> mismatch-list.md
echo "" >> mismatch-list.md
OTHER_ERRORS=$(echo "$ERRORS" | grep -E "TS2322|TS2366|TS2769|TS2339|TS2352|TS2411|TS2430")
if [ -n "$OTHER_ERRORS" ]; then
  echo "$OTHER_ERRORS" | while read -r line; do
    echo "- \`$line\`" >> mismatch-list.md
  done
else
  echo "No other type mismatch errors found." >> mismatch-list.md
fi
echo "" >> mismatch-list.md

# Look for potential type conversion issues
echo "## Potential Type Conversion Locations" >> mismatch-list.md
echo "" >> mismatch-list.md
echo "### String-Number Conversion Functions" >> mismatch-list.md
echo "" >> mismatch-list.md

# Find potential places where Number(), parseInt(), or toString() conversions are used
CONVERSIONS=$(grep -n -r "Number\(.*\)\|parseInt\(.*\)\|toString\(\)" --include="*.ts" server/)
if [ -n "$CONVERSIONS" ]; then
  echo "$CONVERSIONS" | while read -r line; do
    echo "- \`$line\`" >> mismatch-list.md
  done
else
  echo "No explicit type conversions found." >> mismatch-list.md
fi

echo "" >> mismatch-list.md
echo "## Summary" >> mismatch-list.md
echo "" >> mismatch-list.md
TOTAL_ERRORS=$(echo "$ERRORS" | grep -E "TS2367|TS2345|TS2322|TS2366|TS2769|TS2339|TS2352|TS2411|TS2430" | wc -l)
echo "Total type mismatch errors found: $TOTAL_ERRORS" >> mismatch-list.md

echo "Type mismatch report generated at mismatch-list.md"