"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import type { Client } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";

export default function ClientsPage() {
  const { data, isLoading } = useQuery<{ items: Client[] }>({
    queryKey: ["clients"],
    queryFn: () => api<{ items: Client[] }>("/clients"),
  });

  return (
    <>
      <PageHeader title="Клиенты" description="Те, кто записывался через бота" />
      <div className="p-8">
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
                  <th className="px-5 py-3 font-medium">Telegram</th>
                  <th className="px-5 py-3 font-medium">С нами с</th>
                </tr>
              </thead>
              <tbody>
                {(data?.items ?? []).map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="px-5 py-3 font-medium">{c.full_name || "—"}</td>
                    <td className="px-5 py-3">{c.phone || "—"}</td>
                    <td className="px-5 py-3">
                      {c.telegram_username ? `@${c.telegram_username}` : c.telegram_id || "—"}
                    </td>
                    <td className="px-5 py-3 text-[var(--color-text-muted)]">
                      {new Date(c.created_at).toLocaleDateString("ru-RU")}
                    </td>
                  </tr>
                ))}
                {(data?.items ?? []).length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-[var(--color-text-muted)]">
                      Пока нет клиентов. Они появятся когда пользователи начнут записываться через бота.
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
