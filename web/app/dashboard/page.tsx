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
import { motion } from "motion/react";
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
          <div className="grid place-items-center py-20 text-[var(--color-muted)]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="size-6" />
            </motion.div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard title="Новые заказы" value={data.orders_new} icon={<ClipboardList className="size-5" />} accent="blue" delay={0} />
            <StatCard title="В работе" value={data.orders_in_progress} icon={<Sparkles className="size-5" />} accent="cyan" delay={0.05} />
            <StatCard title="Выполнено сегодня" value={data.orders_done_today} icon={<ClipboardCheck className="size-5" />} accent="emerald" delay={0.1} />
            <StatCard title="Выручка сегодня" value={`${formatMoney(data.revenue_today)} ₸`} icon={<TrendingUp className="size-5" />} accent="violet" delay={0.15} />
            <StatCard title="Активные мастера" value={data.active_masters} icon={<UserCog className="size-5" />} accent="amber" delay={0.2} />
            <StatCard title="Клиенты" value={data.total_clients} icon={<Users className="size-5" />} accent="rose" delay={0.25} />
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
  delay,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  accent: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className="flex items-center justify-between">
          <div>
            <div className="text-sm text-[var(--color-muted)]">{title}</div>
            <div className="text-3xl font-bold tracking-tight mt-1">{value}</div>
          </div>
          <motion.div
            className={`size-10 grid place-items-center rounded-lg ${ACCENT[accent]}`}
            whileHover={{ scale: 1.1, rotate: 4 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {icon}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function formatMoney(n: number) {
  return n.toLocaleString("ru-RU", { maximumFractionDigits: 0 });
}
