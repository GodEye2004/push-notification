"use client";

import { Sidebar } from "@/components/Sidebar";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex bg-[#030303] min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-64 p-8 overflow-y-auto min-h-screen">
            <div className="max-w-6xl mx-auto animate-in">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
