#!/bin/bash
# ============================================================
#  Heavencraft — Oracle Cloud Always Free VM Deployment Script
#  Run this on a fresh Ubuntu 22.04 Oracle VM as the default
#  user (ubuntu). Do NOT run as root.
# ============================================================

set -e  # Exit immediately on any error

# ── Colours ─────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Colour

print_step()  { echo -e "\n${CYAN}${BOLD}▶ $1${NC}"; }
print_ok()    { echo -e "${GREEN}✔  $1${NC}"; }
print_warn()  { echo -e "${YELLOW}⚠  $1${NC}"; }
print_error() { echo -e "${RED}✘  $1${NC}"; }

# ── Config — EDIT THESE BEFORE RUNNING ──────────────────────
GITHUB_REPO="https://github.com/YOUR_GITHUB_USERNAME/heavencraft.git"
APP_DIR="$HOME/heavencraft"
DOMAIN=""           # Leave blank to use IP. Set to e.g. "play.heavencraft.net" for a domain.
SERVER_PORT=3001
# ────────────────────────────────────────────────────────────

echo -e "\n${BOLD}╔══════════════════════════════════════════╗"
echo -e "║   Heavencraft Oracle VM Deployment       ║"
echo -e "╚══════════════════════════════════════════╝${NC}\n"

