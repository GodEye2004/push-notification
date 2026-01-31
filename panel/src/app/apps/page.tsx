"use client";

import { Plus, AppWindow, MoreVertical, Shield, Power, Trash2, Activity, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function AppsPage() {
    const [activeClients, setActiveClients] = useState<any[]>([]);

    const apps = [
        { id: 1, name: "Pro App", platform: "Android", status: "Active", devices: activeClients.filter(c => c.platform === 'android').length || "0", lastSent: "2 hours ago" },
        { id: 2, name: "Store Manager", platform: "iOS", status: "Active", devices: activeClients.filter(c => c.platform === 'ios').length || "0", lastSent: "1 day ago" },
        { id: 3, name: "Delivery Suite", platform: "Web", status: "Paused", devices: activeClients.filter(c => c.platform === 'web').length || "0", lastSent: "5 days ago" },
    ];

    const fetchClients = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/status');
            const data = await res.json();
            setActiveClients(data.clients);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchClients();
        const interval = setInterval(fetchClients, 5000);
        return () => clearInterval(interval);
    }, []);
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Registered Applications</h1>
                    <p className="text-muted-foreground">Manage your connected apps and their FCM configurations.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                    <Plus className="w-5 h-5" />
                    Add New App
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                                <h3 className="text-xl font-bold text-white">{app.name}</h3>
                                <p className="text-sm text-muted-foreground">{app.platform}</p>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest">Status</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className={`w-2 h-2 rounded-full ${app.status === 'Active' ? 'bg-green-500' : 'bg-orange-500'}`} />
                                        <span className="text-sm font-medium text-white">{app.status}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest">Devices</p>
                                    <p className="text-sm font-bold text-white mt-1">{app.devices}</p>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-white/80 hover:bg-white/10 transition-all">
                                    <Shield className="w-3.5 h-3.5" />
                                    API Key
                                </button>
                                <button className="px-3 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 transition-all">
                                    <Power className="w-3.5 h-3.5" />
                                </button>
                                <button className="px-3 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-500 transition-all">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
