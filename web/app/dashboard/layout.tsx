"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  UserCog,
  Sparkles,
  LogOut,
  Settings,
  Webhook,
} from "lucide-react";
import { useEffect, useState } from "react";
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
    <div className="min-h-screen flex">
      <aside className="w-64 shrink-0 border-r bg-[var(--color-surface)] flex flex-col">
        <div className="p-5 border-b flex items-center gap-2">
          <div className="size-9 grid place-items-center rounded-lg bg-[var(--color-brand-600)] text-white">
            <Sparkles className="size-4" />
          </div>
          <div>
            <div className="font-bold tracking-tight">CleanOps</div>
            <div className="text-xs text-[var(--color-text-muted)]">CRM</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-[var(--color-brand-50)] text-[var(--color-brand-700)] font-medium"
                    : "text-[var(--color-text)] hover:bg-[var(--color-surface-2)]",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t flex items-center gap-2">
          <button
            onClick={logout}
            className="flex-1 flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] transition-colors"
          >
            <LogOut className="size-4" />
            Выйти
          </button>
          <ThemeToggle />
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
