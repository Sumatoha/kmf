"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  UserCog,
  Leaf,
  LogOut,
  Settings,
  Webhook,
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/cn";
import { getToken, setToken } from "@/lib/api";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV = [
  { href: "/dashboard", label: "Дашборд", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "Заказы", icon: ClipboardList },
  { href: "/dashboard/masters", label: "Мастера", icon: UserCog },
  { href: "/dashboard/clients", label: "Клиенты", icon: Users },
  { href: "/dashboard/services", label: "Услуги", icon: Settings },
  { href: "/dashboard/webhooks", label: "Webhooks", icon: Webhook },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) return null;

  function logout() {
    setToken(null);
    router.replace("/login");
  }

  return (
    <div className="min-h-screen flex bg-[var(--color-bg)]">
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-64 shrink-0 border-r bg-[var(--color-surface)] flex flex-col"
      >
        <div className="p-5 border-b flex items-center gap-2.5">
          <div className="size-9 grid place-items-center rounded-lg" style={{ background: "var(--color-leaf)", color: "var(--color-lime)" }}>
            <Leaf className="size-4" strokeWidth={2.2} />
          </div>
          <div>
            <div className="font-bold tracking-tight text-[15px]">CleanOps</div>
            <div className="text-[11px] text-[var(--color-muted)]">CRM</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map((item, i) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 relative",
                    active
                      ? "bg-[var(--color-mint-soft)] text-[var(--color-leaf)] font-medium shadow-sm"
                      : "text-[var(--color-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]",
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-lg bg-[var(--color-mint-soft)]"
                      style={{ zIndex: -1 }}
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              </motion.div>
            );
          })}
        </nav>
        <div className="p-3 border-t flex items-center gap-2">
          <button
            onClick={logout}
            className="flex-1 flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--color-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)] transition-all duration-200"
          >
            <LogOut className="size-4" />
            Выйти
          </button>
          <ThemeToggle />
        </div>
      </motion.aside>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="flex-1 min-w-0"
      >
        {children}
      </motion.main>
    </div>
  );
}
