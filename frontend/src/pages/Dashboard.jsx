import React, { useState } from "react";
import UploadForm from "../components/UploadForm";
import ForecastChart from "../components/ForecastChart";
import "../components/styles.css";


export default function Dashboard() {
  const [forecastData, setForecastData] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [modelType, setModelType] = useState("enhanced");
  const [forecastDays, setForecastDays] = useState(30);
  const [isLoading, setIsLoading] = useState(false);

  const handlePredictionStart = () => {
    setIsLoading(true);
  };

  const handlePredictionComplete = (data, metrics) => {
    setForecastData(data);
    setMetrics(metrics);
    setIsLoading(false);
  };

  return (
  <div className="container">
    <header className="dashboard-header">
      <h2 style={{ color: 'white', textAlign: 'center', margin: '30px 0 20px' }}>
        📈 Sales Forecast Dashboard
      </h2>
      <div className="dashboard-subtitle">
        <p>Upload your sales data or use sample data to generate sales forecasts</p>
      </div>
    </header>

      <UploadForm
        setForecastData={setForecastData}
        setMetrics={setMetrics}
        modelType={modelType}
        setModelType={setModelType}
        forecastDays={forecastDays}
        setForecastDays={setForecastDays}
        onPredictionStart={handlePredictionStart}
        onPredictionComplete={handlePredictionComplete}
        isLoading={isLoading}
      />

      {metrics && !isLoading && (
        <div className="metrics">
          <div className="metric-card">
            <span className="metric-label">Root Mean Square Error</span>
            <span className="metric-value">{metrics.RMSE.toFixed(2)}</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Mean Absolute Percentage Error</span>
            <span className="metric-value">{metrics.MAPE.toFixed(2)}%</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Forecast Period</span>
            <span className="metric-value">{forecastDays} days</span>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="chart-container loading">
          <div className="spinner"></div>
          <p>Generating forecast predictions…</p>
<p>This service is hosted on a free tier, so the first response may take a little longer. Thank you for your patience.</p>
        </div>
      ) : forecastData.length > 0 ? (
        <div className="chart-container">
          <ForecastChart forecastData={forecastData} />
        </div>
      ) : (
        <div className="chart-container">
          <div className="placeholder-chart">
            <div className="placeholder-content">
              <div className="placeholder-icon">📊</div>
              <h3>No Forecast Data Yet</h3>
              <p>Upload a CSV file or use sample data to see forecast visualization</p>
            </div>
          </div>
        </div>
      )}

      <footer className="dashboard-footer">
        <p>
          <strong>Need help?</strong> Check the CSV format requirements in the upload section above.
        </p>
      </footer>
    </div>
  );
}
