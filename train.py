from sklearn.datasets import fetch_california_housing
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error , r2_score
import pandas as pd
import joblib

print("Loading data...")

data = fetch_california_housing()

X = pd.DataFrame(data.data, columns=data.feature_names)
Y = data.target

print(f"total records : {X.shape[0]}")
X_train, X_test, Y_train, Y_test = train_test_split(
    X, 
    Y, 
    test_size=0.2, 
    random_state=42
    )

#training the model
model = RandomForestRegressor(n_estimators=100, random_state=42)

model.fit(X_train, Y_train)

y_pred = model.predict(X_test)

mae = mean_squared_error(Y_test, y_pred)
r2 = r2_score(Y_test, y_pred)

print(f"average error: ${mae * 100000:,.2f}")

joblib.dump(model, "house_model.joblib")
joblib.dump(list(X.columns), "house_model_columns.joblib")