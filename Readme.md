# AI-Powered Sales Forecasting Dashboard

An end-to-end machine learning web application for **time-series sales forecasting** using **Facebook Prophet**, with both a **baseline model** and an **enhanced regression model**.  
The system includes a **FastAPI backend** for model inference and a **React frontend** for interactive data upload, configuration, and visualization.

---

## Project Motivation

Sales forecasting is a critical task for business planning, inventory management, and promotional strategy.  
This project demonstrates how classical **time-series forecasting** can be combined with **external regressors** and deployed as a **production-ready ML web application**.

The goal was to:
- Train and compare Prophet models
- Expose them via a REST API
- Build a clean, user-friendly frontend
- Allow predictions on **user data** or **sample data**
- Keep everything deployable on **free resources**

---

## Models Used

### 1. Baseline Prophet Model
A standard Prophet time-series model trained using only historical sales data.

**Configuration**
- Trend: Automatic
- Seasonality:
  - Yearly: Enabled
  - Weekly: Enabled
  - Daily: Disabled
- Holidays: Disabled
- Regressors: ❌ None

**Use Case**
- When only `Date` and `Sales` columns are available
- Simple, interpretable baseline forecasting

---

### 2. Enhanced Prophet Model (With Regressors)

An advanced Prophet model trained with additional business-related regressors to improve forecast accuracy.

**External Regressors Used**
- `Customers`
- `Promo`
- `StateHoliday`
- `SchoolHoliday`

**Configuration**
- Same trend and seasonality settings as baseline
- Additional regressors added using `add_regressor()`
- Automatic scaling handled by Prophet

**Use Case**
- When richer business context is available
- Captures demand spikes caused by promotions and holidays

---

## Data Preprocessing Pipeline

All preprocessing is handled **automatically on the backend** before inference.

### Column Normalization
Incoming CSV files are normalized to Prophet’s required format:

| Original Column | Renamed To |
|----------------|-----------|
| Date | ds |
| Sales | y |

### Additional Processing Steps
- Convert `ds` to datetime
- Sort data by date
- Fill missing regressor columns with `0`
- Convert categorical holiday flags to numeric
- Validate minimum data length
- Align future dataframe with selected model type

This ensures that **any compatible CSV** can be used without manual cleaning.

---

## Backend Architecture (FastAPI)

### API Endpoint

**POST** `/forecast`

### Request Parameters (FormData)

| Field | Type | Description |
|-----|------|-------------|
| `file` | CSV | Sales dataset |
| `model_type` | string | `basic` or `enhanced` |
| `forecast_days` | int | Number of days to predict |

### Backend Workflow
1. Load CSV
2. Preprocess and normalize columns
3. Select model based on `model_type`
4. Create future dataframe
5. Run Prophet prediction
6. Evaluate model on last 60 days (if available)
7. Return forecast + metrics as JSON

### Response Format
```json
{
  "forecast": [
    {
      "ds": "2025-01-01",
      "yhat": 5400,
      "yhat_lower": 5100,
      "yhat_upper": 5700
    }
  ],
  "metrics": {
    "RMSE": 312.45,
    "MAPE": 6.21
  }
}
