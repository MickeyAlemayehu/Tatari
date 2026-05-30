import { useNavigate } from "react-router";
import { Search, Menu } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { NotificationBell } from "./NotificationBell";

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  onMenuClick?: () => void;
  actions?: React.ReactNode;
}

export function AppHeader({
  title,
  subtitle,
  showSearch = true,
  onMenuClick,
  actions,
}: AppHeaderProps) {
  const navigate = useNavigate();
  const { employee } = useAuth();

  return (
    <header className="bg-white border-b border-[#E5E7EB] px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile Menu Button */}
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Title */}
          {title && (
            <div className="hidden sm:block">
              <h1 className="text-xl text-[#111827]">{title}</h1>
              {subtitle && <p className="text-sm text-[#6B7280]">{subtitle}</p>}
            </div>
          )}

          {/* Search Bar */}
          {showSearch && (
            <div className="flex-1 max-w-md hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Custom Actions */}
          {actions}

          {/* Notifications */}
          <NotificationBell />

          {/* User Profile */}
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 p-1.5 hover:bg-[#F9FAFB] rounded-lg transition"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-full flex items-center justify-center text-white text-sm">
              {employee
                ? `${employee.first_name.charAt(0)}${employee.last_name.charAt(0)}`
                : "?"}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-sm text-[#111827]">
                {employee ? `${employee.first_name} ${employee.last_name}` : "User"}
              </p>
              <p className="text-xs text-[#6B7280]">{employee?.position ?? "—"}</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