# ── Derive the public IP of this VM ─────────────────────────
PUBLIC_IP=$(curl -s ifconfig.me || curl -s https://api.ipify.org)
SERVER_NAME="${DOMAIN:-$PUBLIC_IP}"
print_ok "Detected public IP: $PUBLIC_IP"
[[ -n "$DOMAIN" ]] && print_ok "Using domain: $DOMAIN" || print_warn "No domain set — using bare IP ($PUBLIC_IP)"

# ─────────────────────────────────────────────────────────────
# STEP 1 — System update
# ─────────────────────────────────────────────────────────────
print_step "Step 1/8 — Updating system packages"
sudo apt-get update -qq && sudo apt-get upgrade -y -qq
print_ok "System packages up to date"

# ─────────────────────────────────────────────────────────────
# STEP 2 — Install Node.js 20
# ─────────────────────────────────────────────────────────────
print_step "Step 2/8 — Installing Node.js 20"
if ! command -v node &>/dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - -qq
    sudo apt-get install -y nodejs -qq
    print_ok "Node.js $(node -v) installed"
else
    print_ok "Node.js already installed: $(node -v)"
fi

# ─────────────────────────────────────────────────────────────
# STEP 3 — Install tools (Git, Nginx, PM2, netfilter-persistent)
# ─────────────────────────────────────────────────────────────
print_step "Step 3/8 — Installing Nginx, Git, PM2, firewall tools"
sudo apt-get install -y git nginx iptables-persistent netfilter-persistent -qq
sudo npm install -g pm2 --silent
print_ok "Nginx, Git, PM2 installed"

# ─────────────────────────────────────────────────────────────
# STEP 4 — Clone / update the repo
# ─────────────────────────────────────────────────────────────
print_step "Step 4/8 — Cloning Heavencraft repository"

if [[ "$GITHUB_REPO" == *"YOUR_GITHUB_USERNAME"* ]]; then
    print_error "You must set GITHUB_REPO at the top of this script before running!"
    exit 1
fi

if [ -d "$APP_DIR/.git" ]; then
    print_warn "Repo already exists — pulling latest changes"
    git -C "$APP_DIR" pull
else
    git clone "$GITHUB_REPO" "$APP_DIR"
fi
print_ok "Repository ready at $APP_DIR"

# ─────────────────────────────────────────────────────────────
# STEP 5 — Set up Backend .env
# ─────────────────────────────────────────────────────────────
print_step "Step 5/8 — Configuring backend environment"

if [ ! -f "$APP_DIR/server/.env" ]; then
    print_warn "No server/.env found. Creating from template..."
    cp "$APP_DIR/deploy/server.env.template" "$APP_DIR/server/.env"
    # Patch the FRONTEND_URL and redirect URIs automatically
    sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=http://$SERVER_NAME|g" "$APP_DIR/server/.env"
    sed -i "s|DISCORD_REDIRECT_URI=.*|DISCORD_REDIRECT_URI=http://$SERVER_NAME/api/auth/discord/callback|g" "$APP_DIR/server/.env"
    sed -i "s|GOOGLE_REDIRECT_URI=.*|GOOGLE_REDIRECT_URI=http://$SERVER_NAME/api/auth/google/callback|g" "$APP_DIR/server/.env"
    sed -i "s|MICROSOFT_REDIRECT_URI=.*|MICROSOFT_REDIRECT_URI=http://$SERVER_NAME/api/auth/microsoft/callback|g" "$APP_DIR/server/.env"
    echo ""
    print_warn "────────────────────────────────────────────────────────"
    print_warn "  IMPORTANT: Fill in the real secrets in server/.env!"
    print_warn "  Run: nano $APP_DIR/server/.env"
    print_warn "  Required: MONGODB_URI, JWT_SECRET, DISCORD_CLIENT_SECRET,"
    print_warn "            GOOGLE_CLIENT_SECRET, EMAIL_PASS"
    print_warn "────────────────────────────────────────────────────────"
    read -p "  Press ENTER when you have saved the .env file..." _
else
    print_ok "server/.env already exists — updating URL fields"
    sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=http://$SERVER_NAME|g" "$APP_DIR/server/.env"
    sed -i "s|DISCORD_REDIRECT_URI=.*|DISCORD_REDIRECT_URI=http://$SERVER_NAME/api/auth/discord/callback|g" "$APP_DIR/server/.env"
    sed -i "s|GOOGLE_REDIRECT_URI=.*|GOOGLE_REDIRECT_URI=http://$SERVER_NAME/api/auth/google/callback|g" "$APP_DIR/server/.env"
    sed -i "s|MICROSOFT_REDIRECT_URI=.*|MICROSOFT_REDIRECT_URI=http://$SERVER_NAME/api/auth/microsoft/callback|g" "$APP_DIR/server/.env"
fi

# ─────────────────────────────────────────────────────────────
# STEP 6 — Build frontend + install backend deps
# ─────────────────────────────────────────────────────────────
print_step "Step 6/8 — Installing dependencies & building frontend"

# Write the frontend .env so Vite knows where the API is
cat > "$APP_DIR/.env.production" <<EOF
VITE_API_URL=http://$SERVER_NAME/api
EOF
print_ok "Frontend .env.production written (API → http://$SERVER_NAME/api)"

# Install & build frontend
cd "$APP_DIR"
npm install --silent
npm run build
print_ok "React/Vite frontend built → dist/"

# Install backend
cd "$APP_DIR/server"
npm install --silent
print_ok "Backend dependencies installed"

# ─────────────────────────────────────────────────────────────
# STEP 7 — Configure Nginx
# ─────────────────────────────────────────────────────────────
print_step "Step 7/8 — Configuring Nginx"

sudo tee /etc/nginx/sites-available/heavencraft > /dev/null <<NGINX
server {
    listen 80;
    server_name $SERVER_NAME;

    # Increase body size limit (useful for mod uploads, etc.)
    client_max_body_size 50M;

    # ── Serve React frontend (dist/) ──────────────────────────
    root $APP_DIR/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # ── Proxy all /api/* requests to Node.js backend ──────────
    location /api/ {
        proxy_pass         http://127.0.0.1:$SERVER_PORT;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade \$http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host \$host;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 120s;
    }

    # ── Gzip compression ─────────────────────────────────────
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;
    gzip_min_length 1000;

    # ── Security headers ─────────────────────────────────────
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
}
NGINX

# Enable site, disable default
sudo ln -sf /etc/nginx/sites-available/heavencraft /etc/nginx/sites-enabled/heavencraft
sudo rm -f /etc/nginx/sites-enabled/default

# Test config then restart
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
print_ok "Nginx configured and running"

# ─────────────────────────────────────────────────────────────
# STEP 8 — Open firewall ports (Oracle iptables + PM2 start)
# ─────────────────────────────────────────────────────────────
print_step "Step 8/8 — Opening firewall ports & starting backend with PM2"

# Oracle's internal iptables drops everything by default — open HTTP/HTTPS
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80  -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
# Backend port (only accessible from localhost via Nginx, but useful for debugging)
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport $SERVER_PORT -j ACCEPT
# Save rules so they survive reboots
sudo netfilter-persistent save
print_ok "Firewall rules saved"

# Start / restart the backend with PM2
cd "$APP_DIR/server"
pm2 delete heavencraft-api 2>/dev/null || true
pm2 start index.js --name heavencraft-api --time
pm2 save

# Register PM2 to auto-start on reboot
PM2_STARTUP=$(pm2 startup systemd -u "$USER" --hp "$HOME" | tail -1)
sudo bash -c "$PM2_STARTUP" 2>/dev/null || true
print_ok "PM2 started and registered for auto-start on reboot"

# ─────────────────────────────────────────────────────────────
# Done!
# ─────────────────────────────────────────────────────────────
echo -e "\n${GREEN}${BOLD}╔══════════════════════════════════════════════════════╗"
echo -e "║   ✅  Heavencraft deployed successfully!             ║"
echo -e "╚══════════════════════════════════════════════════════╝${NC}"
echo -e ""
echo -e "  🌐 Frontend :  ${BOLD}http://$SERVER_NAME${NC}"
echo -e "  🔌 API      :  ${BOLD}http://$SERVER_NAME/api/health${NC}"
echo -e "  📋 PM2 logs :  ${BOLD}pm2 logs heavencraft-api${NC}"
echo -e "  🔄 Redeploy :  ${BOLD}bash $APP_DIR/deploy/redeploy.sh${NC}"
echo -e ""
echo -e "${YELLOW}  NEXT STEPS:${NC}"
echo -e "  1. Open Oracle Security List → add Ingress rules for port 80 & 443"
echo -e "  2. Update Discord/Google OAuth redirect URIs in their dev portals"
[[ -n "$DOMAIN" ]] && echo -e "  3. Run: ${BOLD}bash $APP_DIR/deploy/setup_ssl.sh${NC}  ← HTTPS with Let's Encrypt"
echo ""
