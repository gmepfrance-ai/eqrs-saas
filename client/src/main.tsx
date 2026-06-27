import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Rétrocompatibilité : convertit les anciens liens en hash (#/cgv, #/tarifs, …)
// vers les nouvelles URL propres (/cgv, /tarifs) avant le rendu de l'app.
(function migrateLegacyHashUrl() {
  const h = window.location.hash;
  if (h && h.startsWith("#/")) {
    const target = h.slice(1); // retire le "#", conserve "/chemin?query"
    if (target && target !== "/") {
      window.history.replaceState(null, "", target + window.location.search);
    } else {
      window.history.replaceState(null, "", "/" + window.location.search);
    }
  }
})();

createRoot(document.getElementById("root")!).render(<App />);

// v1776261362