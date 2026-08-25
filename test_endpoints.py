import sys
from pathlib import Path

# Add paths
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))
sys.path.insert(0, str(BASE_DIR / "fastapi-project" / "venv"))

from app import (
    app,
    get_student,
    submit_marks,
    MarksSubmission,
    predict_loan,
    LoanApplication,
    get_customers,
    get_customer_risk,
    serve_frontend
)
from fastapi import HTTPException

def run_tests():
    print("Running FastAPI Endpoint Unit & Integration Tests...")

    # Test 1: Frontend file serving
    resp = serve_frontend()
    assert "index.html" in resp.path, "Frontend index.html path missing"
    print("  [PASSED] Test 1: Frontend Dashboard index.html FileResponse")

    # Test 2: GET /students/S001
    s = get_student("S001")
    assert s["name"] == "Alice"
    print(f"  [PASSED] Test 2: GET /students/S001 -> {s}")

    # Test 3: GET /students/S999 (404)
    try:
        get_student("S999")
        assert False, "Expected 404 HTTPException"
    except HTTPException as e:
        assert e.status_code == 404
        print(f"  [PASSED] Test 3: GET /students/S999 -> 404 ({e.detail})")

    # Test 4: POST /submit-marks (Valid)
    sub = MarksSubmission(student_id="S001", marks=92, subject="Advanced Python")
    res = submit_marks(sub)
    assert res["marks"] == 92
    print(f"  [PASSED] Test 4: POST /submit-marks (Valid) -> {res}")

    # Test 5: POST /submit-marks (Invalid marks > 100)
    try:
        sub_err = MarksSubmission(student_id="S001", marks=150, subject="Math")
        submit_marks(sub_err)
        assert False, "Expected 400 HTTPException"
    except HTTPException as e:
        assert e.status_code == 400
        print(f"  [PASSED] Test 5: POST /submit-marks (marks=150) -> 400 ({e.detail['error']})")

    # Test 6: POST /predict (Approved)
    loan_app = LoanApplication(name="Jane", age=25, income=65000, loan_amount=15000, employment_years=3)
    p_res = predict_loan(loan_app)
    assert p_res["decision"] == "approved"
    print(f"  [PASSED] Test 6: POST /predict (Approved) -> {p_res}")

    # Test 7: POST /predict (Denied)
    loan_app_denied = LoanApplication(name="John", age=20, income=30000, loan_amount=10000, employment_years=1)
    p_denied = predict_loan(loan_app_denied)
    assert p_denied["decision"] == "denied"
    print(f"  [PASSED] Test 7: POST /predict (Denied) -> {p_denied}")

    # Test 8: GET /customers (Query params)
    custs = get_customers(city="Chicago", risk_level="high")
    assert custs["count"] >= 1
    print(f"  [PASSED] Test 8: GET /customers (city=Chicago, risk_level=high) -> count={custs['count']}")

    # Test 9: GET /customer/101 (Path param)
    risk = get_customer_risk(101)
    assert risk["risk_level"] == "low"
    print(f"  [PASSED] Test 9: GET /customer/101 -> {risk}")

    print("\n>>> ALL TESTS PASSED SUCCESSFULLY! <<<")

if __name__ == "__main__":
    run_tests()
