from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd
from io import BytesIO

from app.utils.helper import load_csv, prepare_regressors, calculate_metrics, create_future_df


# FastAPI Setup

app = FastAPI(title="Sales Forecast API")

# Allow frontend calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Load Prophet Models

basic_model = joblib.load("app/models/prophet_model_basic.pkl")
enhanced_model = joblib.load("app/models/prophet_model_with_regressors.pkl")


# Routes


@app.post("/forecast")
async def forecast_sales(
    model_type: str = Form(...),  # "basic" or "enhanced"
    forecast_days: int = Form(30),
    file: UploadFile = File(None)
):
    # Load dataset
    if file:
        df = load_csv(file.file)

        # === Preprocess: Rename columns to what Prophet expects ===
        if 'Date' in df.columns:
            df = df.rename(columns={'Date': 'ds'})
        if 'Sales' in df.columns:
            df = df.rename(columns={'Sales': 'y'})

        # Ensure 'ds' is datetime and 'y' is float
        df['ds'] = pd.to_datetime(df['ds'])
        df['y'] = df['y'].astype(float)
    else:
        return {"error": "No CSV uploaded."}

    regressors = ['Customers','Promo','StateHoliday','SchoolHoliday']
    if model_type == "enhanced":
        df = prepare_regressors(df, regressors)
        model = enhanced_model
    else:
        model = basic_model

    # Create future dataframe
    future_df = create_future_df(df, model_type, forecast_days, regressors)

    # Forecast
    forecast_future = model.predict(future_df)

    # Evaluation on last 60 days
    eval_result = {}
    if len(df) > 60:
        val_df = df.tail(60).reset_index(drop=True)
        cols_for_pred = ['ds'] + (regressors if model_type=="enhanced" else [])
        forecast_val = model.predict(val_df[cols_for_pred])
        rmse, mape = calculate_metrics(val_df['y'], forecast_val['yhat'].values)
        eval_result = {"RMSE": rmse, "MAPE": mape}

    # Return JSON
    forecast_json = forecast_future[['ds','yhat','yhat_lower','yhat_upper']].to_dict(orient='records')
    return {
        "forecast": forecast_json,
        "metrics": eval_result
    }
