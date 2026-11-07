@echo off
echo ========================================================
echo Starting TrustWrite - Writing Intelligence Workspace
echo ========================================================

echo Starting FastAPI Backend on port 8000...
start cmd /k "cd /d %~dp0backend && .\venv\Scripts\python -m uvicorn app.main:app --reload --port 8000"

timeout /t 3 /nobreak > nul

echo Starting Next.js Frontend on port 3000...
start cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo Services started:
echo - Frontend: http://localhost:3000
echo - Backend API Docs: http://localhost:8000/docs
echo ========================================================
