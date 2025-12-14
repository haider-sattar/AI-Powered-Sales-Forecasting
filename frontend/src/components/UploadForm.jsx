import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import "../components/styles.css";

export default function UploadForm({
  setForecastData,
  setMetrics,
  modelType,
  setModelType,
  forecastDays,
  setForecastDays,
  onPredictionStart,
  onPredictionComplete,
  isLoading
}) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [usingSampleData, setUsingSampleData] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles[0]) {
        setFile(acceptedFiles[0]);
        setError("");
        setUsingSampleData(false);
      }
    },
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxFiles: 1,
    onDropRejected: () => {
      setError("Please upload only CSV files");
    }
  });

  const handlePredictFile = async () => {
    if (!file) {
      setError("Please select a CSV file first!");
      return;
    }
    await makePrediction(file);
  };

  const handlePredictSample = async () => {
    try {
      if (onPredictionStart) {
        onPredictionStart();
      }
      setError("");
      setUsingSampleData(true);
      
      // Fetch sample data from public folder
      const response = await fetch("/sample_data1.csv");
      if (!response.ok) {
        throw new Error("Failed to load sample data file");
      }
      
      const csvText = await response.text();
      
      // Validate CSV format
      const lines = csvText.split('\n');
      const headers = lines[0].split(',');
      
      if (!headers.includes('ds') || !headers.includes('y')) {
        throw new Error("Sample CSV must have 'ds' and 'y' columns");
      }
      
      const sampleFile = new File([csvText], "sample_data.csv", { 
        type: "text/csv" 
      });
      
      setFile(sampleFile);
      await makePrediction(sampleFile);
    } catch (err) {
      console.error("Sample data error:", err);
      setError(err.message || "Failed to load sample data!");
      setUsingSampleData(false);
      if (onPredictionComplete) {
        onPredictionComplete([], null);
      }
    }
  };

  const makePrediction = async (fileToSend) => {
    if (onPredictionStart) {
      onPredictionStart();
    }
    setError("");

    const formData = new FormData();
    formData.append("file", fileToSend);
    formData.append("model_type", modelType);
    formData.append("forecast_days", forecastDays);

    try {
      const response = await fetch("https://sales-forecast-api-6cw8.onrender.com/forecast", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setForecastData(data.forecast || []);
      setMetrics(data.metrics || null);
      
      if (onPredictionComplete) {
        onPredictionComplete(data.forecast || [], data.metrics || null);
      }
    } catch (err) {
      console.error("Prediction error:", err);
      setError(err.message || "Prediction failed. Please check your backend server is running.");
      if (onPredictionComplete) {
        onPredictionComplete([], null);
      }
    }
  };

  return (
    <div className="controls-container">
      {/* File Upload Section */}
      <div className="upload-section">
        <h3>📁 Upload Sales Data</h3>
        <p className="section-description">
  Upload your CSV file containing historical sales data for forecasting.
</p>

<p style={{ color: '#94a3b8', margin: '15px 0', lineHeight: '1.6' }}>
  <strong style={{ color: '#f1f5f9' }}>Required columns (same names):</strong>{' '}
  <code style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', padding: '2px 6px', borderRadius: '4px' }}>ds</code> (date),{' '}
  <code style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', padding: '2px 6px', borderRadius: '4px' }}>y</code> (sales).{' '}
  <strong style={{ color: '#f1f5f9' }}>Optional:</strong>{' '}
  <code style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', padding: '2px 6px', borderRadius: '4px' }}>Customers</code>,{' '}
  <code style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', padding: '2px 6px', borderRadius: '4px' }}>Promo</code>,{' '}
  <code style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', padding: '2px 6px', borderRadius: '4px' }}>StateHoliday</code>,{' '}
  <code style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', padding: '2px 6px', borderRadius: '4px' }}>SchoolHoliday</code>.
</p>
        
        <div 
          {...getRootProps()} 
          className={`file-drop ${isDragActive ? 'drag-active' : ''} ${usingSampleData ? 'sample-active' : ''}`}
        >
          <input {...getInputProps()} />
          {file ? (
            <div>
              <div className="file-icon">
                {usingSampleData ? '🧪' : '✅'}
              </div>
              <strong>{file.name}</strong>
              <p className="file-hint">
                {usingSampleData ? 'Using sample dataset' : 'Click or drag to replace file'}
              </p>
            </div>
          ) : isDragActive ? (
            <div>
              <div className="file-icon">⬆️</div>
              <strong>Drop the CSV file here</strong>
            </div>
          ) : (
            <div>
              <div className="file-icon">📁</div>
              <strong>Drag & drop a CSV file here</strong>
              <p className="file-hint">
                or click to browse files
              </p>
            </div>
          )}
        </div>

        {file && (
          <div className="file-info">
            <span>📄 Selected: {file.name}</span>
            <span>📦 Size: {(file.size / 1024).toFixed(2)} KB</span>
            <span>{usingSampleData ? '🧪 Sample Data' : '📤 Your Data'}</span>
          </div>
        )}

        {/* Quick Sample Info */}
        <div className="sample-info">
          <p>
            <strong>💡 Quick Start:</strong> Don't have a CSV file? Use our sample dataset with realistic sales data by clicking "Predict on Sample Data" below.
          </p>
        </div>
      </div>

      {/* Model Selection Guidance */}
      <div className="model-guidance">
        <h3>🤔 Which Model Should You Choose?</h3>
        <div className="guidance-content">
          <div className="guidance-item">
            
            <div>
              <h4>Choose Baseline Model if:</h4>
              <ul>
                <li>Your CSV file only contains <strong>dates (ds)</strong> and <strong>sales (y)</strong></li>
                <li>You don't have additional features like customer count or holiday data</li>
                <li>You want a simple trend and seasonality forecast</li>
              </ul>
            </div>
          </div>
          
          <div className="guidance-item">
            
            <div>
              <h4>Choose Enhanced Model if:</h4>
              <ul>
                <li>Your CSV file has additional columns: <strong>Customers, Promo, StateHoliday, SchoolHoliday</strong></li>
                <li>You want to include external factors that affect sales</li>
                <li>You need more accurate predictions with regressors</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Model Configuration Section */}
      <div className="configuration-section">
        <h3>⚙️ Forecast Configuration</h3>
        
        <div className="toggle-container">
          <div className="model-selection">
            <strong>Model Type:</strong>
            <div className="model-options">
              <label className="radio-label">
                <input
                  type="radio"
                  name="model"
                  value="baseline"
                  checked={modelType === "baseline"}
                  onChange={() => setModelType("baseline")}
                  disabled={isLoading}
                />
                <span className="radio-custom"></span>
                <span>Baseline</span>
              </label>
              
              <label className="radio-label">
                <input
                  type="radio"
                  name="model"
                  value="enhanced"
                  checked={modelType === "enhanced"}
                  onChange={() => setModelType("enhanced")}
                  disabled={isLoading}
                />
                <span className="radio-custom"></span>
                <span>Enhanced</span>
              </label>
            </div>
          </div>

          <div className="forecast-selection">
            <strong>Forecast Period:</strong>
            <div className="forecast-input-group">
              <input
                type="number"
                className="forecast-input"
                value={forecastDays}
                onChange={(e) => {
                  const value = Math.min(Math.max(1, Number(e.target.value)), 365);
                  setForecastDays(value);
                }}
                min={1}
                max={365}
                disabled={isLoading}
              />
              <span>days</span>
            </div>
          </div>
        </div>

        {/* Selected Model Description */}
        <div className="selected-model-description">
          <div className={`model-description-card ${modelType === 'baseline' ? 'active' : ''}`}>
            <h4>
              
              Baseline Model Selected
            </h4>
            <p>Basic Prophet model using only date and sales data. Good for simple trend analysis.</p>
          </div>
          
          <div className={`model-description-card ${modelType === 'enhanced' ? 'active' : ''}`}>
            <h4>
              
              Enhanced Model Selected
            </h4>
            <p>Includes regressors: Customers, Promo, StateHoliday, SchoolHoliday for more accurate predictions.</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-section">
        <h3>🚀 Generate Forecast</h3>
        <div className="button-group">
          <button 
            className="btn btn-primary"
            onClick={handlePredictFile}
            disabled={!file || isLoading}
          >
            {isLoading && !usingSampleData ? (
              <>
                <span className="spinner-small"></span>
                Processing Your Data...
              </>
            ) : (
              <>
                📊 Predict on Uploaded File
              </>
            )}
          </button>
          
          <button 
            className="btn btn-secondary"
            onClick={handlePredictSample}
            disabled={isLoading}
          >
            {isLoading && usingSampleData ? (
              <>
                <span className="spinner-small"></span>
                Loading Sample Data...
              </>
            ) : (
              <>
                🧪 Predict on Sample Data
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <div>
              <strong>Error:</strong>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="instructions">
        <h4>📋 CSV Format Requirements</h4>
        <ul>
          <li><strong>Required columns:</strong> ds (date), y (sales)</li>
          <li><strong>Optional columns:</strong> Customers, Promo, StateHoliday, SchoolHoliday</li>
          <li><strong>Date format:</strong> YYYY-MM-DD (e.g., 2013-01-01)</li>
          <li><strong>Sales (y):</strong> Numeric values only</li>
          <li><strong>Promo/Holidays:</strong> Use 0/1 for binary indicators</li>
        </ul>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid #ffffff;
          border-top: 2px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          display: inline-block;
        }
        
        .file-icon {
          font-size: 2rem;
          margin-bottom: 10px;
        }
        
        .file-hint {
          color: #94a3b8;
          margin-top: 5px;
        }
        
        .sample-active {
          border-color: var(--secondary) !important;
          background: rgba(16, 185, 129, 0.05) !important;
        }
        
        .file-info {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          align-items: center;
          background: var(--dark-surface-light);
          border-radius: 8px;
          padding: 12px 20px;
          margin-top: 15px;
          animation: fadeIn 0.3s ease;
        }
        
        .file-info span {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
