@echo off
echo =================================================================
echo  Starting California Housing ML & FastAPI Server
echo =================================================================
cd /d "%~dp0"
if exist "venv\Scripts\python.exe" (
    "venv\Scripts\python.exe" app.py
) else if exist "fastapi-project\venv\Scripts\python.exe" (
    "fastapi-project\venv\Scripts\python.exe" app.py
) else (
    python app.py
)
pause
