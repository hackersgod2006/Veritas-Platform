import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";

// Configure API base URL for cross-origin deployments (e.g. Netlify + Render)
const apiUrl = (import.meta.env.VITE_API_URL as string | undefined) ?? "";
if (apiUrl) {
  setBaseUrl(apiUrl);
}

// Wire up Bearer token for every API call — reads from localStorage on each request
setAuthTokenGetter(() => localStorage.getItem("token"));

createRoot(document.getElementById("root")!).render(<App />);
