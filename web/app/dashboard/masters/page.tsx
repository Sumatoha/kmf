"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Copy, Loader2, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Master } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const BOT_USERNAME =
  process.env.NEXT_PUBLIC_MASTER_BOT_USERNAME || "CleanOpsMasterBot";

export default function MastersPage() {
  const qc = useQueryClient();
  const [showInvite, setShowInvite] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [lastInvite, setLastInvite] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ items: Master[] }>({
    queryKey: ["masters"],
    queryFn: () => api<{ items: Master[] }>("/masters"),
  });

  const invite = useMutation({
    mutationFn: () =>
      api<{ master: Master; invite_token: string }>("/masters/invite", {
        method: "POST",
        body: JSON.stringify({ full_name: name, phone: phone || null }),
      }),
    onSuccess: (res) => {
      const link = `https://t.me/${BOT_USERNAME}?start=invite_${res.invite_token}`;
      setLastInvite(link);
      qc.invalidateQueries({ queryKey: ["masters"] });
      setName("");
      setPhone("");
      setShowInvite(false);
      toast.success("Приглашение создано");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Ошибка"),
  });

  const toggleAvail = useMutation({
    mutationFn: ({ id, available }: { id: string; available: boolean }) =>
      api(`/masters/${id}/availability`, {
        method: "PATCH",
        body: JSON.stringify({ available }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["masters"] }),
  });

  return (
    <>
      <PageHeader
        title="Мастера"
        description="Команда исполнителей"
        actions={
          <Button onClick={() => setShowInvite((v) => !v)}>
            <Plus className="size-4" /> Пригласить
          </Button>
        }
      />
      <div className="p-8 space-y-4">
        {showInvite && (
          <Card className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                placeholder="ФИО"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                placeholder="Телефон (опц.)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Button
                onClick={() => invite.mutate()}
                disabled={!name || invite.isPending}
              >
                {invite.isPending ? "Создаём…" : "Получить ссылку"}
              </Button>
            </div>
          </Card>
        )}
        {lastInvite && (
          <Card className="p-4 bg-[var(--color-brand-50)] border-[var(--color-brand-200)]">
            <div className="flex items-center justify-between gap-3">
              <code className="text-sm break-all">{lastInvite}</code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(lastInvite);
                  toast.success("Скопировано");
                }}
              >
                <Copy className="size-3" />
              </Button>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-2">
              Отправьте ссылку мастеру — после перехода он будет привязан к вашей компании.
            </p>
          </Card>
        )}

        {isLoading ? (
          <div className="grid place-items-center py-20 text-[var(--color-text-muted)]">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">
                <tr className="text-left">
                  <th className="px-5 py-3 font-medium">Имя</th>
                  <th className="px-5 py-3 font-medium">Телефон</th>
                  <th className="px-5 py-3 font-medium">Рейтинг</th>
                  <th className="px-5 py-3 font-medium">Заказов</th>
                  <th className="px-5 py-3 font-medium">Статус</th>
                  <th className="px-5 py-3 font-medium text-right">Доступен</th>
                </tr>
              </thead>
              <tbody>
                {(data?.items ?? []).map((m) => (
                  <tr key={m.id} className="border-t">
                    <td className="px-5 py-3 font-medium">{m.full_name}</td>
                    <td className="px-5 py-3">{m.phone || "—"}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        {m.rating?.toFixed(1) ?? "0.0"}
                      </span>
                    </td>
                    <td className="px-5 py-3">{m.completed_orders}</td>
                    <td className="px-5 py-3">
                      {m.activated_at ? (
                        <Badge className="bg-emerald-50 border-emerald-200 text-emerald-700">
                          Активен
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-50 border-amber-200 text-amber-700">
                          Ожидает входа
                        </Badge>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() =>
                          toggleAvail.mutate({ id: m.id, available: !m.is_available })
                        }
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          m.is_available
                            ? "bg-[var(--color-brand-500)]"
                            : "bg-zinc-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            m.is_available ? "translate-x-4" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                ))}
                {(data?.items ?? []).length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-[var(--color-text-muted)]">
                      Пока нет мастеров. Нажмите «Пригласить» чтобы создать ссылку.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </>
  );
}
