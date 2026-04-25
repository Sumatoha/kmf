"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ClipboardCheck,
  ClipboardList,
  Loader2,
  Sparkles,
  TrendingUp,
  UserCog,
  Users,
} from "lucide-react";
import { api } from "@/lib/api";
import type { DashboardStats } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  const { data, isLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: () => api<DashboardStats>("/dashboard/stats"),
  });

  return (
    <>
      <PageHeader
        title="Дашборд"
        description="Сводка по операционке за сегодня"
      />
      <div className="p-8">
        {isLoading || !data ? (
          <div className="grid place-items-center py-20 text-[var(--color-text-muted)]">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Новые заказы"
              value={data.orders_new}
              icon={<ClipboardList className="size-5" />}
              accent="blue"
            />
            <StatCard
              title="В работе"
              value={data.orders_in_progress}
              icon={<Sparkles className="size-5" />}
              accent="cyan"
            />
            <StatCard
              title="Выполнено сегодня"
              value={data.orders_done_today}
              icon={<ClipboardCheck className="size-5" />}
              accent="emerald"
            />
            <StatCard
              title="Выручка сегодня"
              value={`${formatMoney(data.revenue_today)} ₽`}
              icon={<TrendingUp className="size-5" />}
              accent="violet"
            />
            <StatCard
              title="Активные мастера"
              value={data.active_masters}
              icon={<UserCog className="size-5" />}
              accent="amber"
            />
            <StatCard
              title="Клиенты"
              value={data.total_clients}
              icon={<Users className="size-5" />}
              accent="rose"
            />
          </div>
        )}
      </div>
    </>
  );
}

const ACCENT: Record<string, string> = {
  blue: "bg-blue-50 text-blue-600",
  cyan: "bg-cyan-50 text-cyan-600",
  emerald: "bg-emerald-50 text-emerald-600",
  violet: "bg-violet-50 text-violet-600",
  amber: "bg-amber-50 text-amber-600",
  rose: "bg-rose-50 text-rose-600",
};

function StatCard({
  title,
  value,
  icon,
  accent,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between">
        <div>
          <div className="text-sm text-[var(--color-text-muted)]">{title}</div>
          <div className="text-3xl font-bold tracking-tight mt-1">{value}</div>
        </div>
        <div className={`size-10 grid place-items-center rounded-lg ${ACCENT[accent]}`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function formatMoney(n: number) {
  return n.toLocaleString("ru-RU", { maximumFractionDigits: 0 });
}
