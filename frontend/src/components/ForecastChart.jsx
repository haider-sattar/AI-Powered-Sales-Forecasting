import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function ForecastChart({ forecastData }) {
  if (!forecastData || forecastData.length === 0) return null;

  const labels = forecastData.map((row) => {
    const date = new Date(row.ds);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  });
  
  const yhat = forecastData.map((row) => row.yhat);
  const yhat_upper = forecastData.map((row) => row.yhat_upper);
  const yhat_lower = forecastData.map((row) => row.yhat_lower);

  const data = {
    labels,
    datasets: [
      {
        label: "Forecast",
        data: yhat,
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: "#10b981",
        fill: true,
      },
      {
        label: "Upper Confidence",
        data: yhat_upper,
        borderColor: "rgba(16, 185, 129, 0.3)",
        backgroundColor: "rgba(16, 185, 129, 0.05)",
        borderWidth: 1,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: '+1',
      },
      {
        label: "Lower Confidence",
        data: yhat_lower,
        borderColor: "rgba(16, 185, 129, 0.3)",
        backgroundColor: "rgba(16, 185, 129, 0.05)",
        borderWidth: 1,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: '+1',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#f1f5f9',
          font: {
            size: 12,
            family: "'Segoe UI', sans-serif"
          },
          padding: 20,
          usePointStyle: true,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        titleColor: '#f1f5f9',
        bodyColor: '#f1f5f9',
        borderColor: '#10b981',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      },
      title: {
        display: true,
        text: 'Sales Forecast Projection',
        color: '#f1f5f9',
        font: {
          size: 16,
          weight: 'bold',
          family: "'Segoe UI', sans-serif"
        },
        padding: {
          bottom: 20
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#94a3b8',
          maxRotation: 45,
        }
      },
      y: {
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#94a3b8',
          callback: function(value) {
            return '' + value.toLocaleString();
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    elements: {
      line: {
        tension: 0.4
      }
    },
    animations: {
      tension: {
        duration: 1000,
        easing: 'linear'
      }
    }
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
}

export default ForecastChart;