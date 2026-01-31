"use client";

import { Bell, Smartphone, Send, AppWindow, TrendingUp, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Home() {
  const [stats, setStats] = useState([
    { name: "Total Apps", value: "3", icon: AppWindow, color: "text-blue-500", bg: "bg-blue-500/10" },
    { name: "Active Sockets", value: "0", icon: Smartphone, color: "text-green-500", bg: "bg-green-500/10" },
    { name: "Sent (History)", value: "0", icon: Send, color: "text-purple-500", bg: "bg-purple-500/10" },
    { name: "Server Status", value: "Offline", icon: Activity, color: "text-orange-500", bg: "bg-orange-500/10" },
  ]);
  const [history, setHistory] = useState<any[]>([]);

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/status');
      const data = await res.json();
      setStats([
        { name: "Total Apps", value: "3", icon: AppWindow, color: "text-blue-500", bg: "bg-blue-500/10" },
        { name: "Active Sockets", value: data.clients.length.toString(), icon: Smartphone, color: "text-green-500", bg: "bg-green-500/10" },
        { name: "Sent (History)", value: data.history.length.toString(), icon: Send, color: "text-purple-500", bg: "bg-purple-500/10" },
        { name: "Server Status", value: "Online", icon: Activity, color: "text-green-500", bg: "bg-green-500/20" },
      ]);
      setHistory(data.history);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back, here's what's happening with your notifications.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 rounded-2xl flex items-center gap-4"
          >
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">{stat.name}</p>
              <h3 className="text-2xl font-bold text-white tracking-tight">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8 rounded-2xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Recent Activities</h2>
            <button className="text-sm text-primary hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Broadcast sent to "App Store Pro"</p>
                  <p className="text-xs text-muted-foreground">3,200 devices targeted • 2 minutes ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-2">
            <Send className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-white">Ready to reach your users?</h2>
          <p className="text-muted-foreground max-w-xs mx-auto text-sm">
            Easily send targeted push notifications to any of your registered applications.
          </p>
          <a
            href="/send"
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
          >
            Create Notification
          </a>
        </div>
      </div>
    </div>
  );
}
