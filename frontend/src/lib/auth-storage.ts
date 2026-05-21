import type { AuthSession, Portal } from "../types/employee";

const TOKEN_KEY = "tatari_access_token";
const PORTAL_KEY = "tatari_portal";

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
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PORTAL_KEY);
}
