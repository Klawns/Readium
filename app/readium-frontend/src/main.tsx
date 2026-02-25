import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker } from "./pwa/register-service-worker.ts";

createRoot(document.getElementById("root")!).render(<App />);
registerServiceWorker();
