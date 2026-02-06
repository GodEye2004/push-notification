"use client";

import localFont from "next/font/local";
import { Sidebar } from "@/components/Sidebar";
import "./globals.css";
import { usePathname } from "next/navigation";

const vazirmatn = localFont({
  src: [
    {
      path: "../../fonts/Vazirmatn-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../fonts/Vazirmatn-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../fonts/Vazirmatn-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-vazirmatn",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isIntroPage = pathname === "/intro";

  return (
    <html lang="fa" dir="rtl">
      <body className={`${vazirmatn.variable} font-sans antialiased`}>
        <div className="flex bg-[#030303] min-h-screen">
          {!isIntroPage && <Sidebar />}
          <main className={`flex-1 ${!isIntroPage ? "mr-64" : ""} p-8 overflow-y-auto min-h-screen`}>
            <div className="max-w-6xl mx-auto animate-in">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
