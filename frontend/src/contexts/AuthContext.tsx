import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ApiError } from "../lib/api";
import { canAccessPortal } from "../lib/portal-access";
import { clearSession, getStoredPortal, getStoredToken } from "../lib/auth-storage";
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
  login: (email: string, password: string, portal: Portal) => Promise<AuthSession>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
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
      if (!user || !canAccessPortal(user, storedPortal)) {
        clearSession();
        setEmployee(null);
        setPortal(null);
        return;
      }
      setEmployee(user);
      setPortal(storedPortal);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearSession();
      }
      setEmployee(null);
      setPortal(null);
    }
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      const stored = getStoredSession();
      if (!stored) {
        setIsLoading(false);
        return;
      }
      await refreshUser();
      setIsLoading(false);
    };

    void bootstrap();
  }, [refreshUser]);

  const login = useCallback(
    async (email: string, password: string, requestedPortal: Portal) => {
      const session = await loginRequest(email, password, requestedPortal);

      if (!canAccessPortal(session.employee, requestedPortal)) {
        clearSession();
        throw new ApiError(
          "Your account does not have access to this portal. Try a different login option.",
          403
        );
      }

      setEmployee(session.employee);
      setPortal(session.portal);
      return session;
    },
    []
  );

  const logout = useCallback(async () => {
    await logoutRequest();
    setEmployee(null);
    setPortal(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      employee,
      portal,
      isLoading,
      isAuthenticated: Boolean(employee && portal),
      login,
      logout,
      refreshUser,
    }),
    [employee, portal, isLoading, login, logout, refreshUser]
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
