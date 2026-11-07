Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Starting TrustWrite - Writing Intelligence Workspace" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$root = $PSScriptRoot

Write-Host "Starting FastAPI Backend on port 8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; .\venv\Scripts\python -m uvicorn app.main:app --reload --port 8000"

Start-Sleep -Seconds 3

Write-Host "Starting Next.js Frontend on port 3000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev"

Write-Host "`nServices running:" -ForegroundColor Yellow
Write-Host "-> Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "-> Backend API Docs: http://localhost:8000/docs" -ForegroundColor White
