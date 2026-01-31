"use client";

import { useState, useEffect } from "react";
import { Bell, Clock, Smartphone, CheckCircle2, AlertCircle, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function HistoryPage() {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/status');
            const data = await res.json();
            setHistory(data.history);
        } catch (err) {
            console.error("Failed to fetch history:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
        const interval = setInterval(fetchHistory, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Notification History</h1>
                    <p className="text-muted-foreground">List of all broadcasts sent through the local bridge and FCM.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search history..."
                        className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-primary/50 w-64"
                    />
                </div>
            </div>

            <div className="glass-card rounded-3xl overflow-hidden border border-white/5">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/5">
                            <th className="px-6 py-4 text-sm font-semibold text-white/70">Message</th>
                            <th className="px-6 py-4 text-sm font-semibold text-white/70">Source</th>
                            <th className="px-6 py-4 text-sm font-semibold text-white/70">Time</th>
                            <th className="px-6 py-4 text-sm font-semibold text-white/70 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground italic">Loading history...</td>
                            </tr>
                        ) : history.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground italic">No notifications sent yet.</td>
                            </tr>
                        ) : history.map((item, i) => (
                            <motion.tr
                                key={item.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="hover:bg-white/5 transition-colors"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                                            <Bell className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{item.title}</p>
                                            <p className="text-xs text-muted-foreground line-clamp-1">{item.body}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Smartphone className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-xs text-white/80">Socket.io Bridge</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-xs text-white/60 flex flex-col">
                                        <span className="font-medium text-white/80">{new Date(item.timestamp).toLocaleDateString()}</span>
                                        <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-500 border border-green-500/20">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Delivered
                                    </span>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
