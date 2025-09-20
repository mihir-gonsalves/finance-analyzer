import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:8001", // FastAPI backend
});

export default client;
