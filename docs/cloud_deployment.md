# Cloud Deployment & 24/7 Autonomous Operation Guide

This document specifies the deployment architecture to run **Why Smart Money AI** autonomously 24 hours a day, 7 days a week, 365 days a year—ensuring the **5:00 AM America/Toronto** Morning Intelligence Brief, Pre-Open 9:15 AM refresh, and Telegram alert dispatch execute seamlessly **even when your Acer Windows laptop is completely turned off or disconnected**.

---

## Architecture Overview

```
                               ┌────────────────────────────────────────────────────────┐
                               │                    Public Internet                     │
                               └───────────┬────────────────────────────────┬───────────┘
                                           │ HTTPS (443)                    │
                                           ▼                                ▼
                               ┌─────────────────────────┐      ┌───────────────────────┐
                               │     Next.js Dashboard   │      │   Telegram Bot API    │
                               │  (Vercel / Cloud Port)  │      │  (Push Notifications) │
                               └───────────┬─────────────┘      └───────────▲───────────┘
                                           │ REST / WebSocket               │
                                           ▼                                │
                               ┌────────────────────────────────────────────┴───────────┐
                               │      FastAPI Analytics & Machine Learning Backend       │
                               │     (Cloud VPS / Docker Container / Port 8000)         │
                               │                                                        │
                               │  • Background APScheduler (5:00 AM America/Toronto)    │
                               │  • Purged Walk-Forward ML Inference (HistGradient)     │
                               │  • Fail-Closed SEC 13F & Off-Exchange Data Engine      │
                               │  • Realistic Paper Trading Matcher & Position Limits   │
                               └───────────┬────────────────────────────────┬───────────┘
                                           │                                │
                                           ▼                                ▼
                               ┌─────────────────────────┐      ┌───────────────────────┐
                               │  PostgreSQL 16 Database │      │ Immutable Brief Store │
                               │  (Cloud Volume / DBaaS) │      │  (reports/*.json)     │
                               └─────────────────────────┘      └───────────────────────┘
```

---

## Strategy A: Dedicated Cloud VPS ($4–$6/month on DigitalOcean, Linode, Hetzner, or AWS EC2) [RECOMMENDED]

Running on a Linux Virtual Private Server (Ubuntu 22.04 LTS or 24.04 LTS) offers the simplest, most reliable 24/7 autonomous scheduling. APScheduler runs persistently in Python memory with exact timezone synchronization.

### 1. Provision Your Server
- **OS:** Ubuntu 22.04 or 24.04 LTS
- **Specs:** 2 vCPU, 2 GB RAM minimum (e.g. DigitalOcean Basic Droplet or Hetzner CX22)
- **Timezone:** Leave server UTC or set to Toronto (`sudo timedatectl set-timezone America/Toronto`)

### 2. Install Dependencies & Clone Code
```bash
sudo apt update && sudo apt install -y python3.12 python3.12-venv python3-pip nodejs npm git caddy
git clone https://github.com/your-username/why-smart-money.git /home/ubuntu/why-smart-money
cd /home/ubuntu/why-smart-money
```

### 3. Backend Setup
```bash
cd /home/ubuntu/why-smart-money/backend
python3.12 -m venv venv
./venv/bin/pip install --upgrade pip
./venv/bin/pip install -r requirements.txt
cp .env.example .env
# Edit .env with your provider keys or leave blank for automatic DEMO FEED
nano .env
```

### 4. Frontend Setup
```bash
cd /home/ubuntu/why-smart-money/frontend
npm install
npm run build
```

### 5. Enable Systemd Background Daemons
Copy the provided unit files into systemd:
```bash
sudo cp /home/ubuntu/why-smart-money/systemd/why-smart-money-backend.service /etc/systemd/system/
sudo cp /home/ubuntu/why-smart-money/systemd/why-smart-money-frontend.service /etc/systemd/system/

sudo systemctl daemon-reload
sudo systemctl enable --now why-smart-money-backend
sudo systemctl enable --now why-smart-money-frontend
```

Check status:
```bash
sudo systemctl status why-smart-money-backend
sudo journalctl -u why-smart-money-backend -f
```

### 6. Reverse Proxy with Automated TLS (Caddy)
Edit `/etc/caddy/Caddyfile`:
```caddy
yourdomain.com {
    reverse_proxy localhost:3000
}

api.yourdomain.com {
    reverse_proxy localhost:8000
}
```
Reload Caddy:
```bash
sudo systemctl reload caddy
```
*Caddy automatically provisions and renews free Let's Encrypt SSL/TLS certificates.*

---

## Strategy B: Docker Compose Multi-Container Production

For containerized cloud environments:
1. Copy [docker-compose.prod.yml](file:///c:/Users/steve/OneDrive/Desktop/smart%20money/docker-compose.prod.yml) to your server.
2. Launch with a single command:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```
3. Verify running containers:
```bash
docker ps
docker logs -f why_smart_money_backend_prod
```

The `restart: always` flag ensures all services, schedules, and database containers automatically resume after any host reboot.

---

## Strategy C: Serverless (Google Cloud Run + Cloud Scheduler)

If you prefer zero-server maintenance:
1. Deploy the Backend Docker container to **Google Cloud Run** with minimum 1 instance or scheduled wakeups.
2. Set up **GCP Cloud Scheduler**:
   - **Frequency:** `0 5 * * 1-5` (5:00 AM Monday–Friday)
   - **Timezone:** `America/Toronto`
   - **Target:** HTTP `POST https://your-backend.run.app/api/briefs/generate-now?session_type=5AM_PREMARKET`
   - **Auth:** OIDC Token using a dedicated Service Account.
3. Deploy the Next.js Frontend to **Vercel** or **Cloudflare Pages** pointing to your Cloud Run backend URL.

---

## Database Backup Strategy

To ensure zero loss of paper trades, custom models, and immutable morning brief reports:

### Daily Automated SQLite / PostgreSQL Backup Cron
On your Linux VPS, run `crontab -e` and add:
```cron
# Backup database daily at 2:00 AM ET to cloud storage
0 2 * * * cp /home/ubuntu/why-smart-money/backend/smart_money.db /home/ubuntu/backups/smart_money_$(date +\%Y\%m\%d).db
```

For PostgreSQL:
```cron
0 2 * * * pg_dump -U smartmoney smart_money | gzip > /home/ubuntu/backups/pg_dump_$(date +\%Y\%m\%d).sql.gz
```

---

## Verification & Health Monitoring

1. **Scheduler Status Endpoint:**
   `GET https://your-backend.run.app/api/scheduler/status`
   Returns real-time registered cron triggers and next run timestamp in America/Toronto time.
2. **Health Check Endpoint:**
   `GET https://your-backend.run.app/api/health`
   Returns system operational state, active timezone, and database connectivity.
3. **Telegram Test Dispatch:**
   Whenever the 5:00 AM cycle fires, the Telegram alert dispatcher checks for existing reports and delivers a rich markdown digest directly to your mobile phone.
