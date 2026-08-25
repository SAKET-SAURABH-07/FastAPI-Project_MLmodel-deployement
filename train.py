from pathlib import Path
from sklearn.datasets import fetch_california_housing
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
import pandas as pd
import joblib

BASE_DIR = Path(__file__).resolve().parent
BACKEND_DIR = BASE_DIR / "backend"

print("Loading California Housing data...")

data = fetch_california_housing()

X = pd.DataFrame(data.data, columns=data.feature_names)
Y = data.target

print(f"Total records : {X.shape[0]}")
X_train, X_test, Y_train, Y_test = train_test_split(
    X, 
    Y, 
    test_size=0.2, 
    random_state=42
)

# Training the Random Forest Regressor
print("Training Random Forest Regressor (100 estimators)...")
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, Y_train)

y_pred = model.predict(X_test)

mae = mean_squared_error(Y_test, y_pred)
r2 = r2_score(Y_test, y_pred)

print(f"Average Error (MAE): ${mae * 100000:,.2f}")
print(f"R2 Score: {r2:.4f}")

# Save models to backend directory
model_path = BACKEND_DIR / "house_model.joblib"
columns_path = BACKEND_DIR / "house_model_columns.joblib"

joblib.dump(model, str(model_path))
joblib.dump(list(X.columns), str(columns_path))
print(f"Saved model to {model_path}")
print(f"Saved columns to {columns_path}")