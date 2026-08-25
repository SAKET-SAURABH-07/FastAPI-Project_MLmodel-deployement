"""
FastAPI Learning Project - Unified Showcase Application
------------------------------------------------------
This file integrates and serves all the learning modules:
- Student Marks Management (main_s.py)
- Loan Application Prediction (pyd.py & loan.py)
- Customer Query Parameter Filters (query_p.py)
- Customer Path Parameter Risk Profiles (path_p.py)

It serves the interactive frontend dashboard at http://127.0.0.1:8000/
without modifying any backend logic of the existing project modules.
"""

import sys
import os
from pathlib import Path

# Add project directories to sys.path to import existing modules
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))
sys.path.insert(0, str(BASE_DIR / "fastapi-project" / "venv"))
sys.path.insert(0, str(BASE_DIR / "fastapi-project"))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

# Create unified FastAPI application
app = FastAPI(
    title="FastAPI Learning & Feature Showcase",
    description="Interactive Web Dashboard demonstrating FastAPI features: Path Parameters, Query Parameters, Pydantic Request Validation, and HTTPException Handling.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for interactive frontend and developer tools
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------------------------------
# 1. Student Marks Management System (from main_s.py)
# --------------------------------------------------------------------------
class MarksSubmission(BaseModel):
    student_id: str
    marks: int
    subject: str

students = {
    "S001": {"name": "Alice", "marks": 85, "grade": "A"},
    "S002": {"name": "Bob", "marks": 75, "grade": "B"},
    "S003": {"name": "Charlie", "marks": 65, "grade": "C"},
    "S004": {"name": "Diana", "marks": 95, "grade": "A+"}
}

@app.get("/students/{student_id}", tags=["Student Marks Management"])
def get_student(student_id: str):
    if student_id not in students:
        raise HTTPException(
            status_code=404,
            detail=f"Student with ID {student_id} not found"
        )
    return students[student_id]

@app.post("/submit-marks", tags=["Student Marks Management"])
def submit_marks(submission: MarksSubmission):
    if submission.student_id not in students:
        raise HTTPException(
            status_code=404,
            detail=f"Student with ID {submission.student_id} not found"
        )

    if submission.marks < 0 or submission.marks > 100:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "Marks must be between 0 and 100",
                "marks_received": submission.marks,
                "fix": "enter a valid value between 0 and 100"
            }
        )

    if submission.subject.strip() == "":
        raise HTTPException(
            status_code=400,
            detail={
                "error": "Subject cannot be empty",
                "fix": "enter a valid subject name"
            }
        )

    try:
        students[submission.student_id]["marks"] = submission.marks
        return {
            "message": f"Marks for student {submission.student_id} updated successfully",
            "student": students[submission.student_id]["name"],
            "subject": submission.subject,
            "marks": submission.marks
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "An error occurred while updating marks",
                "exception": str(e)
            }
        )

# --------------------------------------------------------------------------
# 2. Loan Approval Predictor (from pyd.py & loan.py)
# --------------------------------------------------------------------------
class LoanApplication(BaseModel):
    name: str = "Applicant"
    age: int
    income: float
    loan_amount: float
    employment_years: int

@app.post("/predict", tags=["Loan Prediction"])
def predict_loan(application: LoanApplication):
    # Evaluation rule from pyd.py
    approved = (
        application.income > 50000 and
        application.employment_years > 2 and
        application.age >= 21
    )
    return {
        "name": application.name,
        "age": application.age,
        "income": application.income,
        "loan_amount": application.loan_amount,
        "employment_years": application.employment_years,
        "decision": "approved" if approved else "denied"
    }

# --------------------------------------------------------------------------
# 3. Customer Query Parameter Filter (from query_p.py)
# --------------------------------------------------------------------------
all_customers = [
    {"id": 101, "name": "Alice Smith", "city": "New York", "risk_level": "low"},
    {"id": 102, "name": "Bob Johnson", "city": "Los Angeles", "risk_level": "medium"},
    {"id": 104, "name": "Charlie Brown", "city": "Chicago", "risk_level": "high"},
    {"id": 105, "name": "Charlie2 Brown", "city": "Chicago1", "risk_level": "high"},
    {"id": 106, "name": "Charlie3 Brown", "city": "Chicago2", "risk_level": "high"},
]

@app.get("/customers", tags=["Customer Queries"])
def get_customers(city: str, risk_level: str):
    filtered = [
        c for c in all_customers
        if c["city"].lower() == city.lower() and c["risk_level"].lower() == risk_level.lower()
    ]
    return {
        "city": city,
        "risk_level": risk_level,
        "count": len(filtered),
        "results": filtered
    }

# --------------------------------------------------------------------------
# 4. Customer Path Parameter Risk Profile (from path_p.py)
# --------------------------------------------------------------------------
customer_risk_profiles = {
    101: {"name": "Alice Smith", "risk_level": "low", "score": 0.12},
    102: {"name": "Bob Johnson", "risk_level": "medium", "score": 0.45},
    103: {"name": "Charlie Brown", "risk_level": "high", "score": 0.78},
}

@app.get("/customer/{customer_id}", tags=["Risk Profiles"])
def get_customer_risk(customer_id: int):
    if customer_id not in customer_risk_profiles:
        return {"error": "Customer not found"}

    profile = customer_risk_profiles[customer_id]
    return {
        "customer_id": customer_id,
        "name": profile["name"],
        "risk_level": profile["risk_level"],
        "score": profile["score"]
    }

# --------------------------------------------------------------------------
# 5. Static Files and Frontend Serving
# --------------------------------------------------------------------------
@app.get("/", include_in_schema=False)
def serve_frontend():
    return FileResponse(str(BASE_DIR / "index.html"))

@app.get("/style.css", include_in_schema=False)
def serve_style():
    return FileResponse(str(BASE_DIR / "style.css"))

@app.get("/app.js", include_in_schema=False)
def serve_js():
    return FileResponse(str(BASE_DIR / "app.js"))

# --------------------------------------------------------------------------
# Entry Point
# --------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    print("=" * 65)
    print(" FastAPI Learning Showcase Server Starting...")
    print(" Frontend Dashboard: http://127.0.0.1:8000")
    print(" Swagger UI Docs:   http://127.0.0.1:8000/docs")
    print(" ReDoc Docs:        http://127.0.0.1:8000/redoc")
    print("=" * 65)
    uvicorn.run(app, host="127.0.0.1", port=8000)
