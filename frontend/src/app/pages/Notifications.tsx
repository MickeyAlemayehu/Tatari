import { useState } from "react";
import { AppLayout } from "../components/AppLayout";
import { Bell, Check, Trash2, Filter, UserPlus, Calendar, DollarSign, FileText, Award } from "lucide-react";
import { Badge } from "../components/Badge";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "alert";
  category: string;
  timestamp: string;
  read: boolean;
  icon: any;
}

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "New Leave Request",
      message: "Sarah Johnson has submitted a leave request for Mar 25-29",
      type: "info",
      category: "Leave",
      timestamp: "2 minutes ago",
      read: false,
      icon: Calendar,
    },
    {
      id: 2,
      title: "Payroll Approved",
      message: "March 2026 payroll has been approved and processed",
      type: "success",
      category: "Payroll",
      timestamp: "1 hour ago",
      read: false,
      icon: DollarSign,
    },
    {
      id: 3,
      title: "New Job Application",
      message: "5 new applications received for Senior Developer position",
      type: "info",
      category: "Recruitment",
      timestamp: "3 hours ago",
      read: false,
      icon: FileText,
    },
    {
      id: 4,
      title: "Performance Review Due",
      message: "8 performance reviews are due this week",
      type: "warning",
      category: "Performance",
      timestamp: "5 hours ago",
      read: true,
      icon: Award,
    },
    {
      id: 5,
      title: "New Employee Onboarding",
      message: "Michael Chen starts on April 15, 2026",
      type: "info",
      category: "Employee",
      timestamp: "1 day ago",
      read: true,
      icon: UserPlus,
    },
  ]);

  const [filterType, setFilterType] = useState<"all" | "unread">("all");

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((notif) => ({ ...notif, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((notif) => notif.id !== id));
  };

  const filteredNotifications =
    filterType === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-[#DCFCE7] text-[#22C55E]";
      case "warning":
        return "bg-[#FFFBEB] text-[#F59E0B]";
      case "alert":
        return "bg-[#FEF2F2] text-[#EF4444]";
      default:
        return "bg-[#EEF2FF] text-[#4F46E5]";
    }
  };

  return (
    <AppLayout
      title="Notifications"
      subtitle={`${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`}
    >
      <div className="p-6">
        {/* Actions Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-2 rounded-lg text-sm transition ${
                filterType === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-[#6B7280] border border-[#E5E7EB] hover:bg-[#F9FAFB]"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilterType("unread")}
              className={`px-4 py-2 rounded-lg text-sm transition ${
                filterType === "unread"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-[#6B7280] border border-[#E5E7EB] hover:bg-[#F9FAFB]"
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm text-[#4F46E5] hover:bg-[#EEF2FF] rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" />
            Mark all as read
          </button>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl border border-[#E5E7EB]">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-[#111827] mb-2">No notifications</h3>
              <p className="text-sm text-[#6B7280]">
                {filterType === "unread"
                  ? "You're all caught up!"
                  : "You don't have any notifications yet"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => {
                const Icon = notification.icon;
                return (
                  <div
                    key={notification.id}
                    className={`p-6 hover:bg-[#F9FAFB] transition ${
                      !notification.read ? "bg-[#EEF2FF]/30" : ""
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeColor(
                          notification.type
                        )}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <h4 className="text-sm text-[#111827] mb-1">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-[#6B7280]">
                              {notification.message}
                            </p>
                          </div>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-indigo-600 rounded-full flex-shrink-0 mt-1"></span>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" size="sm">
                              {notification.category}
                            </Badge>
                            <span className="text-xs text-[#6B7280]">
                              {notification.timestamp}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-2 text-[#6B7280] hover:bg-white hover:text-[#4F46E5] rounded-lg transition"
                                title="Mark as read"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="p-2 text-[#6B7280] hover:bg-white hover:text-[#EF4444] rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
