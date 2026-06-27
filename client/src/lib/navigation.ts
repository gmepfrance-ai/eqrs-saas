// Navigation programmatique compatible wouter en mode history (URL propres).
// Remplace les anciennes affectations `window.location.hash = "#/xxx"`.
// pushState met à jour l'URL sans recharger la page, puis on déclenche un
// événement popstate pour que le routeur wouter recalcule la route active.
export function navigateTo(path: string, options?: { replace?: boolean }) {
  // Sécurité : convertit un éventuel "#/xxx" résiduel en "/xxx"
  let target = path;
  if (target.startsWith("#")) {
    target = target.slice(1);
  }
  if (!target.startsWith("/")) {
    target = "/" + target;
  }
  if (options?.replace) {
    window.history.replaceState(null, "", target);
  } else {
    window.history.pushState(null, "", target);
  }
  window.dispatchEvent(new PopStateEvent("popstate"));
}

// Lecture des query params depuis l'URL standard (?token=...&checkout=...)
export function getQueryParams(): URLSearchParams {
  return new URLSearchParams(window.location.search);
}
