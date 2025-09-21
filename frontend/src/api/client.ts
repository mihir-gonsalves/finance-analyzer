import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:8000", // FastAPI backend
});

export default client;
