from fastapi import FastAPI

app = FastAPI()

all_customers = [
    {"id": 101, "name": "Alice Smith", "city": "New York", "risk_level": "low"},
    {"id": 102, "name": "Bob Johnson", "city": "Los Angeles", "risk_level": "medium"},
    {"id": 104, "name": "Charlie Brown", "city": "Chicago", "risk_level": "high"},
    {"id": 105, "name": "Charlie2 Brown", "city": "Chicago1", "risk_level": "high"},
    {"id": 106, "name": "Charlie3 Brown", "city": "Chicago2", "risk_level": "high"},

]

@app.get("/customers")
def get_customers(city: str, risk_level:str):
    filtered = [
        c for c in all_customers
        if c["city"] == city and c["risk_level"] == risk_level
    ]
    return{
        "city": city,
        "risk_level": risk_level,
        "count" : len(filtered),
        "results" : filtered
    }
