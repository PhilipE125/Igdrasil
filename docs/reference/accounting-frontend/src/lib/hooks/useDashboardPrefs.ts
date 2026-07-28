import { useSyncExternalStore, useCallback } from "react";

const STORAGE_KEY = "dashboard-prefs";

interface DashboardPrefs {
  showAuditTrail: boolean;
}

const DEFAULTS: DashboardPrefs = { showAuditTrail: false };

function getPrefs(): DashboardPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

function setPrefs(update: Partial<DashboardPrefs>) {
  const current = getPrefs();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...update }));
  window.dispatchEvent(new Event("dashboard-prefs-change"));
}

// snapshot for useSyncExternalStore — returns a stable reference when value hasn't changed
let cachedSnapshot = getPrefs();

function subscribe(cb: () => void) {
  const handler = () => {
    cachedSnapshot = getPrefs();
    cb();
  };
  window.addEventListener("dashboard-prefs-change", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("dashboard-prefs-change", handler);
    window.removeEventListener("storage", handler);
  };
}

function getSnapshot() {
  const next = getPrefs();
  if (next.showAuditTrail !== cachedSnapshot.showAuditTrail) {
    cachedSnapshot = next;
  }
  return cachedSnapshot;
}

export function useDashboardPrefs() {
  const prefs = useSyncExternalStore(subscribe, getSnapshot);

  const setShowAuditTrail = useCallback((v: boolean) => {
    setPrefs({ showAuditTrail: v });
  }, []);

  return { showAuditTrail: prefs.showAuditTrail, setShowAuditTrail };
}
