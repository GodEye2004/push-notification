"use client";

import { useState, useEffect } from "react";
import {
  Send,
  Image as ImageIcon,
  Target,
  Globe,
  Smartphone,
  Bell,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { MobilePreview } from "@/components/MobilePreview";
import { motion } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";
import { API_URL } from "@/lib/config";

interface App {
  id: string;
  app_name: string;
  package_name: string;
  api_key: string;
  device_count?: number;
}

export default function SendNotificationPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    imageUrl: "",
    targetType: "all",
    token: "",
    selectedAppId: "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const { token } = useAuth();

  // Fetch Apps on Load
  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/apps`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setApps(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, selectedAppId: data[0].id }));
        }
      })
      .catch((err) => console.error("Failed to fetch apps:", err));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const selectedApp = apps.find((a) => a.id === formData.selectedAppId);
    if (!selectedApp) {
      setMsg({ type: "error", text: "لطفا یک برنامه معتبر انتخاب کنید." });
      setLoading(false);
      return;
    }

    try {
      const payload = {
        app_id: selectedApp.id,
        api_key: selectedApp.api_key,
        type: formData.targetType === "all" ? "all" : "device",
        value: formData.targetType === "all" ? null : formData.token,
        notification: {
          title: formData.title,
          body: formData.body,
          image: formData.imageUrl || undefined,
        },
      };

      const res = await fetch(`${API_URL}/send-notification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.status === "sent") {
        setMsg({
          type: "success",
          text: `به ${data.sent_to.length} دستگاه ارسال شد!`,
        });
        // Optional: Clear form
      } else {
        setMsg({ type: "error", text: data.error || "ارسال با خطا مواجه شد." });
      }
    } catch (err) {
      console.error(err);
      setMsg({ type: "error", text: "خطای اتصال." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">ارسال اعلان پوش</h1>
        <p className="text-muted-foreground">
          ارسال همگانی اعلان‌ها به کاربران از طریق سرور فعال.
        </p>
      </div>

      <div className="flex flex-col xl:flex-row gap-12">
        {/* Form Section */}
        <div className="flex-1 space-y-8">
          <form
            onSubmit={handleSubmit}
            className="glass-card p-8 rounded-3xl space-y-8"
          >
            {/* App Selection */}
            <div className="space-y-4">
              <label className="text-sm font-semibold text-white/70 flex items-center gap-2">
                <Bell className="w-4 h-4" /> برنامه مقصد
              </label>
              {apps.length === 0 ? (
                <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm">
                  برنامه‌ای ثبت نشده است. برای ایجاد به صفحه "برنامه‌ها" بروید.
                </div>
              ) : (
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary/50"
                  value={formData.selectedAppId}
                  onChange={(e) =>
                    setFormData({ ...formData, selectedAppId: e.target.value })
                  }
                >
                  {apps.map((app) => (
                    <option key={app.id} value={app.id} className="text-black">
                      {app.app_name} ({app.device_count || 0} دستگاه)
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Content Section */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/70">
                  عنوان اعلان
                </label>
                <input
                  type="text"
                  placeholder="مثال: سلام !"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary/50"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/70">
                  متن پیام
                </label>
                <textarea
                  placeholder="پیام خود را اینجا بنویسید..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  value={formData.body}
                  onChange={(e) =>
                    setFormData({ ...formData, body: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/70 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> آدرس تصویر (اختیاری)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary/50"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Targeting Section */}
            <div className="space-y-4 pt-6 border-t border-white/5">
              <label className="text-sm font-semibold text-white/70 flex items-center gap-2">
                <Target className="w-4 h-4" /> هدف‌گذاری مخاطبان
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, targetType: "all" })
                  }
                  className={`flex items-center justify-center gap-3 p-4 rounded-xl border transition-all ${formData.targetType === "all"
                    ? "bg-primary/20 border-primary text-primary shadow-lg shadow-primary/10"
                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                    }`}
                >
                  <Globe className="w-5 h-5" />
                  <span className="font-semibold">همه دستگاه‌ها</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, targetType: "specific" })
                  }
                  className={`flex items-center justify-center gap-3 p-4 rounded-xl border transition-all ${formData.targetType === "specific"
                    ? "bg-primary/20 border-primary text-primary shadow-lg shadow-primary/10"
                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                    }`}
                >
                  <Smartphone className="w-5 h-5" />
                  <span className="font-semibold">دستگاه خاص</span>
                </button>
              </div>

              {formData.targetType === "specific" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                >
                  <input
                    type="text"
                    placeholder="شناسه دستگاه را وارد کنید (e.g. android-unique-id...)"
                    className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary/50"
                    value={formData.token}
                    onChange={(e) =>
                      setFormData({ ...formData, token: e.target.value })
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    نکته: برای این شبیه‌ساز، شناسه دستگاه را وارد کنید نه توکن
                    پوش.
                  </p>
                </motion.div>
              )}
            </div>

            {/* Status Message */}
            {msg && (
              <div
                className={`p-4 rounded-xl flex items-center gap-2 ${msg.type === "success"
                  ? "bg-green-500/10 text-green-500 border border-green-500/20"
                  : "bg-red-500/10 text-red-500 border border-red-500/20"
                  }`}
              >
                {msg.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                {msg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || apps.length === 0}
              className="w-full py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  ارسال اعلان همگانی
                </>
              )}
            </button>
          </form>
        </div>

        {/* Preview Section */}
        <div className="hidden xl:block w-[320px]">
          <div className="sticky top-8 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 px-2">
              <Smartphone className="w-5 h-5" /> پیش‌نمایش دستگاه
            </h3>
            <div className="flex justify-center">
              <MobilePreview
                title={formData.title}
                body={formData.body}
                imageUrl={formData.imageUrl}
                appName={
                  apps.find((a) => a.id === formData.selectedAppId)?.app_name ||
                  "برنامه من"
                }
              />
            </div>
            <p className="text-center text-xs text-muted-foreground px-4">
              نمایش لحظه‌ای نحوه نمایش اعلان شما.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
