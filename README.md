# California Housing ML & FastAPI Studio

<<<<<<< HEAD
A learning-focused full-stack application that exposes a trained machine-learning model through a FastAPI web service. The project uses a **Random Forest Regressor** trained on the California Housing dataset to estimate property values from demographic and geographic features. It also includes batch CSV prediction, automatic API documentation, automated tests, and interactive demonstrations of common REST API patterns.
=======
A production-ready **FastAPI & Machine Learning** web platform that deploys a **Random Forest Regressor** trained on the California Housing dataset to provide real-time property valuations, batch CSV streaming predictions, and an interactive learning suite for REST API architectures.
>>>>>>> c6d08f0 (Prepare project for GitHub Pages and Render)

> **Project purpose:** This repository connects the complete machine-learning lifecycle—from data exploration and model training to API-based prediction—with practical FastAPI examples.

<<<<<<< HEAD
## Contents

- [What the project does](#what-the-project-does)

- [How machine learning is used](#how-machine-learning-is-used)

- [Prediction workflow](#prediction-workflow)

- [Features](#features)

- [Repository structure](#repository-structure)

- [API endpoints](#api-endpoints)

- [Installation and setup](#installation-and-setup)

- [Running the application](#running-the-application)

- [Batch CSV predictions](#batch-csv-predictions)

- [Exploring and retraining the model](#exploring-and-retraining-the-model)

- [Testing](#testing)

- [Deployment notes](#deployment-notes)

- [Important implementation notes](#important-implementation-notes)

## What the project does

The application provides a browser-based dashboard and a REST API for house-price estimation. A user supplies eight housing-related features, and the backend sends those values to a previously trained Random Forest model. The model returns a numeric estimate, which the API formats as a dollar amount.

The application also accepts a CSV file containing multiple housing records. It predicts a value for every row and returns a new CSV file with the predictions added.

Alongside the ML functionality, the project demonstrates core FastAPI concepts, including request-body validation, path parameters, query parameters, error handling, file uploads, streaming responses, and automatically generated API documentation.

## How machine learning is used

The machine-learning pipeline is implemented in `train.py` and served by the FastAPI application.

### Training data

The training script loads the California Housing dataset through Scikit-learn. The dataset contains housing records with eight input features and a numeric target representing the median house value in units of hundreds of thousands of dollars.

The model uses the following features:

| Feature | Description |
| --- | --- |
| `MedInc` | Median income of the neighborhood |
| `HouseAge` | Average age of houses in the neighborhood |
| `AveRooms` | Average number of rooms per household |
| `AveBedrms` | Average number of bedrooms per household |
| `Population` | Neighborhood population |
| `AveOccup` | Average number of occupants per household |
| `Latitude` | Geographic latitude |
| `Longitude` | Geographic longitude |

### Model algorithm

The project trains a Scikit-learn `RandomForestRegressor`:

```python
model = RandomForestRegressor(
    n_estimators=100,
    random_state=42
)
```

A Random Forest Regressor is an ensemble regression algorithm. It trains multiple decision trees and combines their predictions to estimate a continuous numeric value. In this project, the continuous value is the expected house value.

The model learns from the training data in the following statement:

```python
model.fit(X_train, Y_train)
```

This is the main training step. The algorithm identifies relationships between the eight input features and the target house value. When a new request arrives later, the trained model uses those learned relationships to generate a prediction.

### Training and testing data

The dataset is divided into two portions:

| Portion | Purpose |
| --- | --- |
| Training data | Used by the model to learn patterns. |
| Testing data | Kept separate and used to evaluate performance on unseen records. |

The training script uses an 80/20 split. The `random_state=42` setting makes the split reproducible, meaning that repeated runs use the same split when the underlying dataset and library behavior remain unchanged.

### Saved model artifacts

After training, two files are created:

```python
joblib.dump(model, "house_model.joblib")
joblib.dump(list(X.columns), "house_model_columns.joblib")
```

| Artifact | Purpose |
| --- | --- |
| `house_model.joblib` | Contains the fitted Random Forest model. |
| `house_model_columns.joblib` | Stores the feature names and their expected order. |

The column-order file is important because the model must receive features in the same order used during training.

## Prediction workflow

The complete request-to-prediction flow is:

```
Client submits housing features
              ↓
FastAPI validates the request with Pydantic
              ↓
The values are converted into a one-row Pandas DataFrame
              ↓
Columns are reordered to match the training schema
              ↓
The saved Random Forest model runs model.predict(...)
              ↓
The result is converted into a dollar estimate
              ↓
FastAPI returns a JSON response
```

When the API starts, it loads the serialized model and feature schema:

```python
model = joblib.load("house_model.joblib")
feature_columns = joblib.load("house_model_columns.joblib")
```

For a single prediction, the API performs the following operations:

1. Receives a JSON request at `POST /predict`.

1. Validates the input using the Pydantic `HousFeatures` schema.

1. Converts the validated object into a Pandas DataFrame.

1. Reorders the columns using `house_model_columns.joblib`.

1. Calls `model.predict(input)`.

1. Converts the model output from hundreds of thousands of dollars into dollars.

1. Returns the formatted estimate and an approximate evidence range.

A request body has this general shape:

```json
{
  "MedInc": 8.3,
  "HouseAge": 25.0,
  "AveRooms": 6.2,
  "AveBedrms": 1.1,
  "Population": 1200.0,
  "AveOccup": 2.8,
  "Latitude": 37.8,
  "Longitude": -122.4
}
```

The API validates values before prediction. For example, most numerical features must be greater than zero, latitude must be between `-90` and `90`, and longitude must be between `-180` and `180`.

## Features

### 1. House-price prediction

The primary ML endpoint is:

```
POST /predict
```

It accepts one housing record and returns a JSON response similar to:

```json
{
  "predicted_price": "$325,000",
  "predicted_price_short": "$3.25 hundred thousands",
  "evidence_range": "$286,000 - $364,000"
}
```

The model output is multiplied by `100000` because the California Housing target is expressed in units of one hundred thousand dollars.

### 2. Batch CSV prediction

The batch endpoint is:

```
POST /predict-file
```

It accepts a `.csv` file containing the required feature columns. The server validates the file, predicts a value for each row, adds a `predicted_price` column, and returns the result as a downloadable CSV file.

The batch process is:

```
CSV upload
    ↓
Verify the file extension
    ↓
Read the file with Pandas
    ↓
Check for required columns
    ↓
Run the model for every row
    ↓
Add the prediction column
    ↓
Return the generated CSV
```

The server uses `StreamingResponse`, so it can return the generated CSV directly instead of first saving an output file to disk.

### 3. FastAPI learning examples

The repository also contains examples that demonstrate FastAPI independently of the ML model:

| Example | FastAPI concept |
| --- | --- |
| Student marks | Path parameters, request-body validation, and HTTP exceptions |
| Loan eligibility | Pydantic schemas and rule-based evaluation |
| Customer filtering | Query parameters such as `city` and `risk_level` |
| Customer risk profile | Path parameters and structured JSON responses |

These examples are useful for learning API design. They should not automatically be considered machine-learning components. For example, Pydantic validates data, while an ML model learns patterns from training data.

### 4. Interactive developer dashboard

The frontend provides a visual interface for interacting with the API. It can display request and response details, HTTP status codes, latency, JSON output, and generated `cURL` commands.

The frontend consists of ordinary static files and can be hosted separately from the Python backend if the API is deployed at an accessible URL.

## Repository structure

```
.
├── backend/
│   ├── server.py                  # FastAPI application and API routes
│   └── ml_model/
│       ├── house_model.joblib    # Serialized trained Random Forest model
│       └── house_model_columns.joblib
│                                    # Expected feature-column order
│
├── index.html                     # Frontend dashboard
├── style.css                      # Dashboard styling
├── app.js                         # Frontend interaction and API calls
├── app.py                         # Application launcher or entry point
├── run_server.bat                 # Windows startup script
├── test_endpoints.py              # Automated API and inference tests
├── train.py                       # Model training and serialization
├── explore.py                     # Exploratory data analysis
├── requirements.txt               # Python dependencies
└── README.md                      # Project documentation
=======
## 🏗️ Architecture & Project Structure

The project is cleanly separated into a static frontend (for GitHub Pages) and a FastAPI backend (for Render):

```text
├── frontend/
│   ├── index.html                 # Main static web dashboard
│   ├── style.css                  # Obsidian dark-theme stylesheet
│   └── app.js                     # Interactive client application logic
│
├── backend/
│   ├── server.py                  # Unified FastAPI server (ML + REST endpoints)
│   ├── house_model.joblib         # Trained Random Forest model (100 estimators)
│   ├── house_model_columns.joblib # Model feature column schema
│   └── requirements.txt           # Python dependencies for deployment
│
├── train.py                       # Model training script
├── test_endpoints.py              # Automated verification test suite
├── explore.py                     # Exploratory data analysis (EDA)
├── app.py                         # Local server launcher
├── run_server.bat                 # One-click Windows launch script
├── .gitignore                     # Git ignore rules
└── README.md                      # Deployment & usage documentation
>>>>>>> c6d08f0 (Prepare project for GitHub Pages and Render)
```

If your actual application file is named `main.py` rather than `backend/server.py`, update the structure above to match the real repository. The important distinction is that the FastAPI server must be able to locate both `.joblib` files when it starts.

<<<<<<< HEAD
## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/` | Confirms that the API is running and points users to the prediction endpoint. |
| `GET` | `/health` | Returns service status, model information, and the expected feature columns. |
| `POST` | `/predict` | Predicts a house value from one JSON record. |
| `POST` | `/predict-file` | Predicts house values for all rows in an uploaded CSV file. |
| `GET` | `/docs` | Opens FastAPI’s interactive Swagger UI. |
| `GET` | `/redoc` | Opens FastAPI’s ReDoc documentation. |

The repository may contain additional educational endpoints for student marks, loan eligibility, customer filtering, and customer risk profiles. Their exact paths should be confirmed against the route definitions in the active FastAPI server file.

## Installation and setup

### 1. Create or activate a virtual environment

A virtual environment keeps project dependencies separate from other Python projects.

On Windows:

```bash
python -m venv venv
venv\Scripts\activate
```

On macOS or Linux:

```bash
python3 -m venv venv
source venv/bin/activate
```

### 2. Install dependencies
=======
## 🚀 Deployment Guide

```text
Frontend:
GitHub Pages

Backend:
Render

Frontend communicates with:
FastAPI REST API
```

---

### Step 1: Deploy Backend to Render

1. Create a new account / log in at **[render.com](https://render.com/)**.
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository: `SAKET-SAURABH-07/FastAPI-Project_MLmodel-deployement`.
4. Configure the service settings:
   - **Name**: `fastapi-housing-ml` *(or your preferred name)*
   - **Environment**: `Python 3`
   - **Region**: Select closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**:
     ```bash
     pip install -r requirements.txt
     ```
   - **Start Command**:
     ```bash
     uvicorn server:app --host 0.0.0.0 --port $PORT
     ```
5. Click **Create Web Service**.
6. Once deployed, copy your live Render service URL (e.g., `https://fastapi-housing-ml.onrender.com`).
7. Verify it works by opening `https://YOUR-SERVICE-NAME.onrender.com/` in your browser. You should see:
   ```json
   {
     "message": "California Housing Price Prediction API is running",
     "status": "online",
     "version": "2.0.0",
     "docs": "/docs",
     "health": "/health"
   }
   ```

---

### Step 2: Connect Frontend to Render

1. Open `frontend/app.js`.
2. Locate the `API_BASE_URL` constant at the top of the file:
   ```javascript
   // IMPORTANT: When deploying to GitHub Pages, replace this with your actual Render backend URL:
   // Example: const API_BASE_URL = "https://fastapi-housing-ml.onrender.com";
   const API_BASE_URL = "https://YOUR-RENDER-SERVICE.onrender.com";
   ```
3. Replace `"https://YOUR-RENDER-SERVICE.onrender.com"` with your actual live Render URL.
4. Commit and push the change to GitHub:
   ```bash
   git add frontend/app.js
   git commit -m "Configure production Render API URL"
   git push origin main
   ```

---

### Step 3: Deploy Frontend to GitHub Pages

1. Go to your repository on **GitHub** → **Settings** → **Pages**.
2. Under **Build and deployment** → **Source**, select **Deploy from a branch**.
3. Under **Branch**:
   - Select `main`
   - Select folder: `/frontend` *(or `/ (root)` if you copy or symlink, GitHub Pages native `/frontend` or GitHub Actions)*
   - Click **Save**.
4. GitHub Pages will generate your live URL:
   `https://SAKET-SAURABH-07.github.io/FastAPI-Project_MLmodel-deployement/`
5. Visit the live URL — your frontend is now live and communicating with your Render backend!

---

## 💻 Local Development
>>>>>>> c6d08f0 (Prepare project for GitHub Pages and Render)

```bash
cd backend
pip install -r requirements.txt
```

<<<<<<< HEAD
The dependency file should include the packages required by the API and ML pipeline, such as FastAPI, Uvicorn, Pandas, Scikit-learn, Pydantic, Joblib, and the multipart upload support used by FastAPI file endpoints.

### 3. Confirm the model artifacts

Before starting the API, verify that these files exist in the location expected by the server:

```
house_model.joblib
house_model_columns.joblib
```

If the server loads them using relative paths, start the application from the directory that contains those files, or change the code to use reliable paths based on the script location.

## Running the application

You can start the server with the Windows launcher:

```
run_server.bat
```

Alternatively, run the Python entry point directly:

=======
### 2. Run the Local Server
From the root directory:
>>>>>>> c6d08f0 (Prepare project for GitHub Pages and Render)
```bash
python app.py
```
Or start Uvicorn directly from `backend/`:
```bash
cd backend
uvicorn server:app --reload --host 127.0.0.1 --port 8000
```

<<<<<<< HEAD
If the FastAPI application is defined in another file, use Uvicorn with the appropriate module and application object. For example:
=======
### 3. Access Local Endpoints
- **Interactive Web App**: Open `frontend/index.html` in your browser or visit [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Documentation**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
>>>>>>> c6d08f0 (Prepare project for GitHub Pages and Render)

```bash
uvicorn backend.server:app --reload
```

After the server starts, open:

| Resource | URL |
| --- | --- |
| Dashboard | [http://127.0.0.1:8000](http://127.0.0.1:8000) |
| Swagger UI | [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) |
| ReDoc | [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc) |

## Exploring and retraining the model

### Explore the dataset

Run:

```bash
python explore.py
```

This script prints the dataset shape, sample rows, and descriptive statistics. It is intended for basic exploratory data analysis before training.

### Train the model

Run:

```bash
python train.py
```

The training script will:

1. Load the California Housing dataset.

1. Create a feature DataFrame and target array.

1. Split the data into training and testing sets.

1. Train a Random Forest Regressor.

1. Generate predictions for the test set.

1. Calculate evaluation metrics.

1. Save the trained model and feature-column order.

Retraining replaces the existing `.joblib` files. Keep the training and serving environments compatible because serialized Scikit-learn models can depend on the versions of Python and the installed libraries.

## Testing

Run the automated test suite with:

<<<<<<< HEAD
=======
## 🧪 Automated Testing

Run the test suite from the repository root:
>>>>>>> c6d08f0 (Prepare project for GitHub Pages and Render)
```bash
python test_endpoints.py
```

<<<<<<< HEAD
The tests should verify both ordinary REST behavior and ML behavior, including successful health checks, valid single predictions, invalid input handling, missing CSV columns, empty files, and batch prediction responses.

## Deployment notes

The frontend consists of static files and can be hosted on GitHub Pages or another static hosting provider. A static host can serve `index.html`, `style.css`, and `app.js`, but it cannot execute the Python FastAPI server.

The backend must therefore be deployed separately to a Python-capable hosting environment. The frontend JavaScript must then be configured with the public backend URL instead of assuming that the API is running at `127.0.0.1`.

A local address such as `http://127.0.0.1:8000` is accessible only from the computer running the server. It is not a globally reachable production API.

## Important implementation notes

### Evaluation metric naming

The training script should ensure that the reported error metric matches the function being used. `mean_squared_error` calculates mean squared error, not mean absolute error. If the project wants to report MAE, use:

```python
from sklearn.metrics import mean_absolute_error

mae = mean_absolute_error(Y_test, y_pred )
print(f"Mean absolute error: ${mae * 100000:,.2f}")
```

If the project wants RMSE, calculate the square root of the mean squared error:

```python
from sklearn.metrics import mean_squared_error

rmse = mean_squared_error(Y_test, y_pred) ** 0.5
print(f"Root mean squared error: ${rmse * 100000:,.2f}")
```

### Error range is not automatically a confidence interval

An output such as:

```
predicted price ± $39,000
```

should not be described as a statistically valid confidence interval unless it was calculated using an appropriate uncertainty-estimation method. It is safer to call it an **approximate error range** unless the project explicitly implements prediction intervals or another uncertainty model.

### Model prediction is not a guarantee

The model estimates patterns learned from historical data. Its output is an estimate rather than a guaranteed market price. Performance may vary for properties or regions that differ from the training data.

### Loan rules are separate from the house-price model

If the project includes a loan-eligibility endpoint based on conditions such as income, age, and employment experience, that component is a rule-based decision engine unless it loads and uses a separately trained model. It should not be described as machine learning merely because it is labeled “AI.”

## Summary

This project demonstrates a complete introductory ML deployment workflow:

```
Explore the data
      ↓
Train a Random Forest model
      ↓
Evaluate its predictions
      ↓
Save the model with Joblib
      ↓
Load the model inside FastAPI
      ↓
Validate incoming feature values
      ↓
Predict one or many house values
      ↓
Return JSON or a downloadable CSV
```

The main learning objective is to show how a trained machine-learning model can be converted into a usable web service. FastAPI handles the HTTP layer, Pydantic validates incoming data, Pandas prepares tabular inputs, Joblib stores and restores the trained model, and Scikit-learn provides the learning algorithm.

## References

[1]: https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestRegressor.html "Scikit-learn RandomForestRegressor documentation"

[2]: https://scikit-learn.org/stable/modules/generated/sklearn.datasets.fetch_california_housing.html "Scikit-learn California Housing dataset documentation"

[3]: https://fastapi.tiangolo.com/ "FastAPI documentation"

[4]: https://docs.pydantic.dev/ "Pydantic documentation"

[5]: https://joblib.readthedocs.io/ "Joblib documentation"
=======
All 9 integration and ML tests verify:
- Root API health check (`GET /`)
- ML model status & feature schema (`GET /health`)
- Live valuation inference (`POST /predict`)
- Student records & boundary validation (`GET /students/{id}`, `POST /submit-marks`)
- Loan application evaluation (`POST /predict-loan`)
- Customer queries & risk profiles (`GET /customers`, `GET /customer/{id}`)

---

## 🌟 Features Overview

| Module | Endpoint | Description |
|---|---|---|
| **Health Check** | `GET /` | Returns API status and links |
| **Model Info** | `GET /health` | Model architecture, MAE ($39k), R² (0.805) |
| **House Price ML** | `POST /predict` | Single California housing valuation |
| **Batch CSV ML** | `POST /predict-file` | Multi-row CSV file streaming predictions |
| **Sample CSV** | `GET /sample-housing-csv` | Generates sample CSV template |
| **Student Marks** | `GET /students/{id}` | Path parameter student lookup |
| **Submit Marks** | `POST /submit-marks` | Request body validation (0-100) |
| **Loan Evaluation** | `POST /predict-loan` | Pydantic multi-field rule engine |
| **Customer Queries** | `GET /customers` | Query parameter filtering (`?city=&risk_level=`) |
| **Risk Profile** | `GET /customer/{id}` | Path parameter risk score |
>>>>>>> c6d08f0 (Prepare project for GitHub Pages and Render)
