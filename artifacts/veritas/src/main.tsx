import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";

// Configure API base URL for cross-origin deployments (e.g. Netlify + Railway)
const apiUrl = "https://veritas-api-production-a354.up.railway.app";
setBaseUrl(apiUrl);

// Wire up Bearer token for every API call — reads from localStorage on each request
setAuthTokenGetter(() => localStorage.getItem("token"));

createRoot(document.getElementById("root")!).render(<App />);
