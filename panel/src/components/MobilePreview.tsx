"use client";

import { Smartphone, Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export function MobilePreview({ title, body, imageUrl, appName = "Push Panel" }: { title: string, body: string, imageUrl?: string, appName?: string }) {
    const [time] = useState(() => {
        const d = new Date();
        return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
    });

    return (
        <div className="relative w-[280px] h-[580px] bg-[#111] rounded-[3rem] border-[8px] border-[#222] shadow-[0_0_0_2px_#333] flex flex-col overflow-hidden select-none">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-[#222] rounded-b-2xl z-20" />

            {/* Screen Content */}
            <div
                className="flex-1 bg-cover bg-center p-4 pt-12"
                style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop)' }}
            >
                <div className="text-white font-medium text-4xl mb-2 text-center mt-8 drop-shadow-md">
                    {time}
                </div>
                <div className="text-white/80 text-xs text-center drop-shadow-md">
                    Saturday, January 31
                </div>

                {/* Notification Card */}
                <AnimatePresence>
                    {(title || body) && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="mt-12 glass backdrop-blur-3xl rounded-2xl p-3 shadow-xl border border-white/20"
                        >
                            <div className="flex items-start gap-2">
                                <div className="w-5 h-5 bg-primary rounded flex items-center justify-center">
                                    <Bell className="w-3 h-3 text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider font-sans">{appName}</span>
                                        <span className="text-[10px] text-white/40">now</span>
                                    </div>
                                    <h4 className="text-sm font-bold text-white leading-tight">{title || "Notification Title"}</h4>
                                    <p className="text-xs text-white/70 line-clamp-2 mt-0.5 leading-snug">{body || "Notification message will appear here..."}</p>

                                    {imageUrl && (
                                        <div className="mt-2 rounded-lg overflow-hidden border border-white/10 h-24">
                                            <img src={imageUrl} className="w-full h-full object-cover" alt="preview" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Dock */}
            <div className="h-16 glass-card mt-auto flex items-center justify-around px-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-xl bg-white/10" />
                ))}
            </div>

            {/* Home Indicator */}
            <div className="h-4 flex items-center justify-center">
                <div className="w-24 h-1 bg-white/40 rounded-full" />
            </div>
        </div>
    );
}
