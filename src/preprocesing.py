import pandas as pd


# Load CSV

df = pd.read_csv("/home/ali-haider/projects/AI-Powered Sales Forecasting Dashboard/data/train.csv")

# Inspect columns
print("Columns in dataset:", df.columns.tolist())
print(df.head())


# Ensure required columns

required_cols = ['Date', 'Sales']
for col in required_cols:
    if col not in df.columns:
        raise ValueError(f"Required column '{col}' not found in CSV")


# Convert Date column

df['Date'] = pd.to_datetime(df['Date'], errors='coerce')
df = df.dropna(subset=['Date'])
df = df.sort_values('Date')


# Handle optional columns

optional_cols = ['Customers', 'Promo', 'StateHoliday', 'SchoolHoliday']

# Detect which optional columns are present
available_cols = [col for col in optional_cols if col in df.columns]

# Fill missing optional columns with default 0
for col in optional_cols:
    if col not in df.columns:
        df[col] = 0

# Convert optional columns to numeric
for col in available_cols:
    df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)


# Aggregate Sales (if multiple rows per date)

agg_dict = {'Sales':'sum'}
for col in available_cols:
    agg_dict[col] = 'sum'

df = df.groupby('Date', as_index=False).agg(agg_dict)


# Handle missing / negative Sales

df['Sales'] = df['Sales'].interpolate(method='linear')
df = df[df['Sales'] >= 0]


# Prepare for Prophet

df = df.rename(columns={'Date':'ds', 'Sales':'y'})

print("Preprocessing complete. Sample data:")
print(df.head())


# Save preprocessed CSV

df.to_csv("/home/ali-haider/projects/AI-Powered Sales Forecasting Dashboard/data/preprocessed_sales_data.csv", index=False)
print("Preprocessed data saved successfully.")
