import axios from "axios";

const BASE_URL = "https://sales-forecast-api-6cw8.onrender.com";

export const getForecast = async (formData) => {
  try {
    const response = await axios.post(`${BASE_URL}/forecast`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (err) {
    console.error(err);
    return { error: err.message };
  }
};
