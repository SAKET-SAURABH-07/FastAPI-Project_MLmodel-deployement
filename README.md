# California Housing ML & FastAPI Studio

A full-stack learning project that turns a trained machine-learning model into a web API. The application uses a **Scikit-learn Random Forest Regressor** trained on the California Housing dataset to estimate property values from demographic and geographic features.

The repository also includes batch CSV prediction, Pydantic request validation, interactive API documentation, automated tests, and educational examples of common FastAPI patterns.

> **Project goal:** Demonstrate the complete path from data exploration and model training to serving predictions through a FastAPI backend and consuming them from a static web frontend.

## Table of contents

- [Project overview](#project-overview)

- [How machine learning is used](#how-machine-learning-is-used)

- [ML pipeline](#ml-pipeline)

- [Features](#features)

- [Project structure](#project-structure)

- [API reference](#api-reference)

- [Local development](#local-development)

- [Training and exploring the model](#training-and-exploring-the-model)

- [Batch CSV prediction](#batch-csv-prediction)

- [Testing](#testing)

- [Deployment](#deployment)

- [Important implementation notes](#important-implementation-notes)

- [Technology stack](#technology-stack)

## Project overview

The application has two main parts:

1. A **FastAPI backend** that validates requests, loads the trained model, generates house-price predictions, and exposes REST endpoints.

1. A **static frontend** made with HTML, CSS, and JavaScript that provides a dashboard for interacting with the backend.

For a single prediction, the user enters eight housing features. The frontend sends those values to the API, the backend passes them to the trained model, and the predicted value is returned as JSON.

The API also supports CSV uploads. A user can provide multiple housing records in one file, and the backend returns a new CSV containing a prediction for every valid row.

The remaining endpoints are educational examples showing request-body validation, path parameters, query parameters, file uploads, error handling, and API documentation.

## How machine learning is used

The machine-learning code is separated into two stages:

| Stage | Main file | Responsibility |
| --- | --- | --- |
| Model development | `train.py` | Loads data, trains the Random Forest model, evaluates it, and saves the model artifacts. |
| Model serving | `backend/server.py` | Loads the saved artifacts and uses them to make predictions through HTTP endpoints. |

The model is trained with the California Housing dataset provided by Scikit-learn [1]. The dataset contains housing records with eight input features and a numeric target representing median house value in units of hundreds of thousands of dollars.

### Input features

| Feature | Meaning |
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

The training script creates a `RandomForestRegressor` with 100 decision trees:

```python
model = RandomForestRegressor(
    n_estimators=100,
    random_state=42
)
```

A Random Forest Regressor is an ensemble regression algorithm. It trains multiple decision trees and combines their outputs to produce a continuous numeric prediction. Here, the predicted number represents an estimated house value.

The model actually learns from the data at this line:

```python
model.fit(X_train, Y_train)
```

This is different from a manually written rule such as `if income > 50000`. The Random Forest learns relationships from the training examples rather than relying only on fixed thresholds.

### Training and testing split

The data is divided into two groups:

| Dataset portion | Purpose |
| --- | --- |
| Training set | Used by the algorithm to learn patterns between the features and house values. |
| Test set | Used after training to measure performance on records the model did not see during training. |

The project uses an 80/20 train-test split. `random_state=42` makes the split reproducible for repeated training runs with the same environment and dataset.

### Saved model artifacts

After training, the project saves two Joblib files:

```python
joblib.dump(model, "house_model.joblib")
joblib.dump(list(X.columns), "house_model_columns.joblib")
```

| File | Purpose |
| --- | --- |
| `house_model.joblib` | Serialized fitted Random Forest model. |
| `house_model_columns.joblib` | The expected feature names and their order. |

The column schema is saved because the model must receive the features in the same order used during training.

## ML pipeline

The complete machine-learning lifecycle is:

```
Explore the dataset
        ↓
Prepare features and target
        ↓
Split data into training and testing sets
        ↓
Train the Random Forest Regressor
        ↓
Evaluate predictions on the test set
        ↓
Save the model and feature schema
        ↓
Load both artifacts in FastAPI
        ↓
Validate new user input
        ↓
Generate one or many predictions
        ↓
Return JSON or a downloadable CSV
```

### Single prediction flow

```
User enters housing features
              ↓
Frontend sends POST /predict
              ↓
FastAPI validates the JSON body with Pydantic
              ↓
Values are converted into a Pandas DataFrame
              ↓
Columns are reordered to match the training schema
              ↓
Random Forest executes model.predict(...)
              ↓
The result is converted to a dollar estimate
              ↓
FastAPI returns a JSON response
```

The model output is multiplied by `100000` before display because the California Housing target is expressed in units of one hundred thousand dollars. For example, a raw model output of `3.25` is presented approximately as `$325,000`.

## Features

### House-price prediction

The primary inference endpoint is:

```
POST /predict
```

It accepts one JSON object containing the eight required features. A request has this general form:

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

The response is formatted for readability. A typical response may look like this:

```json
{
  "predicted_price": "$325,000",
  "predicted_price_short": "$3.25 hundred thousands",
  "evidence_range": "$286,000 - $364,000"
}
```

The API validates the incoming values before calling the model. For example, positive constraints are applied to most numerical features, latitude must be between `-90` and `90`, and longitude must be between `-180` and `180`.

### Batch CSV prediction

The batch inference endpoint is:

```
POST /predict-file
```

It accepts a `.csv` file containing the required feature columns. The server then:

1. Verifies that the uploaded file has a CSV extension.

1. Reads the file with Pandas.

1. Checks that all required feature columns are present.

1. Rejects empty files.

1. Runs the model for every row.

1. Adds a formatted prediction column.

1. Returns the resulting CSV as a downloadable response.

The endpoint uses FastAPI’s `StreamingResponse` so that the generated CSV can be returned directly without first writing an output file to disk.

### FastAPI learning modules

The project includes several non-ML examples:

| Module | Endpoint or concept | What it demonstrates |
| --- | --- | --- |
| Student marks | `GET /students/{id}` | Path parameters and student lookup. |
| Marks submission | `POST /submit-marks` | Pydantic request-body validation and score boundaries. |
| Loan evaluation | `POST /predict-loan` | A rule-based multi-field evaluation using Pydantic. |
| Customer filtering | `GET /customers` | Query parameters such as `city` and `risk_level`. |
| Customer risk profile | `GET /customer/{id}` | Path parameters and structured JSON responses. |

These modules demonstrate API design but are not automatically machine-learning components. Pydantic validates data, FastAPI handles HTTP requests, and the Random Forest model performs the actual house-price learning and inference.

### Interactive frontend dashboard

The static frontend provides a visual interface for the API. Depending on the implementation, it can display:

- Prediction results and formatted prices.

- Request and response JSON.

- HTTP status codes.

- Response latency.

- Headers and request payloads.

- Generated `cURL` commands.

- Links to Swagger UI and ReDoc.

The frontend can be hosted separately from the backend, provided that its API base URL is configured to point to the deployed FastAPI service.

## Project structure

```
.
├── frontend/
│   ├── index.html                 # Static web dashboard
│   ├── style.css                  # Frontend styling
│   └── app.js                     # Frontend logic and API requests
│
├── backend/
│   ├── server.py                  # FastAPI application and routes
│   ├── house_model.joblib         # Serialized trained Random Forest model
│   ├── house_model_columns.joblib # Expected feature-column order
│   └── requirements.txt           # Backend dependencies
│
├── train.py                       # Model training and artifact creation
├── explore.py                     # Exploratory data analysis
├── test_endpoints.py              # Automated tests
├── app.py                         # Local application launcher
├── run_server.bat                 # Windows startup script
├── .gitignore                     # Files excluded from Git
└── README.md                      # Project documentation
```

If your repository uses `main.py` instead of `backend/server.py`, update the structure and startup commands to match the actual file name. The important requirement is that the active FastAPI process can find both `.joblib` artifacts.

## API reference

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/` | Returns a basic API status response. |
| `GET` | `/health` | Returns service status, model information, and expected features. |
| `POST` | `/predict` | Predicts the value of one housing record. |
| `POST` | `/predict-file` | Predicts values for all rows in an uploaded CSV file. |
| `GET` | `/sample-housing-csv` | Provides a sample CSV template, if implemented by the server. |
| `GET` | `/students/{id}` | Demonstrates a path-parameter lookup. |
| `POST` | `/submit-marks` | Demonstrates validated request-body input. |
| `POST` | `/predict-loan` | Evaluates a rule-based loan request, if implemented. |
| `GET` | `/customers` | Filters customers using query parameters. |
| `GET` | `/customer/{id}` | Retrieves a customer risk profile. |
| `GET` | `/docs` | Opens FastAPI’s interactive Swagger UI. |
| `GET` | `/redoc` | Opens FastAPI’s ReDoc documentation. |

The definitive list of available routes is generated from the route definitions in the active FastAPI server.

## Local development

### Prerequisites

Install the following before starting the project:

- Python 3.9 or newer.

- `pip` for installing Python packages.

- Git, if the repository is being cloned from GitHub.

### 1. Clone the repository

```bash
git clone https://github.com/SAKET-SAURABH-07/FastAPI-Project_MLmodel-deployement.git
cd FastAPI-Project_MLmodel-deployement
```

### 2. Create a virtual environment

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

### 3. Install backend dependencies

If the dependency file is inside `backend/`, run:

```bash
cd backend
pip install -r requirements.txt
cd ..
```

If it is located at the repository root, run:

```bash
pip install -r requirements.txt
```

The environment should include the packages used by the project, such as FastAPI, Uvicorn, Pandas, Scikit-learn, Pydantic, Joblib, and multipart upload support.

### 4. Verify model artifacts

Before starting the API, confirm that the following files exist in the location expected by the server:

```
house_model.joblib
house_model_columns.joblib
```

If the code uses relative paths, start the server from the directory expected by those paths. For a more reliable deployment, construct paths relative to the Python file rather than relying on the current working directory.

## Running the application

### Using the Windows launcher

From the repository root, double-click:

```
run_server.bat
```

### Using the root launcher

```bash
python app.py
```

### Starting Uvicorn directly

If the FastAPI object is named `app` inside `backend/server.py`, run:

```bash
uvicorn backend.server:app --reload --host 127.0.0.1 --port 8000
```

If you are already inside the `backend/` directory, use:

```bash
uvicorn server:app --reload --host 127.0.0.1 --port 8000
```

After the server starts, open these resources in a browser:

| Resource | Local URL |
| --- | --- |
| Dashboard | [http://127.0.0.1:8000](http://127.0.0.1:8000) |
| Swagger UI | [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) |
| ReDoc | [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc) |

## Training and exploring the model

### Explore the dataset

Run:

```bash
python explore.py
```

The exploration script prints the dataset shape, sample rows, and descriptive statistics. This provides a basic understanding of the available features before training.

### Train the model

Run:

```bash
python train.py
```

The training script performs the following actions:

1. Downloads or loads the California Housing dataset.

1. Builds a Pandas DataFrame containing the eight input features.

1. Separates the features from the target values.

1. Splits the data into training and testing sets.

1. Trains the Random Forest Regressor.

1. Generates predictions for the test set.

1. Calculates evaluation metrics.

1. Saves the model and feature-column schema with Joblib.

Retraining overwrites the existing `.joblib` artifacts. Keep the training and serving environments compatible because serialized Scikit-learn models may depend on the Python and package versions used to create them.

## Testing

Run the test suite from the repository root:

```bash
python test_endpoints.py
```

A complete test suite should cover both REST functionality and ML inference, including:

- The root health check.

- Model status and feature-schema reporting.

- A valid single house-price prediction.

- Invalid request values.

- Missing CSV columns.

- Empty CSV files.

- Batch prediction responses.

- Student, loan, and customer demonstration endpoints, where implemented.

## Deployment

The recommended deployment separates the frontend and backend:

```
Static frontend  →  GitHub Pages
                         │
                         │ HTTPS requests
                         ↓
FastAPI backend  →  Render
```

GitHub Pages serves static files. It does not run a Python or FastAPI process. The backend must therefore be deployed to a Python-capable service such as Render, and the frontend must be configured with the public backend URL.

### Deploy the backend to Render

1. Sign in to [Render](https://render.com/).

1. Create a new **Web Service**.

1. Connect the GitHub repository.

1. Select the `main` branch.

1. If the backend is inside `backend/`, set the root directory to `backend`.

1. Use a Python environment.

1. Set the build command to:

   ```bash
   pip install -r requirements.txt
   ```

1. Set the start command to:

   ```bash
   uvicorn server:app --host 0.0.0.0 --port $PORT
   ```

1. Deploy the service and copy its public URL.

1. Verify the root and `/health` endpoints before connecting the frontend.

The exact start command depends on the selected root directory and the location of the FastAPI module. If the service root is the repository root, the command may instead need to reference the module as `backend.server:app`.

### Connect the frontend to the backend

In `frontend/app.js`, configure the API base URL:

```javascript
const API_BASE_URL = "https://your-render-service.onrender.com";
```

Replace the example URL with the actual Render service URL. Do not use `127.0.0.1` or `localhost` in the deployed frontend because those addresses refer to the visitor’s own computer.

Commit and push the configuration:

```bash
git add frontend/app.js
git commit -m "Configure production API URL"
git push origin main
```

### Deploy the frontend to GitHub Pages

1. Open the repository on GitHub.

1. Go to **Settings → Pages**.

1. Under **Build and deployment**, choose **Deploy from a branch**.

1. Select the `main` branch.

1. Select the folder containing the frontend files, such as `/frontend` or `/ (root )`, depending on the repository layout.

1. Save the configuration.

1. Open the GitHub Pages URL generated by GitHub.

The frontend will be publicly accessible, while its API requests will be sent to the Render backend.

## Important implementation notes

### The reported error metric must be labeled correctly

If the training code calls `mean_squared_error`, the result is mean squared error, not mean absolute error. To report MAE, use:

```python
from sklearn.metrics import mean_absolute_error

mae = mean_absolute_error(Y_test, y_pred)
print(f"Mean absolute error: ${mae * 100000:,.2f}")
```

To report RMSE, take the square root of the mean squared error:

```python
from sklearn.metrics import mean_squared_error

rmse = mean_squared_error(Y_test, y_pred) ** 0.5
print(f"Root mean squared error: ${rmse * 100000:,.2f}")
```

### An error range is not automatically a confidence interval

A response such as `predicted price ± $39,000` should be described as an **approximate error range** unless it was produced by a formal uncertainty-estimation method. A fixed error amount is not automatically a statistically valid confidence or prediction interval.

### Predictions are estimates, not guarantees

The model learns patterns from historical data. Its output is an estimate and should not be treated as a guaranteed market price, appraisal, lending decision, or investment recommendation. Accuracy may vary for properties or regions that differ from the training data.

### The loan module may be rule-based

If the loan endpoint evaluates conditions such as income, age, and employment experience with manually written comparisons, it is a rule-based engine rather than a trained ML model. It should be described separately from the Random Forest house-price predictor.

### Protect serialized model files

Joblib files are serialized Python objects. Load only model artifacts from trusted sources, and do not expose arbitrary model-file uploads through a public endpoint.

### Configure CORS for a separated frontend

If the frontend and backend are hosted on different domains, the FastAPI backend must allow requests from the frontend’s origin. Configure CORS explicitly for the deployed frontend rather than allowing every origin in a production deployment.

## Technology stack

| Technology | Role |
| --- | --- |
| Python | Backend and ML development language |
| FastAPI | REST API framework |
| Pydantic | Request validation and data schemas |
| Scikit-learn | Random Forest training and inference |
| Pandas | Tabular data preparation and CSV processing |
| Joblib | Saving and loading model artifacts |
| Uvicorn | ASGI server for running FastAPI |
| HTML, CSS, JavaScript | Static frontend dashboard |
| GitHub Pages | Static frontend hosting |
| Render | Backend hosting |

## Summary

This project demonstrates how a trained machine-learning model can be integrated into a web application:

```
California Housing data
        ↓
Random Forest training
        ↓
Model evaluation
        ↓
Joblib model artifacts
        ↓
FastAPI model loading
        ↓
Pydantic input validation
        ↓
Single or batch prediction
        ↓
JSON or downloadable CSV response
```

Scikit-learn provides the learning algorithm, Pandas prepares the tabular data, Joblib stores the trained model, Pydantic validates incoming values, FastAPI exposes the prediction endpoints, and the frontend gives users an interactive way to use the service.

## References

[1]: https://scikit-learn.org/stable/modules/generated/sklearn.datasets.fetch_california_housing.html "Scikit-learn California Housing dataset documentation"

[2]: https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestRegressor.html "Scikit-learn RandomForestRegressor documentation"

[3]: https://fastapi.tiangolo.com/ "FastAPI documentation"

[4]: https://docs.pydantic.dev/ "Pydantic documentation"

[5]: https://joblib.readthedocs.io/ "Joblib documentation"
