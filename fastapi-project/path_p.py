from fastapi import FastAPI

app = FastAPI()

customer_risk_profiles = {
    101: {"name": "Alice Smith", "risk_level": "low" , "score": 0.12},
    102: {"name": "Bob Johnson", "risk_level": "medium", "score": 0.45},
    103: {"name": "Charlie Brown", "risk_level": "high", "score": 0.78},
}



@app.get("/customer/{customer_id}")
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

