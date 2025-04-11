import axios from 'axios';
console.log("Axios instance created with base http://localhost:5001/api");
export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api",
  withCredentials: true,
});