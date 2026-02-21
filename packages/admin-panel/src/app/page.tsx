/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Bell, Smartphone, Send, AppWindow, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { API_URL } from "@/lib/config";

export default function Home() {
  const [stats, setStats] = useState([
    {
      name: "تعداد برنامه‌ها",
      value: "0",
      icon: AppWindow,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      name: "سوکت‌های فعال",
      value: "0",
      icon: Smartphone,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      name: "ارسال شده (تاریخچه)",
      value: "0",
      icon: Send,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      name: "وضعیت سرور",
      value: "آفلاین",
      icon: Activity,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
  ]);
  type HistoryItem = {
    _id?: string;
    id?: string;
    title?: string;
    body?: string;
    notification?: Record<string, unknown> | null;
    deviceName?: string;
    device?: string;
    timestamp?: string;
    time?: string | number;
  };

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { token, logout } = useAuth();

  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      // Fetch status and apps in parallel. server `/api/status` returns:
      // { status, online_devices, online_count, history }
      const [statusRes, appsRes] = await Promise.all([
        fetch(`${API_URL}/api/status`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/apps`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null),
      ]);

      if (!statusRes || !statusRes.ok)
        throw new Error(`status ${statusRes && statusRes.status}`);
      const statusData = await statusRes.json();

      const clients = Array.isArray(statusData.online_devices)
        ? statusData.online_devices
        : [];
      const hist = Array.isArray(statusData.history) ? statusData.history : [];

      // apps count: prefer /apps response when available
      let appsCount = 0;
      if (appsRes && appsRes.ok) {
        try {
          const appsData = await appsRes.json();
          if (Array.isArray(appsData)) appsCount = appsData.length;
        } catch {
          appsCount = 0;
        }
      } else if (typeof statusData.appsCount === "number") {
        appsCount = statusData.appsCount;
      } else if (Array.isArray(statusData.apps)) {
        appsCount = statusData.apps.length;
      } else if (clients.length > 0) {
        // infer unique apps from clients if possible
        const appKeys = clients
          .map((c: unknown) => {
            if (c && typeof c === "object") {
              const co = c as Record<string, unknown>;
              return (co.appId ?? co.app ?? co.app_name ?? co.appKey) as
                | string
                | null;
            }
            return null;
          })
          .filter(Boolean) as string[];
        appsCount = new Set(appKeys).size || 0;
      }

      setStats([
        {
          name: "تعداد برنامه‌ها",
          value: (appsCount ?? 0).toString(),
          icon: AppWindow,
          color: "text-blue-500",
          bg: "bg-blue-500/10",
        },
        {
          name: "سوکت‌های فعال",
          value: (Array.isArray(clients)
            ? clients.length
            : typeof statusData.online_count === "number"
              ? statusData.online_count
              : 0
          ).toString(),
          icon: Smartphone,
          color: "text-green-500",
          bg: "bg-green-500/10",
        },
        {
          name: "ارسال شده (تاریخچه)",
          value: (hist ? hist.length : 0).toString(),
          icon: Send,
          color: "text-purple-500",
          bg: "bg-purple-500/10",
        },
        {
          name: "وضعیت سرور",
          value: statusData.status === "online" ? "آنلاین" : "آفلاین",
          icon: Activity,
          color:
            statusData.status === "online"
              ? "text-green-500"
              : "text-orange-500",
          bg:
            statusData.status === "online"
              ? "bg-green-500/20"
              : "bg-orange-500/10",
        },
      ]);

      setHistory(
        (hist as unknown[]).map((h) => ({
          ...(h as Record<string, any>),
          id: (h as any)._id ?? (h as any).id,
        })),
      );
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [token]);

  async function handleDelete(id: string) {
    if (!confirm("آیا مطمئن هستید می‌خواهید این آیتم را حذف کنید؟")) return;
    try {
      const res = await fetch(`${API_URL}/api/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("delete failed");
      setHistory((s) => s.filter((h) => h.id !== id));
    } catch (e) {
      console.error("Delete failed", e);
      alert("حذف انجام نشد");
    }
  }

  function handleLogout() {
    try {
      if (typeof logout === "function") {
        logout();
        return;
      }
      // fallback: call API then reload
      fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).finally(() => {
        window.location.href = "/login";
      });
    } catch (_) {
      window.location.href = "/login";
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            نمای کلی پیشخوان
          </h1>
          <p className="text-muted-foreground">
            خوش آمدید، در اینجا وضعیت اعلان‌های شما نمایش داده می‌شود.
          </p>
        </div>
        <div>
          <button
            onClick={handleLogout}
            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:opacity-90 transition"
          >
            خروج
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.28 }}
            className="glass-card p-6 rounded-2xl flex items-center gap-4"
          >
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">
                {stat.name}
              </p>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {stat.value}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8 rounded-2xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">فعالیت‌های اخیر</h2>
            <button
              onClick={fetchStats}
              className="text-sm text-primary hover:underline"
            >
              بازیابی
            </button>
          </div>

          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {history.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-muted-foreground"
                >
                  هیچ فعالیتی ثبت نشده است.
                </motion.div>
              )}

              {history.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.22 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5"
                >
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      {String(
                        item.title ??
                          (item.notification &&
                            (item.notification as any).title) ??
                          "بدون عنوان",
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {String(
                        item.deviceName ?? item.device ?? "دستگاه نامشخص",
                      )}{" "}
                      •{" "}
                      {item.timestamp
                        ? new Date(String(item.timestamp)).toLocaleString()
                        : item.time
                          ? new Date(String(item.time)).toLocaleString()
                          : "نامشخص"}
                    </p>
                    {(item.body ??
                      (item.notification &&
                        (item.notification as any).body)) && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {String(
                          item.body ??
                            (item.notification &&
                              (item.notification as any).body),
                        )}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() =>
                        navigator.clipboard?.writeText(JSON.stringify(item))
                      }
                      title="کپی"
                      className="px-3 py-1 bg-white/5 rounded-md text-sm hover:opacity-90 transition"
                    >
                      کپی
                    </button>
                    <button
                      onClick={() => item.id && handleDelete(item.id)}
                      title="حذف"
                      className="px-3 py-1 bg-red-700 rounded-md text-sm text-white hover:opacity-90 transition"
                    >
                      حذف
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="glass-card p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-2">
            <Send className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-white">
            آماده ارسال اعلان هستید؟
          </h2>
          <p className="text-muted-foreground max-w-xs mx-auto text-sm">
            به سادگی اعلان‌های هدفمند را به هر یک از برنامه‌های ثبت شده خود
            ارسال کنید.
          </p>
          <a
            href="/send"
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
          >
            ایجاد اعلان
          </a>
        </div>
      </div>
    </div>
  );
}
