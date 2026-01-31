"use client";

import { useState } from "react";
import { Send, Image as ImageIcon, Target, Globe, Smartphone, Bell, Loader2, CheckCircle2 } from "lucide-react";
import { MobilePreview } from "@/components/MobilePreview";
import { motion } from "framer-motion";

export default function SendNotificationPage() {
    const [formData, setFormData] = useState({
        title: "",
        body: "",
        imageUrl: "",
        targetType: "all",
        token: "",
        appName: "Pro App",
        delay: "0"
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        try {
            const res = await fetch('/api/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    target: formData.targetType === 'all' ? 'all' : formData.token
                }),
            });
            const data = await res.json();
            if (data.success) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Send Push Notification</h1>
                <p className="text-muted-foreground">Draft and broadcast notifications to your users across different apps.</p>
            </div>

            <div className="flex flex-col xl:flex-row gap-12">
                {/* Form Section */}
                <div className="flex-1 space-y-8">
                    <form onSubmit={handleSubmit} className="glass-card p-8 rounded-3xl space-y-8">
                        {/* App Selection Mock */}
                        <div className="space-y-4">
                            <label className="text-sm font-semibold text-white/70 flex items-center gap-2">
                                <Bell className="w-4 h-4" /> Destination Application
                            </label>
                            <select
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary/50"
                                value={formData.appName}
                                onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                            >
                                <option value="Pro App">Pro App (Android/iOS)</option>
                                <option value="Store Manager">Store Manager</option>
                                <option value="Delivery Suite">Delivery Suite</option>
                            </select>
                        </div>

                        {/* Content Section */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-white/70">Notification Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Special Offer Just for You!"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary/50"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-white/70">Message Body</label>
                                <textarea
                                    placeholder="Tell your users something exciting..."
                                    rows={4}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                    value={formData.body}
                                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-white/70 flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4" /> Image URL (Optional)
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary/50"
                                    value={formData.imageUrl}
                                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Targeting Section */}
                        <div className="space-y-4 pt-6 border-t border-white/5">
                            <label className="text-sm font-semibold text-white/70 flex items-center gap-2">
                                <Target className="w-4 h-4" /> Audience Targeting
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, targetType: 'all' })}
                                    className={`flex items-center justify-center gap-3 p-4 rounded-xl border transition-all ${formData.targetType === 'all'
                                            ? 'bg-primary/20 border-primary text-primary shadow-lg shadow-primary/10'
                                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                                        }`}
                                >
                                    <Globe className="w-5 h-5" />
                                    <span className="font-semibold">All Devices</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, targetType: 'specific' })}
                                    className={`flex items-center justify-center gap-3 p-4 rounded-xl border transition-all ${formData.targetType === 'specific'
                                            ? 'bg-primary/20 border-primary text-primary shadow-lg shadow-primary/10'
                                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                                        }`}
                                >
                                    <Smartphone className="w-5 h-5" />
                                    <span className="font-semibold">Specific Token</span>
                                </button>
                            </div>

                            {formData.targetType === 'specific' && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                    <input
                                        type="text"
                                        placeholder="Enter device FCM token"
                                        className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary/50"
                                        value={formData.token}
                                        onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                                        required
                                    />
                                </motion.div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : success ? (
                                <CheckCircle2 className="w-6 h-6 animate-bounce" />
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Broadcast Notification
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Preview Section */}
                <div className="hidden xl:block w-[320px]">
                    <div className="sticky top-8 space-y-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 px-2">
                            <Smartphone className="w-5 h-5" /> Device Preview
                        </h3>
                        <div className="flex justify-center">
                            <MobilePreview
                                title={formData.title}
                                body={formData.body}
                                imageUrl={formData.imageUrl}
                                appName={formData.appName}
                            />
                        </div>
                        <p className="text-center text-xs text-muted-foreground px-4">
                            Real-time visualization of how your notification will appear on iOS/Android lock screens.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
