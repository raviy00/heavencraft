#!/bin/bash
# ============================================================
#  Heavencraft — Quick Redeploy Script
#  Run this whenever you push new code to GitHub.
#  It pulls, rebuilds the frontend, and restarts the backend.
# ============================================================

set -e

GREEN='\033[0;32m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

APP_DIR="$HOME/heavencraft"

echo -e "\n${CYAN}${BOLD}🔄 Redeploying Heavencraft...${NC}\n"

# 1. Pull latest code
echo "▶ Pulling latest code from GitHub..."
git -C "$APP_DIR" pull

# 2. Rebuild frontend
echo "▶ Rebuilding frontend..."
cd "$APP_DIR"
npm install --silent
npm run build

# 3. Update backend deps (in case package.json changed)
echo "▶ Updating backend dependencies..."
cd "$APP_DIR/server"
npm install --silent

# 4. Restart backend
echo "▶ Restarting backend..."
pm2 restart heavencraft-api --update-env

# 5. Reload Nginx (picks up any new static files)
echo "▶ Reloading Nginx..."
sudo systemctl reload nginx

echo -e "\n${GREEN}${BOLD}✅ Redeploy complete!${NC}"
echo -e "   Check status: ${BOLD}pm2 status${NC}"
echo -e "   View logs:    ${BOLD}pm2 logs heavencraft-api --lines 30${NC}"
echo ""
