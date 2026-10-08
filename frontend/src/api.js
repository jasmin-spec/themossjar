import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

// Before every request, attach the token if the user is logged in
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default api;