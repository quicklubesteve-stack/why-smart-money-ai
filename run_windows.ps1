# Why Smart Money AI - Windows PowerShell Startup Script

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   WHY SMART MONEY AI - QUANTITATIVE INTELLIGENCE SYSTEM   " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$CurrentDir = Get-Location

# 1. Verify / Setup Environment File
if (-not (Test-Path ".env")) {
    Write-Host "[1/4] Creating local .env from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
} else {
    Write-Host "[1/4] Local .env detected." -ForegroundColor Green
}

# 2. Check Python Virtualenv
if (-not (Test-Path "backend\venv")) {
    Write-Host "[2/4] Setting up Python virtual environment..." -ForegroundColor Yellow
    python -m venv backend\venv
    & "backend\venv\Scripts\pip" install -r backend\requirements.txt
} else {
    Write-Host "[2/4] Python virtualenv ready." -ForegroundColor Green
}

# 3. Check Frontend Node Modules
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "[3/4] Installing frontend npm packages..." -ForegroundColor Yellow
    npm --prefix frontend install
} else {
    Write-Host "[3/4] Frontend node modules ready." -ForegroundColor Green
}

# 4. Launch Services in separate PowerShell processes
Write-Host "[4/4] Launching Backend & Frontend services..." -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$CurrentDir'; Write-Host '--- Starting FastAPI Backend on Port 8000 ---' -ForegroundColor Cyan; & backend\venv\Scripts\python -m uvicorn app.main:app --app-dir backend --reload --port 8000"

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$CurrentDir\frontend'; Write-Host '--- Starting Next.js Frontend on Port 3000 ---' -ForegroundColor Green; npm run dev"

Write-Host ""
Write-Host "System launched successfully!" -ForegroundColor Green
Write-Host "• Frontend Dashboard: http://localhost:3000" -ForegroundColor White
Write-Host "• Backend API Docs:   http://localhost:8000/docs" -ForegroundColor White
Write-Host "• Health Endpoint:    http://localhost:8000/api/health" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan
