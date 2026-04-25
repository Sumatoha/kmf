"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Order, OrderStatus } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AssignPopover } from "@/components/assign-popover";

const COLUMNS: { status: OrderStatus; title: string }[] = [
  { status: "new", title: "Новые" },
  { status: "assigned", title: "Назначены" },
  { status: "confirmed", title: "Подтверждены" },
  { status: "in_progress", title: "В работе" },
  { status: "done", title: "Выполнены" },
  { status: "cancelled", title: "Отменены" },
];

export default function OrdersPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery<{ items: Order[] }>({
    queryKey: ["orders"],
    queryFn: () => api<{ items: Order[] }>("/orders"),
  });

  const cancel = useMutation({
    mutationFn: (id: string) =>
      api(`/orders/${id}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason: "Отменено диспетчером" }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Заказ отменён");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Ошибка"),
  });

  return (
    <>
      <PageHeader title="Заказы" description="Канбан по статусам" />
      <div className="p-8 overflow-x-auto">
        {isLoading || !data ? (
          <div className="grid place-items-center py-20 text-[var(--color-text-muted)]">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-6 gap-4 min-w-[1200px]">
            {COLUMNS.map((col) => {
              const items = (data.items ?? []).filter((o) => o.status === col.status);
              return (
                <div key={col.status} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between px-1">
                    <div className="text-sm font-semibold tracking-tight">{col.title}</div>
                    <span className="text-xs text-[var(--color-text-muted)]">{items.length}</span>
                  </div>
                  <div className="space-y-3">
                    {items.length === 0 && (
                      <div className="text-xs text-[var(--color-text-muted)] px-3 py-6 text-center border border-dashed rounded-lg">
                        пусто
                      </div>
                    )}
                    {items.map((o) => (
                      <Card key={o.id} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-xs text-[var(--color-text-muted)] font-mono">
                            #{o.id.slice(0, 8)}
                          </div>
                          <StatusBadge status={o.status} />
                        </div>
                        <div className="mt-2 text-sm font-medium leading-tight line-clamp-2">
                          {o.address_text}
                        </div>
                        <div className="mt-2 text-xs text-[var(--color-text-muted)]">
                          {new Date(o.scheduled_at).toLocaleString("ru-RU", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-sm font-semibold">
                            {o.price.toLocaleString("ru-RU")} ₽
                          </div>
                          <div className="flex items-center gap-1">
                            {o.status !== "done" && o.status !== "cancelled" && (
                              <AssignPopover orderId={o.id} />
                            )}
                            {o.status !== "done" && o.status !== "cancelled" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => cancel.mutate(o.id)}
                                disabled={cancel.isPending}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <X className="size-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
