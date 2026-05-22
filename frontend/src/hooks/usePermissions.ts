import { useAuth } from "../contexts/AuthContext";

export function usePermissions() {
  const { hasPermission, effectivePermissions, permissionLevel, landingPath } = useAuth();

  return {
    hasPermission,
    effectivePermissions,
    permissionLevel,
    landingPath,
  };
}
