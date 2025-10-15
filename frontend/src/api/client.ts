// frontend/src/api/client.ts - configures Axios client to make HTTP requests and handle responses with backend API
import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:8000", // FastAPI backend
});

export default client;
