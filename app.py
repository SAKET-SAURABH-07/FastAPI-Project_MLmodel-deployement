"""
FastAPI Learning & ML Model Showcase Server Entrypoint
"""
import uvicorn
from backend.server import app

if __name__ == "__main__":
    print("=" * 65)
    print(" 🚀 California Housing ML & FastAPI Server Starting...")
    print(" 🌐 Web Dashboard:   http://127.0.0.1:8000")
    print(" 📖 Swagger UI Docs: http://127.0.0.1:8000/docs")
    print(" 📑 ReDoc Docs:      http://127.0.0.1:8000/redoc")
    print("=" * 65)
    uvicorn.run("backend.server:app", host="127.0.0.1", port=8000, reload=False)
