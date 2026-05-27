import type { AuthSession, Portal } from "../types/employee";

const TOKEN_KEY = "tatari_access_token";
const PORTAL_KEY = "tatari_portal";
const LAST_ACTIVITY_KEY = "tatari_last_activity";

export const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000;

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredPortal(): Portal | null {
  const portal = localStorage.getItem(PORTAL_KEY);
  if (portal === "employee" || portal === "hr" || portal === "admin") {
    return portal;
  }
  return null;
}

export function saveSession(session: AuthSession): void {
  localStorage.setItem(TOKEN_KEY, session.token);
  localStorage.setItem(PORTAL_KEY, session.portal);
  touchLastActivity();
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PORTAL_KEY);
  localStorage.removeItem(LAST_ACTIVITY_KEY);
}

export function touchLastActivity(): void {
  localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
}

export function getLastActivity(): number | null {
  const raw = localStorage.getItem(LAST_ACTIVITY_KEY);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export function isSessionExpired(): boolean {
  const last = getLastActivity();
  if (last === null) return false;
  return Date.now() - last > INACTIVITY_TIMEOUT_MS;
}
