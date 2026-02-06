import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "سیستم اعلان‌های فشاری | مدیریت اعلان‌های هوشمند بدون Firebase",
    description:
        "سیستم جامع مدیریت اعلان‌های فشاری (Push Notification) بدون نیاز به Firebase. با معماری مونوریپو (Monorepo)، شامل سرور Node.js، پنل مدیریت Next.js و اپلیکیشن موبایل Flutter. ارسال اعلان‌های بی‌درنگ، چند برنامه‌ای و هوشمند.",
    keywords: [
        "اعلان فشاری",
        "Push Notification",
        "بدون Firebase",
        "Node.js",
        "Next.js",
        "Flutter",
        "Socket.IO",
        "مدیریت اعلان",
        "اعلان موبایل",
        "سیستم اعلان",
    ],
    authors: [{ name: "FCM Push Team" }],
    openGraph: {
        title: "سیستم اعلان‌های فشاری | مدیریت اعلان‌های هوشمند",
        description:
            "سیستم جامع مدیریت اعلان‌های فشاری بدون Firebase. ارسال اعلان‌های بی‌درنگ به هزاران کاربر با کارایی بالا.",
        type: "website",
        locale: "fa_IR",
        siteName: "سیستم اعلان‌های فشاری",
    },
    twitter: {
        card: "summary_large_image",
        title: "سیستم اعلان‌های فشاری",
        description:
            "مدیریت اعلان‌های فشاری بدون Firebase با Node.js، Next.js و Flutter",
    },
    robots: {
        index: true,
        follow: true,
    },
    viewport: {
        width: "device-width",
        initialScale: 1,
        maximumScale: 5,
    },
};

export default function IntroLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
