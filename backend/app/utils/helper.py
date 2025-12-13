import pandas as pd
import numpy as np
from sklearn.metrics import mean_squared_error
from prophet import Prophet

def load_csv(file_path_or_buffer):
    df = pd.read_csv(file_path_or_buffer)
    df['ds'] = pd.to_datetime(df['ds'])
    df = df.sort_values('ds').reset_index(drop=True)
    return df

def prepare_regressors(df, regressors=['Customers','Promo','StateHoliday','SchoolHoliday']):
    for col in regressors:
        if col not in df.columns:
            df[col] = 0
        df[col] = df[col].astype(float)
    return df

def calculate_metrics(actual, predicted):
    rmse = np.sqrt(mean_squared_error(actual, predicted))
    non_zero_mask = actual != 0
    mape = np.mean(np.abs((actual[non_zero_mask] - predicted[non_zero_mask]) / actual[non_zero_mask])) * 100
    return rmse, mape

def create_future_df(df, model_type, forecast_days=30, regressors=['Customers','Promo','StateHoliday','SchoolHoliday']):
    last_date = df['ds'].max()
    future_dates = pd.date_range(start=last_date + pd.Timedelta(days=1), periods=forecast_days)
    future_df = pd.DataFrame({'ds': future_dates})
    if model_type == 'enhanced':
        for col in regressors:
            future_df[col] = df[col].iloc[-1]
    return future_df
