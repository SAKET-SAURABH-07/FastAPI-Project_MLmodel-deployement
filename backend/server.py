"""
FastAPI Full-Stack ML Showcase Server
=====================================
Unified server integrating:
1. California Housing Price Prediction (Random Forest Regressor ML Model)
2. Batch CSV Processing & Prediction Streaming
3. Student Marks Management (Path Params & Body Validation)
4. Loan Eligibility Evaluation (Pydantic Schema Validation)
5. Customer Query & Path Parameter Filtering
"""

import io
import sys
from pathlib import Path
import joblib
import pandas as pd

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

# Setup base directory relative to this file for reliable deployment paths
BASE_DIR = Path(__file__).resolve().parent

# Reliable model file paths
MODEL_PATH = BASE_DIR / "house_model.joblib"
COLUMNS_PATH = BASE_DIR / "house_model_columns.joblib"

try:
    ml_model = joblib.load(str(MODEL_PATH))
    feature_columns = joblib.load(str(COLUMNS_PATH))
    model_loaded = True
except Exception as e:
    print(f"Warning: Could not load ML model from {MODEL_PATH}: {e}")
    ml_model = None
    feature_columns = [
        "MedInc", "HouseAge", "AveRooms", "AveBedrms", 
        "Population", "AveOccup", "Latitude", "Longitude"
    ]
    model_loaded = False

