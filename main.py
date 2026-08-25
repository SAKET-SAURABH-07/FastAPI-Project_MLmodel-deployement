import io
import joblib
import pandas as pd

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field


app = FastAPI()

model = joblib.load("house_model.joblib")
feature_columns = joblib.load("house_model_columns.joblib")


# Input schema
class HousFeatures(BaseModel):
    MedInc: float = Field(
        gt=0,
        title="Median Income",
        description="Median income of neighborhood"
    )

    HouseAge: float = Field(
        gt=0,
        title="House Age",
        description="Age of the house in years"
    )

    AveRooms: float = Field(
        gt=0,
        title="Average Rooms",
        description="Average number of rooms per household"
    )

    AveBedrms: float = Field(
        gt=0,
        title="Average Bedrooms",
        description="Average number of bedrooms per household"
    )

    Population: float = Field(
        gt=0,
        title="Population",
        description="Population of the neighborhood"
    )

    AveOccup: float = Field(
        gt=0,
        title="Average Occupancy",
        description="Average number of people per household"
    )

    Latitude: float = Field(
        ge=-90,
        le=90,
        title="Latitude",
        description="Latitude of the neighborhood"
    )

    Longitude: float = Field(
        ge=-180,
        le=180,
        title="Longitude of the neighborhood"
    )


# Home
@app.get("/")
def home():
    return {
        "message": "Welcome to the House Price Prediction API",
        "status": "up and running",
        "endpoint": "send POST request to /predict"
    }


@app.get("/health")
def health():
    return {
        "status": "running",
        "model": "Random Forest Regressor",
        "features": feature_columns,
        "avg_error": "$39,000"
    }


# Prediction
@app.post("/predict")
def predict(features: HousFeatures):
    try:
        input_data = features.model_dump()

        input = pd.DataFrame([input_data])
        input = input[feature_columns]

        predicted = model.predict(input)[0]

        price_usd = predicted * 100000

        return {
            "predicted_price": f"${price_usd:,.0f}",
            "predicted_price_short": f"${predicted:.2f} hundred thousands",
            "evidence_range": f"${price_usd - 39000:,.0f} - ${price_usd + 39000:,.0f}"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )


# CSV file prediction
@app.post("/predict-file")
async def predict_file(file: UploadFile = File(...)):

    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Please upload a CSV file."
        )

    contents = await file.read()

    # Read uploaded CSV
    df = pd.read_csv(io.BytesIO(contents))

    required_columns = [
        "MedInc",
        "HouseAge",
        "AveRooms",
        "AveBedrms",
        "Population",
        "AveOccup",
        "Latitude",
        "Longitude"
    ]

    missing_columns = [
        col for col in required_columns
        if col not in df.columns
    ]

    if missing_columns:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required columns: {', '.join(missing_columns)}"
        )

    if len(df) == 0:
        raise HTTPException(
            status_code=400,
            detail="The uploaded CSV file is empty."
        )

    try:
        # Make predictions
        predictions = model.predict(df[feature_columns])

        # Convert predictions to USD
        predictions_usd = predictions * 100000

        # Add prediction column
        df["predicted_price"] = [
            f"${price:,.0f}"
            for price in predictions_usd
        ]

        # Convert dataframe to CSV
        output = df.to_csv(index=False)

        # Return CSV file
        return StreamingResponse(
            io.StringIO(output),
            media_type="text/csv",
            headers={
                "Content-Disposition": "attachment; filename=predictions.csv"
            }
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )