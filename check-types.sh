#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Checking for potential type mismatch issues..."

# Function to check for potential type mismatches
check_type_mismatches() {
    local file=$1
    local issues_found=0
    
    echo -e "\n📄 Checking ${file}..."
    
    # Check for number to string conversions
    if grep -n "Number(" "$file" | grep -v "//.*Number("; then
        echo -e "${YELLOW}⚠️  Found potential number conversions that might need toString():${NC}"
        grep -n "Number(" "$file" | grep -v "//.*Number(" | while read -r line; do
            echo -e "  ${YELLOW}Line $line${NC}"
            ((issues_found++))
        done
    fi
    
    # Check for string to number conversions
    if grep -n "toString()" "$file" | grep -v "//.*toString()"; then
        echo -e "${YELLOW}⚠️  Found potential string conversions that might need Number():${NC}"
        grep -n "toString()" "$file" | grep -v "//.*toString()" | while read -r line; do
            echo -e "  ${YELLOW}Line $line${NC}"
            ((issues_found++))
        done
    fi
    
    # Check for parseInt/parseFloat usage
    if grep -n "parseInt\|parseFloat" "$file" | grep -v "//.*parseInt\|//.*parseFloat"; then
        echo -e "${YELLOW}⚠️  Found parseInt/parseFloat conversions:${NC}"
        grep -n "parseInt\|parseFloat" "$file" | grep -v "//.*parseInt\|//.*parseFloat" | while read -r line; do
            echo -e "  ${YELLOW}Line $line${NC}"
            ((issues_found++))
        done
    fi
    
    # Check for type assertions
    if grep -n "as " "$file" | grep -v "//.*as "; then
        echo -e "${YELLOW}⚠️  Found type assertions:${NC}"
        grep -n "as " "$file" | grep -v "//.*as " | while read -r line; do
            echo -e "  ${YELLOW}Line $line${NC}"
            ((issues_found++))
        done
    fi
    
    return $issues_found
}

# Find all TypeScript files
TS_FILES=$(find . -name "*.ts" -not -path "*/node_modules/*" -not -path "*/dist/*")

# Counter for total issues
total_issues=0

# Check each TypeScript file
for file in $TS_FILES; do
    check_type_mismatches "$file"
    issues=$?
    total_issues=$((total_issues + issues))
done

# Print summary
echo -e "\n📊 Summary:"
if [ $total_issues -eq 0 ]; then
    echo -e "${GREEN}✅ No potential type mismatch issues found!${NC}"
else
    echo -e "${RED}❌ Found $total_issues potential type mismatch issues${NC}"
    echo -e "${YELLOW}⚠️  Please review the above locations and ensure proper type handling${NC}"
fi

# Run TypeScript compiler to check for actual type errors
echo -e "\n🔍 Running TypeScript compiler check..."
npx tsc --noEmit

# Exit with appropriate status code
if [ $total_issues -eq 0 ] && [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ All type checks passed!${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Type checks failed. Please fix the issues above.${NC}"
    exit 1
fi 