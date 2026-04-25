import * as React from "react";
import { cn } from "@/lib/cn";
import type { OrderStatus } from "@/lib/types";

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        className,
      )}
      {...props}
    />
  );
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "Новый",
  assigned: "Назначен",
  confirmed: "Подтверждён",
  in_progress: "В работе",
  done: "Выполнен",
  cancelled: "Отменён",
};

const STATUS_CLASS: Record<OrderStatus, string> = {
  new: "bg-blue-50 border-blue-200 text-blue-700",
  assigned: "bg-amber-50 border-amber-200 text-amber-700",
  confirmed: "bg-violet-50 border-violet-200 text-violet-700",
  in_progress: "bg-cyan-50 border-cyan-200 text-cyan-700",
  done: "bg-emerald-50 border-emerald-200 text-emerald-700",
  cancelled: "bg-zinc-100 border-zinc-200 text-zinc-600",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <Badge className={STATUS_CLASS[status]}>{STATUS_LABEL[status]}</Badge>;
}
