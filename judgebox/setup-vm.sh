#!/usr/bin/env bash
# ==============================================================================
# JUDGEBOX VM AUTOMATED SETUP SCRIPT (Ubuntu 22.04 / 24.04 LTS)
# Installs Docker, configures permissions, pre-pulls sandbox images, and starts worker
# ==============================================================================

set -euo pipefail

echo "🚀 [1/5] Updating package manager & installing prerequisites..."
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release git htop

echo "🐳 [2/5] Installing Docker Engine & Docker Compose Plugin..."
if ! command -v docker &> /dev/null; then
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi

sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker "$USER" || true

echo "📦 [3/5] Pre-pulling lightweight compiler sandbox execution images..."
# Pre-pulling common language runtime images so first-run student executions are instant
docker pull python:3.12-alpine || true
docker pull gcc:latest || true
docker pull openjdk:21-slim || true
docker pull node:22-alpine || true

echo "⚙️ [4/5] Checking environment configuration..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ ! -f "$SCRIPT_DIR/.env" ]; then
    if [ -f "$SCRIPT_DIR/.env.example" ]; then
        cp "$SCRIPT_DIR/.env.example" "$SCRIPT_DIR/.env"
        echo "⚠️ Created $SCRIPT_DIR/.env from .env.example. Please update your connection strings!"
    fi
fi

echo "🔥 [5/5] Creating Systemd Service for Auto-Start on Boot..."
sudo tee /etc/systemd/system/judgebox.service > /dev/null <<EOF
[Unit]
Description=CodePlatform Judgebox Worker Microservice
After=docker.service
Requires=docker.service

[Service]
Type=simple
WorkingDirectory=${SCRIPT_DIR}
ExecStart=/usr/bin/docker compose up
ExecStop=/usr/bin/docker compose down
Restart=always
RestartSec=5s
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable judgebox.service

echo ""
echo "=========================================================================="
echo "✅ Judgebox setup complete!"
echo "1. Edit your credentials in: $SCRIPT_DIR/.env"
echo "2. Start the service:        sudo systemctl start judgebox"
echo "3. View live worker logs:    sudo journalctl -u judgebox -f"
echo "=========================================================================="
