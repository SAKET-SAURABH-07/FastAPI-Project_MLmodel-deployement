# 🚀 FastAPI Learning & Interactive Showcase Dashboard

An interactive, modern web frontend showcasing all FastAPI features and learning modules built in this project — without changing any of the original backend logic.

---

## 🌟 Features Showcased

1. 🎓 **Student Marks Management (`main_s.py`)**
   - **Path Parameters**: `GET /students/{student_id}`
   - **Pydantic Validation**: `POST /submit-marks` with score range checks (0–100) and non-empty subject rules.
   - **Custom HTTP Exceptions**: Demonstrates `400 Bad Request`, `404 Not Found`, and `500 Internal Server Error`.

2. 🤖 **AI Loan Eligibility Predictor (`pyd.py` / `loan.py`)**
   - **Pydantic Request Bodies**: `POST /predict`
   - Real-time rule breakdown:
     - Income > $50,000
     - Employment Experience > 2 years
     - Age >= 21 years
   - Instant visual decision status badge (Approved vs Denied).

3. 🔍 **Customer Query Filter Studio (`query_p.py`)**
   - **Query Parameters**: `GET /customers?city=...&risk_level=...`
   - Filter customer database by City and Risk Level with live result counter and customer cards.

4. 🛡️ **Customer Risk Profile Explorer (`path_p.py`)**
   - **Path Parameters**: `GET /customer/{customer_id}`
   - Dynamic visual risk score gauge and risk classification level.

5. ⚡ **FastAPI Under the Hood & Live Console**
   - **Real-time API Inspector**: Inspects every HTTP method, status code, latency, headers, request payload, JSON response, and generates copyable `cURL` commands.
   - **Direct Documentation Links**: Instant access to Swagger UI (`/docs`) and ReDoc (`/redoc`).

---

## 🚀 How to Run

### Method 1: One-Click Launcher (Windows)
Double-click `run_server.bat` in the project folder.

### Method 2: Command Line
```bash
# Using the project's virtual environment:
fastapi-project\venv\Scripts\python.exe app.py
```
Or with standard python:
```bash
python app.py
```

Then open your browser and navigate to:
👉 **[http://127.0.0.1:8000](http://127.0.0.1:8000)**

---

## 📁 Project Structure

```
FAST-API-learning/
│
├── app.py                     # Unified FastAPI server hosting backend & frontend
├── run_server.bat             # One-click Windows startup script
├── test_endpoints.py          # Automated verification tests for all endpoints
│
├── static/                    # Frontend files
│   ├── index.html             # Responsive Dashboard UI (Tailwind + Icons)
│   ├── app.js                 # Interactive client logic & live API inspector
│   └── style.css              # Custom styling & glassmorphism theme
│
└── fastapi-project/           # Original backend learning modules
    ├── main_s.py              # Student marks & HTTPException demo
    ├── pyd.py                 # Loan application Pydantic demo
    ├── path_p.py              # Path parameters demo
    ├── query_p.py             # Query parameters demo
    ├── loan.py                # Early loan model demo
    └── main.py                # Basic FastAPI demo
```
