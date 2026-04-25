"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, UserCog } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Master } from "@/lib/types";

export function AssignPopover({ orderId }: { orderId: string }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery<{ items: Master[] }>({
    queryKey: ["masters"],
    queryFn: () => api<{ items: Master[] }>("/masters"),
    enabled: open,
  });

  const assign = useMutation({
    mutationFn: (master_id: string) =>
      api(`/orders/${orderId}/assign`, {
        method: "POST",
        body: JSON.stringify({ master_id }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setOpen(false);
      toast.success("Мастер назначен");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Ошибка"),
  });

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const candidates = (data?.items ?? []).filter((m) => m.is_active && m.activated_at);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-brand-700)] hover:bg-[var(--color-brand-50)] px-2 py-1 rounded-md"
      >
        <UserCog className="size-3" />
        Назначить
      </button>
      {open && (
        <div className="absolute z-20 right-0 mt-1 w-60 rounded-xl border bg-white shadow-xl p-1 max-h-72 overflow-auto">
          {isLoading ? (
            <div className="p-3 text-center text-[var(--color-text-muted)]">
              <Loader2 className="size-4 animate-spin inline" />
            </div>
          ) : candidates.length === 0 ? (
            <div className="p-3 text-xs text-[var(--color-text-muted)]">
              Нет активированных мастеров. Пригласите их через раздел «Мастера».
            </div>
          ) : (
            candidates.map((m) => (
              <button
                key={m.id}
                onClick={() => assign.mutate(m.id)}
                disabled={assign.isPending}
                className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-[var(--color-surface-2)] text-left"
              >
                <span className="truncate">{m.full_name}</span>
                <span
                  className={`text-[10px] shrink-0 ml-2 ${
                    m.is_available ? "text-emerald-600" : "text-zinc-400"
                  }`}
                >
                  {m.is_available ? "свободен" : "занят"}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
