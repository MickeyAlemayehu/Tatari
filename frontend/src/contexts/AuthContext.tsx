import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ApiError } from "../lib/api";
import { canAccessPortal, getDefaultDashboard } from "../lib/portal-access";
import { hasDashboardPermission } from "../lib/dashboard-permissions";
import {
  clearSession,
  getStoredPortal,
  getStoredToken,
  isSessionExpired,
  saveSession,
  touchLastActivity,
} from "../lib/auth-storage";
import {
  fetchCurrentUser,
  getStoredSession,
  login as loginRequest,
  logout as logoutRequest,
} from "../services/auth.service";
import type { AuthSession, Employee, Portal } from "../types/employee";

interface AuthContextValue {
  employee: Employee | null;
  portal: Portal | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthSession>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  effectivePermissions: string[];
  permissionLevel: number | null;
  landingPath: string;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [portal, setPortal] = useState<Portal | null>(getStoredPortal());
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getStoredToken();
    const storedPortal = getStoredPortal();

    if (!token || !storedPortal) {
      setEmployee(null);
      setPortal(null);
      return;
    }

    try {
      const user = await fetchCurrentUser();
      const resolvedPortal = (user?.portal as Portal | null | undefined) ?? storedPortal;

      if (!user || !resolvedPortal || !canAccessPortal(user, resolvedPortal)) {
        clearSession();
        setEmployee(null);
        setPortal(null);
        return;
      }

      setEmployee(user);
      setPortal(resolvedPortal);
      saveSession({ token, employee: user, portal: resolvedPortal });
    } catch (error) {
      clearSession();
      setEmployee(null);
      setPortal(null);
      if (error instanceof ApiError && error.status !== 401) {
        console.error("Session refresh failed:", error.message);
      }
    }
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      const stored = getStoredSession();
      if (!stored) {
        setIsLoading(false);
        return;
      }
      if (isSessionExpired()) {
        clearSession();
        setEmployee(null);
        setPortal(null);
        setIsLoading(false);
        return;
      }
      await refreshUser();
      setIsLoading(false);
    };

    void bootstrap();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const session = await loginRequest(email, password);

    if (!session.portal || !canAccessPortal(session.employee, session.portal)) {
      clearSession();
      throw new ApiError(
        "Your account does not have access to the application. Contact your administrator.",
        403
      );
    }

    setEmployee(session.employee);
    setPortal(session.portal);
    return session;
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setEmployee(null);
    setPortal(null);
  }, []);

  const isAuthenticated = Boolean(employee && portal);
  const logoutRef = useRef(logout);
  logoutRef.current = logout;

  useEffect(() => {
    if (!isAuthenticated) return;

    touchLastActivity();

    let lastWrite = Date.now();
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastWrite < 30_000) return;
      lastWrite = now;
      touchLastActivity();
    };

    const events: (keyof WindowEventMap)[] = [
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
    ];
    events.forEach((event) => window.addEventListener(event, handleActivity, { passive: true }));

    const interval = window.setInterval(() => {
      if (isSessionExpired()) {
        void logoutRef.current();
      }
    }, 30_000);

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      window.clearInterval(interval);
    };
  }, [isAuthenticated]);

  const effectivePermissions = employee?.effective_permissions ?? [];
  const permissionLevel = employee?.permission_level ?? null;
  const landingPath = employee ? getDefaultDashboard(employee) : "/login";
  const hasPermission = useCallback(
    (permission: string) => hasDashboardPermission(effectivePermissions, permission),
    [effectivePermissions]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      employee,
      portal,
      isLoading,
      isAuthenticated,
      login,
      logout,
      refreshUser,
      effectivePermissions,
      permissionLevel,
      landingPath,
      hasPermission,
    }),
    [
      employee,
      portal,
      isLoading,
      isAuthenticated,
      login,
      logout,
      refreshUser,
      effectivePermissions,
      permissionLevel,
      landingPath,
      hasPermission,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
