import { api, ApiError } from "../lib/api";
import { saveSession, clearSession, getStoredToken, getStoredPortal } from "../lib/auth-storage";
import type { AuthSession, Employee, LoginResponse, Portal } from "../types/employee";

function employeeFromLoginResponse(response: LoginResponse): Employee {
  return {
    ...response.employee,
    permission_level: response.permission_level ?? response.employee.permission_level,
    effective_permissions:
      response.effective_permissions ?? response.employee.effective_permissions ?? [],
    landing_path: response.landing_path ?? response.employee.landing_path,
    portal: (response.employee.portal ?? null) as Portal | null | undefined,
  };
}

/**
 * Authenticate against Laravel API (employees table). Session is only committed
 * after /me confirms the token resolves to a real database user.
 */
export async function login(email: string, password: string): Promise<AuthSession> {
  let response: LoginResponse;

  try {
    response = await api.post<LoginResponse>(
      "/login",
      { email: email.trim().toLowerCase(), password },
      { auth: false }
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      "Cannot reach the authentication server. Start the API with: php artisan serve",
      0
    );
  }

  if (!response.access_token) {
    throw new ApiError("Login response did not include an access token.", 500);
  }

  const preliminary = employeeFromLoginResponse(response);
  const preliminaryPortal = preliminary.portal as Portal | null | undefined;

  if (!preliminaryPortal) {
    throw new ApiError(
      "Your account has no portal access. Contact your administrator.",
      403
    );
  }

  // Store token so the next request can hit /me and load the user from the database.
  saveSession({
    token: response.access_token,
    employee: preliminary,
    portal: preliminaryPortal,
  });

  const employee = await fetchCurrentUser();
  if (!employee) {
    clearSession();
    throw new ApiError(
      "Login succeeded but the server could not verify your session. Check API authentication.",
      401
    );
  }

  const portal = (employee.portal as Portal | null | undefined) ?? preliminaryPortal;
  if (!portal) {
    clearSession();
    throw new ApiError(
      "Your account has no portal access. Contact your administrator.",
      403
    );
  }

  const session: AuthSession = {
    token: response.access_token,
    employee,
    portal,
  };

  saveSession(session);
  return session;
}

export async function changeMyPassword(
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> {
  return api.post<{ message: string }>("/me/password", {
    current_password: currentPassword,
    new_password: newPassword,
  });
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

  try {
    return await api.get<Employee>("/me");
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      clearSession();
      return null;
    }
    throw error;
  }
}

export function getStoredSession(): Pick<AuthSession, "portal"> | null {
  const portal = getStoredPortal();
  const token = getStoredToken();
  if (!portal || !token) {
    return null;
  }
  return { portal };
}
