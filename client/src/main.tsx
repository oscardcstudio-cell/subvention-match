import { createRoot } from "react-dom/client";
import { initAnalytics, initSentryIfConsented } from "./lib/analytics";
import App from "./App";
import "./index.css";

// Les deux s'initialisent uniquement si le consentement cookies a été donné.
// Sinon, ils seront activés dynamiquement quand l'utilisateur clique "Accepter".
initSentryIfConsented();
initAnalytics();

createRoot(document.getElementById("root")!).render(<App />);
