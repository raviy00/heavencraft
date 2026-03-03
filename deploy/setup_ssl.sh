#!/bin/bash
# ============================================================
#  Heavencraft — HTTPS Setup with Let's Encrypt (Certbot)
#  Run AFTER deploy.sh, once your domain's DNS A record
#  points to this VM's public IP.
# ============================================================

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

APP_DIR="$HOME/heavencraft"

# ── Read the domain from .env.production ────────────────────
DOMAIN=$(grep VITE_API_URL "$APP_DIR/.env.production" | sed 's|.*https\?://||;s|/api||')

if [[ -z "$DOMAIN" || "$DOMAIN" =~ ^[0-9]+\. ]]; then
    echo -e "${RED}✘  No domain found (or it's an IP address).${NC}"
    echo "   Set DOMAIN in deploy.sh and re-run deploy.sh first."
    exit 1
fi

echo -e "\n${CYAN}${BOLD}🔒 Setting up HTTPS for: $DOMAIN${NC}\n"

# Install Certbot
echo "▶ Installing Certbot..."
sudo apt-get install -y certbot python3-certbot-nginx -qq

# Obtain + install certificate
echo "▶ Requesting Let's Encrypt certificate..."
sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "admin@$DOMAIN" --redirect

# Auto-renew (cron already set up by certbot, but confirm)
echo "▶ Enabling auto-renewal..."
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Update the frontend .env so API calls go over HTTPS
echo "▶ Updating frontend API URL to HTTPS..."
sed -i "s|http://|https://|g" "$APP_DIR/.env.production"

# Update server/.env OAuth redirect URIs to HTTPS
echo "▶ Updating server OAuth redirect URIs to HTTPS..."
sed -i "s|DISCORD_REDIRECT_URI=http://|DISCORD_REDIRECT_URI=https://|g" "$APP_DIR/server/.env"
sed -i "s|GOOGLE_REDIRECT_URI=http://|GOOGLE_REDIRECT_URI=https://|g" "$APP_DIR/server/.env"
sed -i "s|MICROSOFT_REDIRECT_URI=http://|MICROSOFT_REDIRECT_URI=https://|g" "$APP_DIR/server/.env"
sed -i "s|FRONTEND_URL=http://|FRONTEND_URL=https://|g" "$APP_DIR/server/.env"

# Rebuild frontend with HTTPS URLs
cd "$APP_DIR"
npm run build

# Restart backend to pick up new env vars, then reload Nginx
pm2 restart heavencraft-api --update-env
sudo systemctl reload nginx

echo -e "\n${GREEN}${BOLD}✅ HTTPS is live!${NC}"
echo -e "   Your site: ${BOLD}https://$DOMAIN${NC}"
echo -e "   API:       ${BOLD}https://$DOMAIN/api/health${NC}"
echo -e ""
echo -e "   Remember to update OAuth redirect URIs in:"
echo -e "   • Discord Developer Portal  → https://$DOMAIN/api/auth/discord/callback"
echo -e "   • Google Cloud Console      → https://$DOMAIN/api/auth/google/callback"
echo -e "   • Microsoft Azure Portal    → https://$DOMAIN/api/auth/microsoft/callback"
echo ""
