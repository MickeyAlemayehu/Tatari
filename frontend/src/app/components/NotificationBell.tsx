import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Bell, Check } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";
import type { NotificationRecord } from "../../services/notifications.service";

function routeFor(n: NotificationRecord & { reference_type?: string | null; reference_id?: number | null }): string {
  const ref = n.reference_type;
  const id = n.reference_id;
  if (!ref) return "/notifications";

  if (ref.endsWith("LeaveRequest")) return id ? `/leave/${id}` : "/leave";
  if (ref.endsWith("Applicant")) return id ? `/applicants/${id}` : "/applicants";
  if (ref.endsWith("EvaluationPeriod")) return "/performance";
  if (ref.endsWith("EvaluationAssignment")) return "/performance";
  if (ref.endsWith("PerformanceEvaluation")) return "/performance";
  if (ref.endsWith("Employee")) return id ? `/employees/${id}` : "/employees";
  return "/notifications";
}

export function NotificationBell() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const recent = notifications.slice(0, 10);

  const handleItemClick = async (n: NotificationRecord & { reference_type?: string | null; reference_id?: number | null }) => {
    if (!n.read) {
      await markRead(n.id);
    }
    setOpen(false);
    navigate(routeFor(n));
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[1.25rem] h-5 px-1 bg-[#EF4444] text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E5E7EB] rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]">
            <span className="text-sm font-medium text-[#111827]">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={() => void markAllRead()}
                className="text-xs text-[#4F46E5] hover:underline flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {recent.length === 0 ? (
              <p className="text-sm text-[#6B7280] px-4 py-6 text-center">
                You're all caught up.
              </p>
            ) : (
              recent.map((n) => {
                const item = n as NotificationRecord & {
                  reference_type?: string | null;
                  reference_id?: number | null;
                };
                return (
                  <button
                    key={n.id}
                    onClick={() => void handleItemClick(item)}
                    className={`w-full text-left px-4 py-3 border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition ${
                      n.read ? "" : "bg-[#EEF2FF]/40"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {!n.read && (
                        <span className="mt-1.5 w-2 h-2 bg-[#4F46E5] rounded-full shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#111827] truncate">{n.title}</p>
                        <p className="text-xs text-[#6B7280] line-clamp-2">{n.message}</p>
                        {n.timestamp && (
                          <p className="text-[10px] text-[#9CA3AF] mt-1">{n.timestamp}</p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <button
            onClick={() => {
              setOpen(false);
              navigate("/notifications");
            }}
            className="w-full px-4 py-3 text-sm text-[#4F46E5] hover:bg-[#F9FAFB] transition border-t border-[#E5E7EB]"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}
