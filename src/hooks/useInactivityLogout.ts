import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const INACTIVITY_MS = 15 * 60 * 1000;

function cleanupClientSession() {
  try {
    sessionStorage.clear();
    localStorage.clear();
  } catch {
    // ignore
  }
}

async function serverLogout() {
  try {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  } catch {
    // ignore
  }
}

export function useInactivityLogout() {
  const navigate = useNavigate();
  const timerRef = useRef<number | null>(null);
  const lastActionAtRef = useRef<number>(Date.now());
  const isLoggingOutRef = useRef(false);

  const forceRedirectToLogin = () => {
    // Prevent browser back into portal
    try {
      sessionStorage.setItem("session_expired", "1");
      // Push a dummy state so back doesn't restore portal state.
      window.history.pushState(null, document.title, window.location.href);
    } catch {
      // ignore
    }
    navigate("/login", { replace: true });
  };

  const logoutNow = async () => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;

    await serverLogout();
    cleanupClientSession();
    forceRedirectToLogin();

    // Slight delay to avoid multiple triggers
    setTimeout(() => {
      isLoggingOutRef.current = false;
    }, 500);
  };

  const resetTimer = () => {
    lastActionAtRef.current = Date.now();

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      logoutNow();
    }, INACTIVITY_MS);
  };

  useEffect(() => {
    // Back button guard: if user is coming back after logout/expiry, force login again.
    const onPopState = () => {
      try {
        const expired = sessionStorage.getItem("session_expired") === "1";
        if (expired) {
          forceRedirectToLogin();
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // If already expired (e.g., user refreshed after expiry), immediately redirect.
    try {
      if (sessionStorage.getItem("session_expired") === "1") {
        forceRedirectToLogin();
        return;
      }
    } catch {
      // ignore
    }

    const activityEvents: Array<keyof WindowEventMap> = [
      "mousemove",
      "keydown",
      "mousedown",
      "touchstart",
      "scroll",
    ];

    const handler = () => resetTimer();

    activityEvents.forEach((evt) => window.addEventListener(evt, handler, { passive: true } as any));
    // Also reset on visibility change
    document.addEventListener("visibilitychange", handler);

    resetTimer();

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      activityEvents.forEach((evt) => window.removeEventListener(evt, handler as any));
      document.removeEventListener("visibilitychange", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

