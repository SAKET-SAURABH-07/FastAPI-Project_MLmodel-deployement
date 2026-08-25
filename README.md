# 🏡 California Housing ML & FastAPI Full-Stack Studio

A production-grade **FastAPI & Machine Learning** web platform that deploys a **Random Forest Regressor** trained on the California Housing dataset to provide real-time property valuations, batch CSV streaming predictions, and an interactive learning suite for REST API architectures.

---

## 🌟 Key Features

### 1. 🤖 California Housing Price Predictor (ML Model)
- **Model**: Scikit-Learn `RandomForestRegressor(n_estimators=100)`
- **Dataset**: California Housing Census dataset (20,640 records)
- **Features**: Median Income (`MedInc`), House Age (`HouseAge`), Average Rooms (`AveRooms`), Average Bedrooms (`AveBedrms`), Population (`Population`), Average Occupancy (`AveOccup`), Latitude (`Latitude`), Longitude (`Longitude`)
- **Evaluation**: Mean Absolute Error (MAE) of **± $39,000 USD** with confidence interval estimation.
- **Endpoints**: `POST /predict` and `POST /predict/house`

### 2. 📊 Batch CSV Prediction & Streaming
- Accepts `.csv` datasets containing required demographic features.
- Computes predictions across all rows without persisting files on disk using `StreamingResponse`.
- Returns an annotated CSV with `predicted_price_formatted` ready for download.
- **Endpoint**: `POST /predict-file` and `POST /predict/house-batch`

### 3. 🎓 FastAPI REST Architecture Showcase
- **Student Marks Management**: Demonstrates path parameters (`GET /students/{id}`) and Pydantic validation boundaries (`POST /submit-marks`).
- **Loan Eligibility Engine**: Multi-variable financial evaluation with Pydantic schemas (`POST /predict-loan`).
- **Customer Query & Path Explorer**: Multi-parameter search (`GET /customers?city=...&risk_level=...`) and risk profile analysis (`GET /customer/{id}`).

### 4. 💻 Interactive Developer Console & UI
- **Live cURL Generator**: Generates executable shell commands for every request.
- **Latency Tracker & JSON Viewer**: Real-time response inspection with syntax highlighting.
- **GitHub Pages Compatible**: Standalone frontend files (`index.html`, `style.css`, `app.js`) structured at repository root.

---

## 📁 Repository Structure

```
├── backend/
│   ├── server.py              # Unified FastAPI server (ML + REST endpoints)
│   └── ml_model/
│       ├── house_model.joblib # Trained Random Forest model (100 estimators)
│       └── house_model_columns.joblib # Model feature column schema
├── index.html                 # Full-stack frontend dashboard (GitHub Pages root)
├── style.css                  # Modern obsidian dark-theme stylesheet
├── app.js                     # Interactive client application logic
├── app.py                     # Root launcher entrypoint
├── run_server.bat             # One-click Windows launch script
├── test_endpoints.py          # Automated verification test suite
├── train.py                   # Model training script
├── explore.py                 # Exploratory data analysis (EDA)
├── requirements.txt           # Python dependencies
└── README.md                  # Project documentation
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the Server
Double-click `run_server.bat` or run:
```bash
python app.py
```

### 3. Open the Interactive Studio
- **Web Dashboard**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Documentation**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 🧪 Running Automated Tests
Run the comprehensive test suite verifying both ML inference and REST endpoints:
```bash
python test_endpoints.py
```

---

## 🌐 Deploying to GitHub Pages
1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "Deploy California Housing ML & FastAPI Studio"
   git push origin main
   ```
2. Navigate to **Repository Settings → Pages → Source: Deploy from branch `main` / root (`/`)**.
3. The static UI is accessible globally and connects to your local or deployed FastAPI backend!
