import { useCallback, useEffect, useState } from "react";
import { AppLayout } from "../components/AppLayout";
import { Bell, Check, Trash2, Filter, Calendar, DollarSign, FileText, Award, UserPlus } from "lucide-react";
import { Badge } from "../components/Badge";
import { AsyncState } from "../components/AsyncState";
import {
  notificationsService,
  type NotificationRecord,
} from "../../services/notifications.service";
import { ApiError } from "../../lib/api";

const iconMap: Record<string, typeof Bell> = {
  Leave: Calendar,
  Payroll: DollarSign,
  Recruitment: FileText,
  Performance: Award,
  Employee: UserPlus,
};

export function Notifications() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [filterType, setFilterType] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await notificationsService.list({
        unread: filterType === "unread",
        per_page: 50,
      });
      setNotifications(res.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  useEffect(() => {
    void load();
  }, [load]);

  const markAsRead = async (id: number) => {
    try {
      await notificationsService.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      /* ignore */
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      /* ignore */
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await notificationsService.remove(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      /* ignore */
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppLayout title="Notifications" subtitle="Stay updated with system alerts">
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-2 rounded-lg text-sm ${
                filterType === "all" ? "bg-[#4F46E5] text-white" : "bg-white border border-[#E5E7EB]"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType("unread")}
              className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${
                filterType === "unread" ? "bg-[#4F46E5] text-white" : "bg-white border border-[#E5E7EB]"
              }`}
            >
              <Filter className="w-4 h-4" />
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => void markAllAsRead()}
              className="flex items-center gap-2 text-sm text-[#4F46E5] hover:text-indigo-700"
            >
              <Check className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>

        <AsyncState loading={loading} error={error} empty={!loading && notifications.length === 0}>
          <div className="space-y-3">
            {notifications.map((notification) => {
              const Icon = iconMap[notification.category] ?? Bell;
              return (
                <div
                  key={notification.id}
                  className={`bg-white rounded-xl border p-4 ${
                    notification.read ? "border-[#E5E7EB]" : "border-[#4F46E5]/30 bg-[#EEF2FF]/30"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-[#4F46E5]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm text-[#111827]">{notification.title}</h3>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-[#4F46E5] rounded-full" />
                        )}
                        <Badge variant="default" size="sm">
                          {notification.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-[#6B7280] mb-2">{notification.message}</p>
                      <p className="text-xs text-[#6B7280]">{notification.timestamp}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {!notification.read && (
                        <button
                          onClick={() => void markAsRead(notification.id)}
                          className="p-2 text-[#6B7280] hover:text-[#4F46E5] rounded-lg"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => void deleteNotification(notification.id)}
                        className="p-2 text-[#6B7280] hover:text-[#EF4444] rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </AsyncState>
      </div>
    </AppLayout>
  );
}
