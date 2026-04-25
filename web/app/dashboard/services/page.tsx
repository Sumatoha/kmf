"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Service } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ServicesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("120");

  const { data, isLoading } = useQuery<{ items: Service[] }>({
    queryKey: ["services"],
    queryFn: () => api<{ items: Service[] }>("/services"),
  });

  const create = useMutation({
    mutationFn: () =>
      api("/services", {
        method: "POST",
        body: JSON.stringify({
          name,
          description: desc || null,
          base_price: Number(price) || 0,
          duration_minutes: Number(duration) || 120,
        }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["services"] });
      setName("");
      setDesc("");
      setPrice("");
      setDuration("120");
      setShowForm(false);
      toast.success("Услуга создана");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Ошибка"),
  });

  return (
    <>
      <PageHeader
        title="Услуги"
        description="Прайс-лист, который видят клиенты в боте"
        actions={
          <Button onClick={() => setShowForm((v) => !v)}>
            <Plus className="size-4" /> Добавить
          </Button>
        }
      />
      <div className="p-8 space-y-4">
        {showForm && (
          <Card className="p-5 space-y-3">
            <Input placeholder="Название" value={name} onChange={(e) => setName(e.target.value)} />
            <Textarea placeholder="Описание" value={desc} onChange={(e) => setDesc(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Цена ₽"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <Input
                placeholder="Длительность, мин"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={() => create.mutate()} disabled={!name || create.isPending}>
                {create.isPending ? "Создаём…" : "Создать"}
              </Button>
            </div>
          </Card>
        )}

        {isLoading ? (
          <div className="grid place-items-center py-20 text-[var(--color-text-muted)]">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(data?.items ?? []).map((s) => (
              <Card key={s.id} className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold tracking-tight">{s.name}</div>
                  {s.is_active ? (
                    <Badge className="bg-emerald-50 border-emerald-200 text-emerald-700">
                      Активна
                    </Badge>
                  ) : (
                    <Badge className="bg-zinc-100 border-zinc-200 text-zinc-600">Скрыта</Badge>
                  )}
                </div>
                {s.description && (
                  <p className="text-sm text-[var(--color-text-muted)] mt-1 line-clamp-2">
                    {s.description}
                  </p>
                )}
                <div className="flex items-baseline justify-between mt-4">
                  <div className="text-2xl font-bold">
                    {s.base_price.toLocaleString("ru-RU")} ₽
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)]">
                    ~{s.duration_minutes} мин
                  </div>
                </div>
              </Card>
            ))}
            {(data?.items ?? []).length === 0 && (
              <Card className="p-10 text-center text-[var(--color-text-muted)] col-span-full">
                Услуг пока нет. Добавьте первую.
              </Card>
            )}
          </div>
        )}
      </div>
    </>
  );
}
