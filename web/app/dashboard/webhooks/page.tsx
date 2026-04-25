"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Webhook } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ALL_EVENTS = [
  "order.created",
  "order.confirmed",
  "order.started",
  "order.completed",
  "order.cancelled",
  "review.created",
];

export default function WebhooksPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [events, setEvents] = useState<string[]>(["*"]);

  const list = useQuery<{ items: Webhook[] }>({
    queryKey: ["webhooks"],
    queryFn: () => api<{ items: Webhook[] }>("/webhooks"),
  });

  const create = useMutation({
    mutationFn: () =>
      api<Webhook>("/webhooks", {
        method: "POST",
        body: JSON.stringify({
          url,
          description: description || null,
          events,
        }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["webhooks"] });
      setShowForm(false);
      setUrl("");
      setDescription("");
      setEvents(["*"]);
      toast.success("Webhook создан");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Ошибка"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api(`/webhooks/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["webhooks"] });
      toast.success("Webhook удалён");
    },
  });

  function toggleEvent(e: string) {
    if (e === "*") {
      setEvents(["*"]);
      return;
    }
    setEvents((prev) => {
      const next = prev.filter((x) => x !== "*");
      return next.includes(e) ? next.filter((x) => x !== e) : [...next, e];
    });
  }

  return (
    <>
      <PageHeader
        title="Webhooks"
        description="Получайте события из CleanOps в свою систему"
        actions={
          <Button onClick={() => setShowForm((v) => !v)}>
            <Plus className="size-4" /> Добавить
          </Button>
        }
      />
      <div className="p-8 space-y-4">
        {showForm && (
          <Card className="p-5 space-y-4">
            <Input
              placeholder="https://your-server.com/webhooks/cleanops"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Input
              placeholder="Описание (опц.)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div>
              <div className="text-xs font-medium text-[var(--color-text-muted)] mb-2">События</div>
              <div className="flex flex-wrap gap-2">
                <Chip active={events.includes("*")} onClick={() => toggleEvent("*")} label="Все события" />
                {ALL_EVENTS.map((e) => (
                  <Chip
                    key={e}
                    active={events.includes(e) && !events.includes("*")}
                    disabled={events.includes("*")}
                    onClick={() => toggleEvent(e)}
                    label={e}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Отмена</Button>
              <Button onClick={() => create.mutate()} disabled={!url || create.isPending}>
                {create.isPending ? "Создаём…" : "Создать"}
              </Button>
            </div>
          </Card>
        )}

        {list.isLoading ? (
          <div className="grid place-items-center py-20 text-[var(--color-text-muted)]">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : (list.data?.items ?? []).length === 0 ? (
          <Card className="p-10 text-center text-[var(--color-text-muted)]">
            Ещё нет webhooks. Подпишитесь на события чтобы интегрировать CleanOps с вашей системой.
          </Card>
        ) : (
          <div className="space-y-3">
            {(list.data?.items ?? []).map((w) => (
              <Card key={w.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-sm break-all">{w.url}</div>
                    {w.description && (
                      <div className="text-sm text-[var(--color-text-muted)] mt-1">{w.description}</div>
                    )}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {w.events.map((ev) => (
                        <span
                          key={ev}
                          className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--color-surface-2)] border font-mono"
                        >
                          {ev}
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                      <span>secret:</span>
                      <code className="font-mono bg-[var(--color-surface-2)] px-1.5 py-0.5 rounded">
                        {w.secret.slice(0, 12)}…
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(w.secret);
                          toast.success("Secret скопирован");
                        }}
                        className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                      >
                        <Copy className="size-3" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm("Удалить webhook?")) remove.mutate(w.id);
                    }}
                    className="size-8 grid place-items-center rounded-md text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Card className="p-5 bg-[var(--color-surface-2)]/50">
          <div className="text-sm font-semibold mb-2">Как это работает</div>
          <ul className="text-sm text-[var(--color-text-muted)] space-y-1.5 list-disc list-inside">
            <li>На каждое событие мы отправляем POST с JSON-телом на ваш URL.</li>
            <li>Подпись HMAC-SHA256 от тела передаётся в заголовке <code>X-CleanOps-Signature: sha256=…</code>.</li>
            <li>Тип события — в заголовке <code>X-CleanOps-Event</code>.</li>
            <li>Если ответ ≠ 2xx, мы повторим попытку с экспоненциальной задержкой до 8 раз.</li>
          </ul>
        </Card>
      </div>
    </>
  );
}

function Chip({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors disabled:opacity-40 ${
        active
          ? "bg-[var(--color-brand-50)] border-[var(--color-brand-300)] text-[var(--color-brand-700)]"
          : "bg-white hover:bg-[var(--color-surface-2)]"
      }`}
    >
      {label}
    </button>
  );
}
