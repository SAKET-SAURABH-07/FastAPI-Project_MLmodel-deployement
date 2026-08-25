from fastapi import FastAPI

from pydantic import BaseModel

app = FastAPI()

class LoanApplication(BaseModel):
    name: str
    age: int
    income: float
    loan_amount: float
    employment_years: int

@app.post("/predict")
def predict_loan(application: LoanApplication):
    #pretend the model is trained
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