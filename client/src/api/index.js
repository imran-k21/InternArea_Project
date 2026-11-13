import axios from "axios";
import { auth } from "../firebase/firebase";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "",
  timeout: 20000,
});

api.interceptors.request.use(async (config) => {
  const adminToken = typeof window !== "undefined"
    ? window.sessionStorage.getItem("internarea_admin_token")
    : null;

  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (auth.currentUser) {
    const firebaseToken = await auth.currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${firebaseToken}`;
  }

  return config;
});

export default api;
