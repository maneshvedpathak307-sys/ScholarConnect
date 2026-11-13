import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL || "http://localhost:8080"}/api`,
  headers: {
    Accept: "application/json"
  }
});

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    } else if (
      config.data &&
      typeof config.data === "object" &&
      !(config.data instanceof Blob)
    ) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  error => Promise.reject(error)
);

export default api;