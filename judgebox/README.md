# 🚀 Judgebox Dedicated Worker Deployment

This folder contains the complete, standalone package to run the **CodePlatform Judgebox Worker** on a dedicated Linux Virtual Machine (e.g. Azure Ubuntu 22.04 / 24.04 LTS VM).

---

## Architecture Overview

```
[Azure Container Apps (Web API)]
             │
             ▼ (Pushes submissionId)
[Azure Service Bus Queue: 'submissions']
             │
             ▼ (Pulls submissionId with Peek-Lock)
[Dedicated Judgebox VM (This Worker)]
             │
             ▼ (Spawns disposable sandbox)
[Docker Engine: 'docker run --network none --read-only']
             │
             ▼ (Writes verdict & execution metrics)
[Azure PostgreSQL Flexible Server]
```

---

## 2-Minute Setup on Azure Linux VM

### Step 1: Copy this folder to your VM
```bash
# On your Linux VM (or clone repository):
mkdir -p ~/judgebox
cd ~/judgebox
```

### Step 2: Run the automated setup script
```bash
bash setup-vm.sh
```
This automatically:
- Installs Docker and the Docker Compose plugin.
- Configures Docker daemon permissions.
- Pre-pulls sandbox images (`python:3.12-alpine`, `gcc:latest`, `openjdk:21-slim`, `node:22-alpine`).
- Creates a `systemd` background service (`judgebox.service`) configured to start on VM boot.

### Step 3: Configure credentials in `.env`
```bash
nano .env
```
Fill in your two cloud connection strings:
```ini
DATABASE_URL="postgresql://codeplatform_admin:<password>@<your-db-fqdn>:5432/codeplatform?schema=public&sslmode=require"
AZURE_SERVICE_BUS_CONNECTION_STRING="Endpoint=sb://<your-namespace>.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=<your-key>"
AZURE_SERVICE_BUS_QUEUE_NAME="submissions"
MAX_CONCURRENT_JOBS=5
```

### Step 4: Start the Judgebox
```bash
sudo systemctl start judgebox
```

---

## Useful Operational Commands

| Action | Command |
| :--- | :--- |
| **Check Live Logs** | `sudo journalctl -u judgebox -f` or `docker compose logs -f` |
| **Check Status** | `sudo systemctl status judgebox` |
| **Restart Worker** | `sudo systemctl restart judgebox` |
| **Stop Worker** | `sudo systemctl stop judgebox` |
| **View Active Sandboxes** | `docker ps` |
