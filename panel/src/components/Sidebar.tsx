"use strict";
import { LayoutDashboard, Send, AppWindow, Settings, Bell } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
    { name: "Overview", href: "/", icon: LayoutDashboard },
    { name: "Applications", href: "/apps", icon: AppWindow },
    { name: "Send Notification", href: "/send", icon: Send },
    { name: "History", href: "/history", icon: Bell },
    { name: "Documentation", href: "/docs", icon: Settings }, // Reusing settings icon or could use HelpCircle
    { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="w-64 h-screen glass border-r border-white/5 flex flex-col p-6 fixed transition-all">
            <div className="flex items-center gap-3 mb-12">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <Bell className="text-white w-6 h-6" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">Push Panel</span>
            </div>

            <nav className="flex-1 space-y-2">
                {items.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-all group",
                            pathname === item.href
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-white/5 hover:text-white"
                        )}
                    >
                        <item.icon className={cn(
                            "w-5 h-5 transition-colors",
                            pathname === item.href ? "text-primary" : "group-hover:text-white"
                        )} />
                        <span className="font-medium text-sm">{item.name}</span>
                    </Link>
                ))}
            </nav>

            <div className="pt-6 border-t border-white/5 mt-auto">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-500" />
                    <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-white truncate">Admin Account</p>
                        <p className="text-xs text-muted-foreground truncate">admin@example.com</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
