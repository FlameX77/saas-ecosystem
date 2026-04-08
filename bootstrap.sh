#!/bin/bash
set -e

# ANSI Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌟 SaaS Ecosystem: Ultimate Migration Bootstrap${NC}"
echo "------------------------------------------------"

# 1. Environment Verification
echo -e "${YELLOW}🔍 Verifying environment...${NC}"
if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js (v20+) first.${NC}"
    exit 1
fi

# 2. Package Manager Setup
if ! command -v pnpm >/dev/null 2>&1; then
    echo -e "${YELLOW}📦 pnpm not found. Attempting to install via corepack...${NC}"
    npm install -g pnpm || { echo -e "${RED}❌ Failed to install pnpm. Please install it manually.${NC}"; exit 1; }
fi

# 3. Turbo Setup
if ! command -v turbo >/dev/null 2>&1; then
    echo -e "${YELLOW}🚀 turbo not found. Installing globally...${NC}"
    pnpm add -g turbo
fi

# 4. Install Dependencies
echo -e "${BLUE}📦 Installing all workspace dependencies...${NC}"
pnpm install

# 5. Environment File Initialization
echo -e "${BLUE}🔑 Initializing environment variables from examples...${NC}"
# Find all .env.example files and copy them to .env if they don't exist
find apps -name ".env.example" | while read -r file; do
    target="${file%.example}"
    if [ ! -f "$target" ]; then
        cp "$file" "$target"
        echo "   ✅ Created $target"
    else
        echo "   ℹ️  $target already exists, skipping."
    fi
done

# 6. Shared Packages Build
echo -e "${BLUE}🏗️  Building shared internal packages...${NC}"
turbo build --filter "./packages/*"

# 7. Final Health Check
echo "------------------------------------------------"
echo -e "${GREEN}✅ SaaS Ecosystem is ready to go!${NC}"
echo -e "${BLUE}📁 Apps detected:${NC}"
ls -1 apps/

echo -e "\n${YELLOW}👉 Next Steps:${NC}"
echo "1. Fill in the required API keys in your .env files."
echo "2. Refer to MIGRATION_GUIDE.md for specific SaaS requirements."
echo "3. Run 'turbo dev' to launch the entire ecosystem."
echo "------------------------------------------------"
