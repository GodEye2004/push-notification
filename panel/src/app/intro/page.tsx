"use client";

import { motion } from "framer-motion";
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
        setMounted(true);
    }, []);

    const fadeInUp = {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 },
    };

    const stagger = {
        animate: {
            transition: {
                staggerChildren: 0.1,
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
        <div className="min-h-screen overflow-x-hidden">
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
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">
                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 -right-48 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/4 -left-48 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-700" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-full blur-3xl animate-spin-slow" />
                </div>

                <motion.div
                    initial="initial"
                    animate="animate"
                    variants={stagger}
                    className="relative z-10 max-w-5xl mx-auto text-center"
                >
                    <motion.div
                        variants={fadeInUp}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/10 border border-purple-500/20 rounded-full mb-8"
                    >
                        <Rocket className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-purple-300 font-medium">
                            سیستم اعلان‌های هوشمند نسل جدید
                        </span>
                    </motion.div>

                    <motion.h1
                        variants={fadeInUp}
                        className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-l from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent leading-tight"
                    >
                        مدیریت اعلان‌های فشاری
                        <br />
                        بدون محدودیت
                    </motion.h1>

                    <motion.p
                        variants={fadeInUp}
                        className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
                    >
                        سیستم جامع و حرفه‌ای برای ارسال اعلان‌های فشاری به اپلیکیشن‌های موبایل
                        <br />
                        <span className="text-purple-400 font-semibold">
                            بدون نیاز به Firebase
                        </span>{" "}
                        و با کنترل کامل
                    </motion.p>

                    <motion.div
                        variants={fadeInUp}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    >
                        <Link
                            href="/apps"
                            className="group px-8 py-4 bg-gradient-to-l from-purple-600 to-blue-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 flex items-center gap-2"
                        >
                            شروع کنید
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/docs"
                            className="px-8 py-4 glass-card text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
                        >
                            <Code className="w-5 h-5" />
                            مستندات
                        </Link>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        variants={fadeInUp}
                        className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
                    >
                        {[
                            { label: "سرعت ارسال", value: "< 100ms" },
                            { label: "کاربران فعال", value: "نامحدود" },
                            { label: "قابلیت اطمینان", value: "99.9%" },
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-l from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-gray-400">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="py-24 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            ویژگی‌های منحصر به فرد
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            همه چیزی که برای مدیریت حرفه‌ای اعلان‌های فشاری نیاز دارید
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                                className="group glass-card p-8 rounded-3xl hover:border-white/20 transition-all duration-300 relative overflow-hidden"
                            >
                                <div
                                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                                />
                                <div
                                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} p-0.5 mb-6`}
                                >
                                    <div className="w-full h-full bg-[#030303] rounded-2xl flex items-center justify-center">
                                        <feature.icon className="w-7 h-7 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-24 px-6 relative">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            چرا این سیستم؟
                        </h2>
                        <p className="text-xl text-gray-400">
                            مزایای استفاده از سیستم اختصاصی اعلان‌های فشاری
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="flex items-start gap-4 glass-card p-6 rounded-2xl hover:bg-white/5 transition-all duration-300"
                            >
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mt-1">
                                    <CheckCircle className="w-4 h-4 text-white" />
                                </div>
                                <p className="text-lg text-gray-200 leading-relaxed">
                                    {benefit}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Technology Stack */}
            <section className="py-24 px-6 relative">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            تکنولوژی‌های مدرن
                        </h2>
                        <p className="text-xl text-gray-400">
                            ساخته شده با بهترین ابزارهای روز دنیا
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {technologies.map((tech, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                whileHover={{ scale: 1.05 }}
                                className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-white/5 transition-all duration-300 aspect-square"
                            >
                                <tech.icon className={`w-10 h-10 ${tech.color}`} />
                                <span className="text-sm font-medium text-gray-300 text-center">
                                    {tech.name}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6 relative">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl mx-auto glass-card p-12 md:p-16 rounded-3xl text-center relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10" />
                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-8">
                            <Bell className="w-10 h-10 text-white animate-pulse" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            همین حالا شروع کنید
                        </h2>
                        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                            سیستم اعلان‌های فشاری خود را راه‌اندازی کنید و تجربه‌ای بی‌نظیر از
                            مدیریت اعلان‌ها داشته باشید
                        </p>
                        <Link
                            href="/apps"
                            className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-l from-purple-600 to-blue-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
                        >
                            ورود به پنل مدیریت
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-white/5">
                <div className="max-w-6xl mx-auto text-center">
                    <p className="text-gray-400">
                        ساخته شده با ❤️ برای توسعه‌دهندگان ایرانی
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                        سیستم اعلان‌های فشاری © {new Date().getFullYear()}
                    </p>
                </div>
            </footer>
        </div>
    );
}