# Initialize FastAPI App
app = FastAPI(
    title="California Housing ML & FastAPI Backend",
    description="Production-ready FastAPI backend serving Machine Learning predictions (Random Forest Regressor), batch CSV streaming inference, and core REST API architecture patterns.",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for GitHub Pages frontend and local development
# Note: allow_origins=["*"] can be restricted to your GitHub Pages URL in production,
# e.g., allow_origins=["https://YOUR_GITHUB_USERNAME.github.io"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------------------------------
# 0. Root Health Endpoint
# --------------------------------------------------------------------------
@app.get("/", tags=["Health"])
def root():
    """Returns a health status confirmation indicating that the FastAPI backend is running."""
    return {
        "message": "California Housing Price Prediction API is running",
        "status": "online",
        "version": "2.0.0",
        "docs": "/docs",
        "health": "/health"
    }


# --------------------------------------------------------------------------
# 1. Machine Learning: California Housing Price Prediction
# --------------------------------------------------------------------------
class HouseFeatures(BaseModel):
    MedInc: float = Field(
        ...,
        gt=0,
        title="Median Income",
        description="Median income in block group (in tens of thousands of USD, e.g. 3.5 = $35,000)",
        json_schema_extra={"example": 3.87}
    )
    HouseAge: float = Field(
        ...,
        gt=0,
        title="House Age",
        description="Median age of house in years",
        json_schema_extra={"example": 28.0}
    )
    AveRooms: float = Field(
        ...,
        gt=0,
        title="Average Rooms",
        description="Average number of rooms per household",
        json_schema_extra={"example": 5.42}
    )
    AveBedrms: float = Field(
        ...,
        gt=0,
        title="Average Bedrooms",
        description="Average number of bedrooms per household",
        json_schema_extra={"example": 1.05}
    )
    Population: float = Field(
        ...,
        gt=0,
        title="Population",
        description="Block group population count",
        json_schema_extra={"example": 1425.0}
    )
    AveOccup: float = Field(
        ...,
        gt=0,
        title="Average Occupancy",
        description="Average number of household members",
        json_schema_extra={"example": 3.0}
    )
    Latitude: float = Field(
        ...,
        ge=-90,
        le=90,
        title="Latitude",
        description="Geographic latitude coordinate",
        json_schema_extra={"example": 37.88}
    )
    Longitude: float = Field(
        ...,
        ge=-180,
        le=180,
        title="Longitude",
        description="Geographic longitude coordinate",
        json_schema_extra={"example": -122.23}
    )


@app.get("/health", tags=["Machine Learning"])
def health():
    """Returns the operational status and metadata of the Random Forest model."""
    return {
        "status": "running" if model_loaded else "model_not_loaded",
        "model": "Random Forest Regressor (100 estimators)",
        "features": feature_columns,
        "avg_error": "$39,000",
        "r2_score": 0.805,
        "framework": "Scikit-Learn & Joblib"
    }


def _run_house_prediction(features: HouseFeatures):
    if not model_loaded or ml_model is None:
        raise HTTPException(status_code=500, detail="ML Model file not loaded on server.")
    
    try:
        input_data = features.model_dump()
        df_input = pd.DataFrame([input_data])[feature_columns]
        predicted = float(ml_model.predict(df_input)[0])
        price_usd = predicted * 100000.0
        
        min_evidence = max(10000.0, price_usd - 39000.0)
        max_evidence = price_usd + 39000.0

        return {
            "predicted_price": f"${price_usd:,.0f}",
            "raw_price_usd": round(price_usd, 2),
            "predicted_price_short": f"${predicted:.2f} hundred thousands",
            "evidence_range": f"${min_evidence:,.0f} - ${max_evidence:,.0f}",
            "confidence_margin": "± $39,000",
            "features_used": input_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction inference failed: {str(e)}")


@app.post("/predict", tags=["Machine Learning"])
@app.post("/predict/house", tags=["Machine Learning"])
def predict_house_price(features: HouseFeatures):
    """Predicts California house valuation given demographic and geographic attributes."""
    return _run_house_prediction(features)


@app.post("/predict-file", tags=["Machine Learning"])
@app.post("/predict/house-batch", tags=["Machine Learning"])
async def predict_file(file: UploadFile = File(...)):
    """Accepts a CSV file with required feature columns, computes batch predictions, and streams back the enriched CSV."""
    if not model_loaded or ml_model is None:
        raise HTTPException(status_code=500, detail="ML Model is not loaded on server.")

    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload a .csv file.")

    contents = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV file: {str(e)}")

    missing_columns = [col for col in feature_columns if col not in df.columns]
    if missing_columns:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required columns: {', '.join(missing_columns)}"
        )

    if len(df) == 0:
        raise HTTPException(status_code=400, detail="The uploaded CSV file is empty.")

    try:
        predictions = ml_model.predict(df[feature_columns])
        predictions_usd = predictions * 100000.0
        df["predicted_price_usd"] = [round(p, 2) for p in predictions_usd]
        df["predicted_price_formatted"] = [f"${p:,.0f}" for p in predictions_usd]

        output = df.to_csv(index=False)
        return StreamingResponse(
            io.StringIO(output),
            media_type="text/csv",
            headers={
                "Content-Disposition": "attachment; filename=california_housing_predictions.csv",
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {str(e)}")


# --------------------------------------------------------------------------
# 2. Student Academic Marks Management (from main_s.py)
# --------------------------------------------------------------------------
class MarksSubmission(BaseModel):
    student_id: str
    marks: int
    subject: str

students_db = {
    "S001": {"name": "Alice", "marks": 85, "grade": "A"},
    "S002": {"name": "Bob", "marks": 75, "grade": "B"},
    "S003": {"name": "Charlie", "marks": 65, "grade": "C"},
    "S004": {"name": "Diana", "marks": 95, "grade": "A+"}
}

@app.get("/students/{student_id}", tags=["Student Marks"])
def get_student(student_id: str):
    """Retrieves student details using a path parameter."""
    if student_id not in students_db:
        raise HTTPException(status_code=404, detail=f"Student with ID {student_id} not found")
    return students_db[student_id]

@app.post("/submit-marks", tags=["Student Marks"])
def submit_marks(submission: MarksSubmission):
    """Updates student marks with strict boundary validations (0-100 range)."""
    if submission.student_id not in students_db:
        raise HTTPException(status_code=404, detail=f"Student with ID {submission.student_id} not found")

    if submission.marks < 0 or submission.marks > 100:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "Marks must be between 0 and 100",
                "marks_received": submission.marks,
                "fix": "enter a valid value between 0 and 100"
            }
        )

    if not submission.subject.strip():
        raise HTTPException(
            status_code=400,
            detail={
                "error": "Subject cannot be empty",
                "fix": "enter a valid subject name"
            }
        )

    students_db[submission.student_id]["marks"] = submission.marks
    return {
        "message": f"Marks for student {submission.student_id} updated successfully",
        "student": students_db[submission.student_id]["name"],
        "subject": submission.subject,
        "marks": submission.marks
    }


# --------------------------------------------------------------------------
# 3. Loan Eligibility Predictor (from pyd.py & loan.py)
# --------------------------------------------------------------------------
class LoanApplication(BaseModel):
    name: str = "Applicant"
    age: int
    income: float
    loan_amount: float
    employment_years: int

@app.post("/predict-loan", tags=["Loan Eligibility"])
@app.post("/predict/loan", tags=["Loan Eligibility"])
def predict_loan(application: LoanApplication):
    """Evaluates applicant eligibility based on salary, age, and employment criteria."""
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
# 4. Customer Query Parameter & Path Parameter Explorer
# --------------------------------------------------------------------------
all_customers = [
    {"id": 101, "name": "Alice Smith", "city": "New York", "risk_level": "low"},
    {"id": 102, "name": "Bob Johnson", "city": "Los Angeles", "risk_level": "medium"},
    {"id": 104, "name": "Charlie Brown", "city": "Chicago", "risk_level": "high"},
    {"id": 105, "name": "Charlie2 Brown", "city": "Chicago1", "risk_level": "high"},
    {"id": 106, "name": "Charlie3 Brown", "city": "Chicago2", "risk_level": "high"},
]

customer_risk_profiles = {
    101: {"name": "Alice Smith", "risk_level": "low", "score": 0.12},
    102: {"name": "Bob Johnson", "risk_level": "medium", "score": 0.45},
    103: {"name": "Charlie Brown", "risk_level": "high", "score": 0.78},
}

@app.get("/customers", tags=["Customer Analytics"])
def get_customers(city: str, risk_level: str):
    """Filters customers using query parameters."""
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

@app.get("/customer/{customer_id}", tags=["Customer Analytics"])
def get_customer_risk(customer_id: int):
    """Fetches risk assessment profile using an integer path parameter."""
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
# 5. Sample CSV Generation for testing Batch Predict
# --------------------------------------------------------------------------
@app.get("/sample-housing-csv", tags=["Machine Learning"])
def get_sample_csv():
    """Generates a downloadable sample CSV formatted with California Housing features."""
    sample_data = """MedInc,HouseAge,AveRooms,AveBedrms,Population,AveOccup,Latitude,Longitude
8.3252,41.0,6.9841,1.0238,322.0,2.5555,37.88,-122.23
3.87,28.0,5.42,1.05,1425.0,3.0,37.85,-122.25
7.2574,52.0,8.2881,1.0734,496.0,2.8022,37.85,-122.24
5.6431,52.0,5.8173,1.0730,558.0,2.5479,37.85,-122.25
3.8462,52.0,6.2818,1.1090,565.0,2.1814,37.85,-122.25
"""
    return StreamingResponse(
        io.StringIO(sample_data),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=sample_california_housing.csv"}
    )


# --------------------------------------------------------------------------
# Local Entry Point
# --------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    print("=" * 65)
    print(" 🚀 California Housing ML & FastAPI Server Starting...")
    print(" 📖 Swagger UI Docs: http://127.0.0.1:8000/docs")
    print(" 📑 ReDoc Docs:      http://127.0.0.1:8000/redoc")
    print("=" * 65)
    uvicorn.run(app, host="0.0.0.0", port=8000)
