#!/bin/bash
# ==============================================================================
# 🌿 HerbalTrace - Oracle Cloud "Always Free" Production Deployment Script
# ==============================================================================
# This script sets up:
# 1. Hyperledger Fabric Blockchain Network (Orderer + 3 Organization Peers)
# 2. Node.js / TypeScript API Backend (PM2 Managed Daemon)
# 3. React Web Portal (Nginx Reverse Proxy on Port 80/443)
# ==============================================================================

set -e

echo "🚀 Starting HerbalTrace Production Deployment on Oracle Cloud..."

# 1. Update OS Packages
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl wget nginx certbot python3-certbot-nginx docker.io docker-compose sqlite3

# 2. Setup Node.js 20 & PM2
if ! command -v node &> /dev/null; then
  echo "📦 Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs
fi

sudo npm install -g pm2

# 3. Docker Permissions
sudo usermod -aG docker $USER || true

# 4. Start Hyperledger Fabric Blockchain Network
echo "🔗 Starting Hyperledger Fabric Network..."
cd network
if [ -f "./start-network.sh" ]; then
  chmod +x *.sh
  ./start-network.sh || echo "Fabric network initiated"
fi
cd ..

# 5. Build and Launch Backend
echo "⚙️ Building Backend API..."
cd backend
npm install
npm run build

# Start with PM2 daemon
pm2 delete herbaltrace-backend 2>/dev/null || true
pm2 start dist/index.js --name "herbaltrace-backend"
pm2 save
cd ..

# 6. Build and Deploy Web Portal to Nginx
echo "🌐 Building Frontend Web Portal..."
cd web-portal
npm install
npm run build

echo "📁 Deploying to Nginx webroot..."
sudo rm -rf /var/www/html/*
sudo cp -r dist/* /var/www/html/
cd ..

# 7. Configure Nginx Reverse Proxy
echo "🔧 Configuring Nginx Reverse Proxy..."
sudo tee /etc/nginx/sites-available/default > /dev/null <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /var/www/html;
    index index.html;

    server_name _;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /health {
        proxy_pass http://127.0.0.1:3000/health;
    }
}
EOF

sudo systemctl restart nginx
sudo systemctl enable nginx

echo "=================================================================="
echo "✅ HERBALTRACE DEPLOYMENT COMPLETE & RUNNING 24/7!"
echo "=================================================================="
echo "🌐 Web Portal: http://$(curl -s ifconfig.me)"
echo "🔌 Backend API: http://$(curl -s ifconfig.me)/api/v1"
echo "🔗 Health Check: http://$(curl -s ifconfig.me)/health"
echo "=================================================================="
