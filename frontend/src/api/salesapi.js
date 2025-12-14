import axios from "axios";

const BASE_URL = "https://sales-forecast-api-6cw8.onrender.com";

export const getForecast = async (formData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/forecast`,
      formData
    );
    return response.data;
  } catch (err) {
    console.error("API Error:", err.response?.data || err.message);
    return {
      error: err.response?.data || "Failed to fetch forecast",
    };
  }
};
