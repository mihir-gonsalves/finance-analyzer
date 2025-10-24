// frontend/src/api/client.ts - configures Axios HTTP client with base URL and default settings
import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:8000", // FastAPI backend
});

export default client;
