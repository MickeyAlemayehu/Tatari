import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { notificationsService, type NotificationRecord } from "../../services/notifications.service";
import { useAuth } from "../../contexts/AuthContext";
import { playTone } from "./sound";
import { disconnectEcho, getEcho } from "../../lib/echo";

const POLL_MS = 20000;
const WATERMARK_KEY_PREFIX = "notif_watermark_";

function watermarkKey(employeeId: number | string): string {
  return `${WATERMARK_KEY_PREFIX}${employeeId}`;
}

function readWatermark(employeeId: number | string): number {
  try {
    const raw = window.localStorage.getItem(watermarkKey(employeeId));
    return raw ? Number(raw) || 0 : 0;
  } catch {
    return 0;
  }
}

function writeWatermark(employeeId: number | string, value: number): void {
  try {
    window.localStorage.setItem(watermarkKey(employeeId), String(value));
  } catch {
    // ignore
  }
}

export function useNotifications() {
  const { isAuthenticated, employee, logout } = useAuth();
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const watermarkRef = useRef<number>(0);
  const initializedRef = useRef(false);
  const employeeId = employee?.id;

  const handleRealtimeNotification = useCallback(
    (notification: NotificationRecord) => {
      if (!employeeId) return;

      setNotifications((prev) => {
        if (prev.some((n) => n.id === notification.id)) {
          return prev;
        }
        return [notification, ...prev].slice(0, 20);
      });

      if (!notification.read) {
        setUnreadCount((count) => count + 1);
      }

      toast(notification.title, {
        description: notification.message,
      });
      playTone("receive");

      watermarkRef.current = Math.max(watermarkRef.current, notification.id);
      writeWatermark(employeeId, watermarkRef.current);
      initializedRef.current = true;
    },
    [employeeId]
  );

  const refetch = useCallback(async () => {
    if (!isAuthenticated || !employeeId) return;
    setLoading(true);
    try {
      const [listRes, countRes] = await Promise.all([
        notificationsService.list({ per_page: 20 }),
        notificationsService.unreadCount(),
      ]);

      const items = listRes.data ?? [];
      setNotifications(items);
      setUnreadCount(countRes.unreadCount);

      const persistedWatermark = readWatermark(employeeId);
      const effectiveWatermark = Math.max(watermarkRef.current, persistedWatermark);
      const highestIncoming = items.reduce((max, n) => (n.id > max ? n.id : max), 0);

      if (!initializedRef.current) {
        // First load — set baseline, don't toast historical notifications
        watermarkRef.current = highestIncoming;
        writeWatermark(employeeId, highestIncoming);
        initializedRef.current = true;
      } else if (highestIncoming > effectiveWatermark) {
        const fresh = items
          .filter((n) => n.id > effectiveWatermark)
          .sort((a, b) => a.id - b.id);

        if (fresh.length > 0) {
          for (const n of fresh) {
            toast(n.title, {
              description: n.message,
            });
          }
          playTone("receive");
        }

        watermarkRef.current = highestIncoming;
        writeWatermark(employeeId, highestIncoming);
      }
    } catch {
      // silent — keep last good state
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, employeeId]);

  useEffect(() => {
    if (!isAuthenticated || !employeeId) {
      setNotifications([]);
      setUnreadCount(0);
      initializedRef.current = false;
      return;
    }

    void refetch();

    let timer: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (timer) return;
      timer = setInterval(() => {
        if (document.visibilityState === "visible") {
          void refetch();
        }
      }, POLL_MS);
    };

    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void refetch();
        start();
      } else {
        stop();
      }
    };

    start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [isAuthenticated, employeeId, refetch]);

  useEffect(() => {
    if (!isAuthenticated || !employeeId) {
      disconnectEcho();
      return;
    }

    const echo = getEcho();
    const channelName = `notifications.${employeeId}`;
    const channel = echo.private(channelName);

    channel.listen(".notification.created", (event: { notification?: NotificationRecord }) => {
      if (event.notification) {
        handleRealtimeNotification(event.notification);
      }
    });

    channel.listen(".employee.deactivated", () => {
      toast.error("Your account has been deactivated. You have been logged out.", { duration: 5000 });
      void logout();
    });

    return () => {
      channel.stopListening(".notification.created");
      channel.stopListening(".employee.deactivated");
      echo.leave(channelName);
    };
  }, [handleRealtimeNotification, isAuthenticated, employeeId, logout]);

  const markRead = useCallback(
    async (id: number) => {
      try {
        await notificationsService.markRead(id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        // ignore
      }
    },
    []
  );

  const markAllRead = useCallback(async () => {
    try {
      await notificationsService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  }, []);

  return { notifications, unreadCount, loading, markRead, markAllRead, refetch };
}
