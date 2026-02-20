"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    Bell,
    Smartphone,
    Zap,
    Shield,
    BarChart3,
    Clock,
    Globe,
    Code,
    Server,
    Rocket,
    CheckCircle,
    ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function IntroPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const smoothTransition = {
        type: "spring",
        stiffness: 100,
        damping: 20,
        mass: 1
    };

    const fadeInUp = {
        initial: { opacity: 0, y: 40, filter: "blur(10px)" },
        animate: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: {
                duration: 0.8,
                ease: "easeOut"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any
        },
    };

    const stagger = {
        animate: {
            transition: {
                staggerChildren: 0.15,
            },
        },
    };

    const features = [
        {
            icon: Zap,
            title: "سرعت فوق‌العاده",
            description: "ارسال اعلان به هزاران دستگاه در کسری از ثانیه با استفاده از Socket.IO",
            gradient: "from-yellow-500 to-orange-600",
        },
        {
            icon: Shield,
            title: "امنیت بالا",
            description: "احراز هویت با API Key و مدیریت دسترسی چند سطحی برای برنامه‌ها",
            gradient: "from-blue-500 to-cyan-600",
        },
        {
            icon: Globe,
            title: "چند برنامه‌ای",
            description: "مدیریت اعلان‌های چندین برنامه از یک پنل واحد",
            gradient: "from-purple-500 to-pink-600",
        },
        {
            icon: BarChart3,
            title: "تحلیل دقیق",
            description: "رصد لحظه‌ای تعداد دستگاه‌های متصل و تاریخچه کامل ارسال اعلان‌ها",
            gradient: "from-green-500 to-emerald-600",
        },
        {
            icon: Clock,
            title: "بی‌درنگ و فوری",
            description: "دریافت اعلان در زمان واقعی حتی وقتی برنامه بسته است",
            gradient: "from-red-500 to-rose-600",
        },
        {
            icon: Code,
            title: "توسعه آسان",
            description: "API ساده و مستندات کامل برای یکپارچه‌سازی سریع",
            gradient: "from-indigo-500 to-violet-600",
        },
    ];

    const technologies = [
        { name: "Node.js + Express", icon: Server, color: "text-green-500" },
        { name: "Next.js 15", icon: Code, color: "text-white" },
        { name: "Flutter", icon: Smartphone, color: "text-blue-500" },
        { name: "Socket.IO", icon: Zap, color: "text-yellow-500" },
        { name: "MongoDB", icon: Server, color: "text-green-600" },
        { name: "TypeScript", icon: Code, color: "text-blue-400" },
    ];

    const benefits = [
        "بدون نیاز به Firebase و سرویس‌های شخص ثالث",
        "کنترل کامل بر داده‌ها و زیرساخت",
        "صرفه‌جویی در هزینه‌های سرویس‌های ابری",
        "قابلیت سفارشی‌سازی کامل",
        "پشتیبانی از زبان فارسی و راست‌چین",
        "معماری مونوریپو برای مدیریت بهتر کد",
    ];

    if (!mounted) return null;

    return (
        <div className="min-h-screen overflow-x-hidden selection:bg-purple-500/30">
            {/* Structured Data for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        name: "سیستم اعلان‌های فشاری",
                        applicationCategory: "DeveloperApplication",
                        operatingSystem: "Cross-platform",
                        offers: {
                            "@type": "Offer",
                            price: "0",
                            priceCurrency: "USD",
                        },
                        description:
                            "سیستم جامع مدیریت اعلان‌های فشاری بدون نیاز به Firebase",
                        featureList: [
                            "ارسال اعلان بی‌درنگ",
                            "پشتیبانی چند برنامه",
                            "پنل مدیریت پیشرفته",
                            "تحلیل و گزارش‌گیری",
                        ],
                    }),
                }}
            />

            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-6">
                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute top-1/4 -right-48 w-96 h-96 bg-purple-600/30 rounded-full blur-[120px]"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute bottom-1/4 -left-48 w-96 h-96 bg-blue-600/30 rounded-full blur-[120px]"
                    />
                </div>

                <motion.div
                    initial="initial"
                    animate="animate"
                    variants={stagger}
                    className="relative z-10 max-w-5xl mx-auto text-center"
                >
                    <motion.div
                        variants={fadeInUp}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full mb-8 shadow-xl"
                    >
                        <Rocket className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-purple-100 font-medium">
                            سیستم اعلان‌های هوشمند نسل جدید
                        </span>
                    </motion.div>

                    <motion.h1
                        variants={fadeInUp}
                        className="text-6xl md:text-8xl font-black mb-8 bg-gradient-to-l from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent leading-[1.1] tracking-tight"
                    >
                        مدیریت اعلان‌های فشاری
                        <br />
                        <span className="text-white">بدون محدودیت</span>
                    </motion.h1>

                    <motion.p
                        variants={fadeInUp}
                        className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed font-light"
                    >
                        سیستم جامع و حرفه‌ای برای ارسال اعلان‌های فشاری به اپلیکیشن‌های موبایل
                        <br />
                        <span className="text-purple-400 font-bold">
                            بدون نیاز به Firebase
                        </span>{" "}
                        و با کنترل ۱۰۰٪ بر زیرساخت
                    </motion.p>

                    <motion.div
                        variants={fadeInUp}
                        className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                    >
                        <Link
                            href="/apps"
                            className="group relative px-10 py-5 bg-white text-black rounded-2xl font-black text-xl overflow-hidden transition-all duration-500 hover:scale-105 active:scale-95"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                شروع کنید
                                <ArrowLeft className="w-6 h-6 group-hover:-translate-x-2 transition-transform duration-300" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-blue-100 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <Link
                            href="/docs"
                            className="px-10 py-5 glass-card text-white rounded-2xl font-bold text-xl hover:bg-white/10 transition-all duration-300 flex items-center gap-2 border border-white/10 backdrop-blur-xl"
                        >
                            <Code className="w-6 h-6 text-purple-400" />
                            مستندات
                        </Link>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        variants={fadeInUp}
                        className="mt-24 grid grid-cols-2 lg:grid-cols-3 gap-8 max-w-3xl mx-auto"
                    >
                        {[
                            { label: "سرعت ارسال", value: "< 100ms" },
                            { label: "کاربران فعال", value: "نامحدود" },
                            { label: "قابلیت اطمینان", value: "99.9%" },
                        ].map((stat, i) => (
                            <div key={i} className="text-center group">
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    className="text-4xl md:text-5xl font-black text-white mb-2"
                                >
                                    {stat.value}
                                </motion.div>
                                <div className="text-sm text-gray-500 uppercase tracking-widest font-bold group-hover:text-purple-400 transition-colors">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="py-32 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: "circOut" }}
                        className="text-center mb-24"
                    >
                        <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
                            ویژگی‌های منحصر به فرد
                        </h2>
                        <div className="w-24 h-1.5 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full mb-8" />
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
                            هر آنچه برای مدیریت حرفه‌ای اعلان‌ها در مقیاس بزرگ نیاز دارید
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{
                                    duration: 0.6,
                                    delay: index * 0.1,
                                    ease: [0.215, 0.61, 0.355, 1]
                                }}
                                whileHover={{
                                    y: -12,
                                    scale: 1.02,
                                    transition: { duration: 0.3 }
                                }}
                                className="group relative glass-card p-10 rounded-[32px] border border-white/5 hover:border-white/20 transition-all duration-500"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 rounded-[32px]`} />
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} p-0.5 mb-8 shadow-2xl`}>
                                    <div className="w-full h-full bg-[#080808] rounded-2xl flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-500">
                                        <feature.icon className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-white mb-4 group-hover:text-purple-400 transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-400 leading-relaxed text-lg font-light group-hover:text-gray-300">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-32 px-6 relative bg-white/5 backdrop-blur-3xl rounded-[64px] mx-4 my-12 overflow-hidden border border-white/5">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-600/5 to-transparent pointer-events-none" />
                <div className="max-w-5xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
                            چرا این سیستم؟
                        </h2>
                        <p className="text-xl text-gray-400 font-light">
                            مزایای استراتژیک استفاده از زیرساخت اختصاصی
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7, delay: index * 0.1, ease: "easeOut" }}
                                className="flex items-center gap-6 glass-card p-8 rounded-3xl border border-white/5 hover:bg-white/10 transition-all duration-300"
                            >
                                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/20 flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-green-400" />
                                </div>
                                <p className="text-xl text-gray-200 font-medium leading-tight">
                                    {benefit}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Technology Stack */}
            <section className="py-32 px-6 relative">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-5xl font-black text-white mb-6">
                            تکنولوژی‌های مدرن
                        </h2>
                        <p className="text-xl text-gray-400 font-light">
                            ساخته شده با پایداری و مقیاس‌پذیری در ذهن
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {technologies.map((tech, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                whileHover={{
                                    scale: 1.1,
                                    rotate: 5,
                                    backgroundColor: "rgba(255,255,255,0.08)"
                                }}
                                className="glass-card p-8 rounded-[32px] flex flex-col items-center justify-center gap-4 transition-all duration-500 aspect-square border border-white/5 group"
                            >
                                <div className="p-4 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors">
                                    <tech.icon className={`w-10 h-10 ${tech.color}`} />
                                </div>
                                <span className="text-sm font-black text-gray-400 text-center uppercase tracking-widest group-hover:text-white transition-colors">
                                    {tech.name}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 px-6 relative">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-5xl mx-auto glass-card p-16 md:p-24 rounded-[64px] text-center relative overflow-hidden border border-white/10 shadow-2xl shadow-purple-500/10"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/10 to-transparent animate-pulse" />
                    <div className="relative z-10">
                        <motion.div
                            animate={{
                                scale: [1, 1.15, 1],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="w-24 h-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-2xl"
                        >
                            <Bell className="w-12 h-12 text-white" />
                        </motion.div>
                        <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter">
                            آماده پرواز هستید؟
                        </h2>
                        <p className="text-2xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
                            به دنیای اعلان‌های سریع و اختصاصی خوش آمدید. همین حالا مدیریت را شروع کنید.
                        </p>
                        <Link
                            href="/apps"
                            className="inline-flex items-center gap-3 px-14 py-6 bg-gradient-to-l from-purple-600 to-blue-600 text-white rounded-[24px] font-black text-2xl hover:shadow-[0_20px_50px_rgba(124,58,237,0.4)] transition-all duration-500 hover:scale-110 active:scale-95 group"
                        >
                            ورود به پنل مدیریت
                            <ArrowLeft className="w-8 h-8 group-hover:-translate-x-3 transition-transform duration-500" />
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-6 border-t border-white/5 bg-[#030303]">
                {/* <div className="max-w-6xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <div className="w-10 h-1.5 bg-purple-500 rounded-full" />
                        <Rocket className="w-8 h-8 text-white" />
                        <div className="w-10 h-1.5 bg-blue-500 rounded-full" />
                    </div>
                    <p className="text-gray-400 text-lg font-medium">
                        ساخته شده با ❤️ برای توسعه‌دهندگان پیشرو ایرانی
                    </p>
                    <p className="text-gray-600 text-md mt-4 tracking-widest font-bold">
                        FCM PUSH SYSTEM © {new Date().getFullYear()}
                    </p>
                </div> */}
            </footer>
        </div>
    );
}
