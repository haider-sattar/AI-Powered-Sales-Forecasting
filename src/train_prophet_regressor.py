import pandas as pd
import numpy as np
from prophet import Prophet
from sklearn.metrics import mean_squared_error
import joblib

# ===============================
# 1. Load preprocessed data
# ===============================
DATA_PATH = "../data/preprocessed_sales_data.csv"
df = pd.read_csv(DATA_PATH)

df['ds'] = pd.to_datetime(df['ds'])
df = df.sort_values('ds').reset_index(drop=True)

regressors = ['Customers', 'Promo', 'StateHoliday', 'SchoolHoliday']
for col in regressors:
    if col not in df.columns:
        df[col] = 0
    df[col] = df[col].astype(float)

print("Dataset loaded:", df.shape)
print(df.head())

# ===============================
# 2. Time-based split
# ===============================
split_date = df['ds'].max() - pd.Timedelta(days=60)

train_df = df[df['ds'] <= split_date].reset_index(drop=True)
val_df = df[df['ds'] > split_date].reset_index(drop=True)

print(f"Training rows: {train_df.shape[0]}")
print(f"Validation rows: {val_df.shape[0]}")

# ===============================
# 3. Initialize Prophet with regressors
# ===============================
model = Prophet(
    yearly_seasonality=True,
    weekly_seasonality=True,
    daily_seasonality=False,
    seasonality_mode="multiplicative"
)

for reg in regressors:
    model.add_regressor(reg)

# ===============================
# 4. Train model
# ===============================
model.fit(train_df[['ds','y'] + regressors])
print("Prophet with regressors trained.")

# ===============================
# 5. Forecast validation period
# ===============================
future = val_df[['ds'] + regressors]
forecast = model.predict(future)

# ===============================
# 6. Evaluation
# ===============================
eval_df = val_df[['ds','y']].copy()
eval_df['yhat'] = forecast['yhat'].values

rmse = np.sqrt(mean_squared_error(eval_df['y'], eval_df['yhat']))
non_zero_mask = eval_df['y'] != 0
mape = np.mean(np.abs((eval_df.loc[non_zero_mask,'y'] - eval_df.loc[non_zero_mask,'yhat']) / eval_df.loc[non_zero_mask,'y'])) * 100

print("\nModel Evaluation (With Regressors)")
print(f"RMSE : {rmse:.2f}")
print(f"MAPE : {mape:.2f}%")

# ===============================
# 7. Save model & forecast
# ===============================
joblib.dump(model, "../data/prophet_model_with_regressors.pkl")
forecast[['ds','yhat','yhat_lower','yhat_upper']].to_csv("../data/forecast_with_regressors.csv", index=False)
print("Model with regressors and forecast saved.")
