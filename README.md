# Why Smart Money AI — Stock Market Intelligence Platform

An institutional-grade stock market intelligence and predictive analytics platform for US (**NYSE, NASDAQ**) and Canadian (**TSX**) equities.

Built to run seamlessly on your **Acer Windows computer** using native PowerShell or Docker Compose, and engineered for autonomous cloud deployment to execute daily **5:00 AM America/Toronto** market intelligence cycles 24/7.

---

## Key Modules & Capabilities

1. **Stock Scanner:** Scans liquid NYSE, NASDAQ, and TSX securities with configurable filters for price, volume, relative volume (RVOL), volatility, spread, and market capitalization.
2. **Smart Money Detector:** Analyzes unusual volume, volume-price divergence, accumulation/distribution, VWAP behavior, off-exchange / dark-pool proxies, and SEC 13F filings. Labeled with full transparency (delayed quarterly snapshots, proxy estimates).
3. **AI Predictions:** Time-series walk-forward models producing return distributions, calibrated probabilities, confidence bands, and explainability factors over intraday, 1-day, 5-day, and 20-day horizons. Abstains when uncertainty is high.
4. **Trading Signals:** Generates explainable `BUY`, `WATCH`, `HOLD`, `AVOID`, and `SELL/EXIT` recommendations with explicit entry zones, stop losses, profit targets, risk-reward ratios, expected slippage, and invalidation rules.
5. **5:00 AM Market Brief:** Stamped with an immutable SHA-256 fingerprint, detailing macro sentiment, index futures, premarket movers vs previous closes, sector rotation, and top-10 opportunities.
6. **Realistic Paper Trading Simulator:** Realistic simulation of order fills, bid-ask spreads, slippage (5-15 bps), trading fees, and single-position allocation caps. **Live brokerage trading is locked out by default.**
7. **Model Accuracy & Performance Tracking:** Measures out-of-sample directional accuracy, realized win rates, Sharpe ratio, and alpha compared directly against buy-and-hold SPY.

> **Research Rigor Notice:** A 95% win rate is an aspirational theoretical research boundary, never a guaranteed outcome or marketing claim.

---

## Quick Start on Windows PowerShell

### Prerequisites
- Windows 10/11 (Acer Laptop)
- Python 3.12+ installed
- Node.js v18+ and npm installed
- Git installed

### Option A: One-Click Windows Launch
Open Windows PowerShell in the project directory:
```powershell
.\run_windows.ps1
```
This automatically verifies dependencies, initializes the local SQLite database with realistic demonstration data, and launches the Backend and Frontend in separate windows.

---

### Option B: Step-by-Step Manual Launch

#### 1. Configure Environment
```powershell
Copy-Item .env.example .env
```
*(The system runs in full DEMO DATA mode out-of-the-box without requiring live API keys).*

#### 2. Start the FastAPI Backend
```powershell
# Create and activate virtual environment
python -m venv backend\venv
.\backend\venv\Scripts\Activate.ps1

# Install requirements
pip install -r backend\requirements.txt

# Run the backend server (FastAPI on Port 8000)
python -m uvicorn app.main:app --app-dir backend --reload --port 8000
```
- API Docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/health`

#### 3. Start the Next.js Frontend
In a second PowerShell terminal:
```powershell
cd frontend
npm install
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## Running the Automated Test Suite

To run the unit and integration test suite:
```powershell
.\backend\venv\Scripts\pytest backend\tests -v
```
All tests verify:
- Health and demo-mode indicators
- Stock universe scanning across US and Canadian exchanges
- Calibrated signal contracts (entry, target, stop, R:R, slippage)
- Machine learning prediction confidence intervals
- Paper trading simulation and live-order lockout enforcement

---

## Docker Compose Deployment

If Docker is available:
```bash
docker-compose up --build -d
```
Starts:
- Next.js Frontend on port `3000`
- FastAPI Backend on port `8000`
- PostgreSQL 16 on port `5432`
- Redis 7 on port `6379`

---

## Cloud Deployment Plan (24/7 Execution with Laptop Off)

To ensure the 5:00 AM America/Toronto market brief and scanning jobs run every trading morning even when your Acer laptop is powered off, deploy the platform to a cloud container runtime:

1. **Option 1: Railway / Render (Zero Devops)**
   - Connect your GitHub repository to Railway or Render.
   - Deploy `backend/Dockerfile` with a persistent PostgreSQL database.
   - Configure cron trigger or background worker: `APScheduler` inside FastAPI runs continuously in the cloud container.
   - Deploy `frontend/` as a static/Node web service.

2. **Option 2: AWS / GCP Virtual Machine (Lightsail or Compute Engine e2-micro)**
   - Provision an Ubuntu VM ($5/month).
   - Clone the repository and run `docker-compose up -d`.
   - Setup a systemd service to keep Docker Compose alive across server restarts.
   - Notifications will be dispatched to your Telegram bot at 5:00 AM ET reliably.

---

## Publishing to GitHub Safely

1. **Verify No Credentials in Repository:**
   ```powershell
   git status
   ```
   *(Ensure `.env` is ignored by `.gitignore` and only `.env.example` is staged).*

2. **Commit Code:**
   ```powershell
   git add .
   git commit -m "feat: complete Phase 1 Why Smart Money AI intelligence system"
   ```

3. **Publish to your GitHub account:**
   ```powershell
   git remote add origin https://github.com/<your-username>/why-smart-money-ai.git
   git branch -M main
   git push -u origin main
   ```

---

## Architecture & Coding Protocol
See [AGENTS.md](file:///c:/Users/steve/OneDrive/Desktop/smart%20money/AGENTS.md) for architectural guidelines, risk guardrails, data validation protocols, and model evaluation rules.
