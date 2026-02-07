"use client";

import {
  Plus,
  AppWindow,
  MoreVertical,
  Shield,
  Power,
  Trash2,
  Copy,
  Check,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";

export default function AppsPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ app_name: "", package_name: "" });
  const [justRegistered, setJustRegistered] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState("");
  const { token } = useAuth();

  const fetchApps = async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:5001/apps", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setApps(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchApps();
    const interval = setInterval(fetchApps, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5001/register-app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.status === "registered") {
        setJustRegistered(data); // { app_id, api_key, status }
        fetchApps(); // refresh list
        // Don't close modal yet, show keys
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setJustRegistered(null);
    setFormData({ app_name: "", package_name: "" });
  };

  return (
    <div className="space-y-8 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            برنامه‌های ثبت شده
          </h1>
          <p className="text-muted-foreground">
            برنامه‌های متصل و تنظیمات FCM خود را مدیریت کنید.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          افزودن برنامه جدید
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {apps.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            هنوز برنامه‌ای ثبت نشده است. برای شروع روی "افزودن برنامه جدید" کلیک کنید.
          </div>
        )}
        {apps.map((app, i) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 rounded-2xl group hover:border-primary/50 transition-all"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-primary/10 transition-colors">
                <AppWindow className="w-6 h-6 text-white group-hover:text-primary transition-colors" />
              </div>
              <button className="text-muted-foreground hover:text-white p-1">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white">{app.app_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {app.package_name}
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t border-white/5">
                <div>
                  <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-1">شناسه برنامه</p>
                  <code className="text-xs bg-black/30 p-1 rounded text-white/70 block truncate">{app.id}</code>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => copyToClipboard(app.api_key, `apikey-${app.id}`)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-white/80 hover:bg-white/10 transition-all"
                >
                  <Shield className="w-3.5 h-3.5" />
                  {copiedKey === `apikey-${app.id}` ? "کپی شد" : "کپی کلید API"}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Registration Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-lg p-6 rounded-2xl border border-white/10 shadow-2xl bg-[#0f1115]"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {justRegistered ? "برنامه ثبت شد!" : "برنامه جدید"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {!justRegistered ? (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      نام برنامه
                    </label>
                    <input
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                      placeholder="مثال: برنامه من"
                      value={formData.app_name}
                      onChange={(e) =>
                        setFormData({ ...formData, app_name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      نام پکیج
                    </label>
                    <input
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                      placeholder="مثال: com.example.app"
                      value={formData.package_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          package_name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                    >
                      ثبت برنامه
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <p className="text-green-400 text-sm flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      برنامه با موفقیت ثبت شد!
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs uppercase font-bold text-white/30 tracking-widest">
                        شناسه برنامه
                      </label>
                      <div className="flex gap-2 mt-1">
                        <code className="flex-1 bg-black/30 p-3 rounded-lg text-white font-mono text-sm break-all">
                          {justRegistered.app_id}
                        </code>
                        <button
                          onClick={() => copyToClipboard(justRegistered.app_id, "id")}
                          className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 transition-colors"
                        >
                          {copiedKey === "id" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs uppercase font-bold text-white/30 tracking-widest">
                        کلید API
                      </label>
                      <div className="flex gap-2 mt-1">
                        <code className="flex-1 bg-black/30 p-3 rounded-lg text-white font-mono text-sm break-all">
                          {justRegistered.api_key}
                        </code>
                        <button
                          onClick={() => copyToClipboard(justRegistered.api_key, "key")}
                          className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 transition-colors"
                        >
                          {copiedKey === "key" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <h4 className="text-white font-semibold mb-2">کد ادغام</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        این کد را در برنامه خود کپی کنید تا دستگاه ثبت شود:
                      </p>

                      <IntegrationTabs appId={justRegistered.app_id} />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={closeModal}
                      className="w-full py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all"
                    >
                      انجام شد
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function IntegrationTabs({ appId }: { appId: string }) {
  const [activeTab, setActiveTab] = useState<"flutter" | "android">("flutter");

  const flutterCode = `// Flutter Payload
await http.post(
  Uri.parse('http://YOUR_SERVER_IP:5001/register-device'),
  headers: {'Content-Type': 'application/json'},
  body: jsonEncode({
    "app_id": "${appId}",
    "device_id": await getDeviceId(), // Implement this
    "platform": "android",
    "os_version": "14",
    "app_version": "1.0.0",
    "device_model": "Pixel 7",
    "push_token": fcmToken,
  }),
);`;

  const androidCode = `// Android Native (Kotlin) Payload
val json = JSONObject()
json.put("app_id", "${appId}")
json.put("device_id", getDeviceId())
json.put("platform", "android")
json.put("os_version", Build.VERSION.RELEASE)
json.put("app_version", "1.0.0")
json.put("device_model", Build.MODEL)
json.put("push_token", fcmToken)

val request = Request.Builder()
    .url("http://YOUR_SERVER_IP:5001/register-device")
    .post(RequestBody.create(MediaType.parse("application/json"), json.toString()))
    .build()

client.newCall(request).execute()`;

  return (
    <div className="bg-black/30 rounded-lg overflow-hidden">
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab("flutter")}
          className={`px-4 py-2 text-xs font-bold transition-colors ${activeTab === "flutter"
            ? "text-primary border-b-2 border-primary bg-white/5"
            : "text-muted-foreground hover:text-white"
            }`}
        >
          فلاتر
        </button>
        <button
          onClick={() => setActiveTab("android")}
          className={`px-4 py-2 text-xs font-bold transition-colors ${activeTab === "android"
            ? "text-primary border-b-2 border-primary bg-white/5"
            : "text-muted-foreground hover:text-white"
            }`}
        >
          اندروید نیتیو
        </button>
      </div >
      <div className="p-3 text-xs text-white/70 font-mono overflow-auto max-h-48 whitespace-pre" dir="ltr">
        {activeTab === "flutter" ? flutterCode : androidCode}
      </div>
    </div >
  );
}
