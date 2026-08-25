@echo off
echo ===================================================
echo  Starting FastAPI Learning Showcase Server
echo ===================================================
cd /d "%~dp0"
if exist "fastapi-project\venv\Scripts\python.exe" (
    "fastapi-project\venv\Scripts\python.exe" app.py
) else (
    python app.py
)
pause
