from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class LoanApplication(BaseModel):
    age: int
    income: float
    loan_amount: float
    employment_years: int


@app.post("/predict")
def predict_loan(application: LoanApplication):

    #pretend the model is trained
    if application.income > 50000 and application.employment_years > 2:
        decision = "approved"
    else:
        decision = "denied"

    return{
        "application_age": application.age,
        "decision": decision
    }

@app.get("/customer/{customer_id}")
def get_customer(customer_id: int):
    return {
        "customer_id": customer_id
        
    }