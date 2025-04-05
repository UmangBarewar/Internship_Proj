import axios from 'axios';
console.log("Axios instance created with base http://localhost:5001/api");
export const axiosInstance = axios.create({
  baseURL: 'http://localhost:5001/api',
  withCredentials: true, // this is done so that cookies can be sent with the request
});