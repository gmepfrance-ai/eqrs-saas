import { useSyncExternalStore, useCallback } from "react";

// Custom hash location hook that strips query params for route matching
// but preserves them for reading
function getHashPath(): string {
  const hash = window.location.hash.slice(1) || "/";
  // Strip query params for route matching
  const qIndex = hash.indexOf("?");
  return qIndex >= 0 ? hash.slice(0, qIndex) : hash;
}

function subscribeToHash(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

export function useHashLocation(): [string, (to: string, options?: any) => void] {
  const path = useSyncExternalStore(subscribeToHash, getHashPath);

  const navigate = useCallback((to: string, options?: { replace?: boolean }) => {
    // Preserve existing query params if navigating without new ones
    if (options?.replace) {
      window.location.replace(`#${to}`);
    } else {
      window.location.hash = to;
    }
  }, []);

  return [path, navigate];
}

// Helper to get query params from hash
export function getHashQueryParams(): URLSearchParams {
  const hash = window.location.hash.slice(1) || "/";
  const qIndex = hash.indexOf("?");
  if (qIndex >= 0) {
    return new URLSearchParams(hash.slice(qIndex + 1));
  }
  return new URLSearchParams();
}
