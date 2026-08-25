"""
Automated Endpoint & ML Model Verification Tests
"""
import sys
from pathlib import Path
import io

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

from backend.server import (
    app,
    health,
    predict_house_price,
    HouseFeatures,
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
    print("=" * 65)
    print("Running FastAPI & ML Model Integration Test Suite...")
    print("=" * 65)

    # Test 1: Frontend file serving
    resp = serve_frontend()
    assert "index.html" in resp.path, "Frontend index.html path missing"
    print("  [PASSED] Test 1: Frontend Dashboard index.html FileResponse")

    # Test 2: ML Model Health Status
    h = health()
    assert h["status"] == "running", f"ML Model health returned {h['status']}"
    print(f"  [PASSED] Test 2: GET /health -> Model: {h['model']}, Features: {len(h['features'])}")

    # Test 3: ML House Price Prediction
    sample_house = HouseFeatures(
        MedInc=8.3252,
        HouseAge=41.0,
        AveRooms=6.9841,
        AveBedrms=1.0238,
        Population=322.0,
        AveOccup=2.5555,
        Latitude=37.88,
        Longitude=-122.23
    )
    pred = predict_house_price(sample_house)
    assert "predicted_price" in pred and pred["raw_price_usd"] > 0
    print(f"  [PASSED] Test 3: POST /predict (House ML) -> {pred['predicted_price']} (Range: {pred['evidence_range']})")

    # Test 4: Student Marks GET
    s = get_student("S001")
    assert s["name"] == "Alice"
    print(f"  [PASSED] Test 4: GET /students/S001 -> {s}")

    # Test 5: Student Marks 404
    try:
        get_student("S999")
        assert False, "Expected 404 HTTPException"
    except HTTPException as e:
        assert e.status_code == 404
        print(f"  [PASSED] Test 5: GET /students/S999 -> 404 ({e.detail})")

    # Test 6: Submit Marks POST (Valid)
    sub = MarksSubmission(student_id="S001", marks=92, subject="Advanced ML")
    res = submit_marks(sub)
    assert res["marks"] == 92
    print(f"  [PASSED] Test 6: POST /submit-marks (Valid) -> {res['message']}")

    # Test 7: Submit Marks POST (Invalid)
    try:
        sub_err = MarksSubmission(student_id="S001", marks=150, subject="Math")
        submit_marks(sub_err)
        assert False, "Expected 400 HTTPException"
    except HTTPException as e:
        assert e.status_code == 400
        print(f"  [PASSED] Test 7: POST /submit-marks (Invalid marks > 100) -> 400")

    # Test 8: Loan Prediction
    loan_app = LoanApplication(name="Jane", age=25, income=65000, loan_amount=15000, employment_years=3)
    p_res = predict_loan(loan_app)
    assert p_res["decision"] == "approved"
    print(f"  [PASSED] Test 8: POST /predict-loan -> Decision: {p_res['decision'].upper()}")

    # Test 9: Customer Queries & Path Parameters
    custs = get_customers(city="Chicago", risk_level="high")
    assert custs["count"] >= 1
    risk = get_customer_risk(101)
    assert risk["risk_level"] == "low"
    print(f"  [PASSED] Test 9: GET /customers & /customer/101 -> Verified Customer Analytics")

    print("\n" + "=" * 65)
    print(">>> ALL 9 ML & FASTAPI TESTS PASSED SUCCESSFULLY! <<<")
    print("=" * 65)

if __name__ == "__main__":
    run_tests()
