import { api } from "../lib/api";
import { saveSession, clearSession, getStoredToken, getStoredPortal } from "../lib/auth-storage";
import type { AuthSession, Employee, LoginResponse, Portal } from "../types/employee";

export async function login(
  email: string,
  password: string,
  portal: Portal
): Promise<AuthSession> {
  const response = await api.post<LoginResponse>(
    "/login",
    { email, password },
    { auth: false }
  );

  saveSession({
    token: response.access_token,
    employee: response.employee,
    portal,
  });

  const employee = (await fetchCurrentUser()) ?? response.employee;
  const session: AuthSession = { token: response.access_token, employee, portal };
  saveSession(session);
  return session;
}

export async function logout(): Promise<void> {
  const token = getStoredToken();
  if (token) {
    try {
      await api.post("/logout");
    } catch {
      // Clear local session even if the server request fails.
    }
  }
  clearSession();
}

export async function fetchCurrentUser(): Promise<Employee | null> {
  const token = getStoredToken();
  if (!token) {
    return null;
  }

  return api.get<Employee>("/me");
}

export function getStoredSession(): Pick<AuthSession, "portal"> | null {
  const portal = getStoredPortal();
  const token = getStoredToken();
  if (!portal || !token) {
    return null;
  }
  return { portal };
}
