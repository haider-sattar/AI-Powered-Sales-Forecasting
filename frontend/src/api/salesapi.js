import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

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
