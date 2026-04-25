"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { X } from "lucide-react";
import { api } from "@/lib/api";
import type { Master, Service } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

export function NewOrderDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [serviceId, setServiceId] = useState("");
  const [masterId, setMasterId] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [scheduled, setScheduled] = useState(defaultDateTime());
  const [notes, setNotes] = useState("");

  const services = useQuery<{ items: Service[] }>({
    queryKey: ["services"],
    queryFn: () => api<{ items: Service[] }>("/services"),
    enabled: open,
  });
  const masters = useQuery<{ items: Master[] }>({
    queryKey: ["masters"],
    queryFn: () => api<{ items: Master[] }>("/masters"),
    enabled: open,
  });

  const create = useMutation({
    mutationFn: () =>
      api("/orders", {
        method: "POST",
        body: JSON.stringify({
          service_id: serviceId,
          client_phone: phone,
          client_name: name || null,
          address_text: address,
          scheduled_at: new Date(scheduled).toISOString(),
          notes: notes || null,
          master_id: masterId || null,
        }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Заказ создан");
      onClose();
      setPhone("");
      setName("");
      setAddress("");
      setNotes("");
      setMasterId("");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Ошибка"),
  });

  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl bg-[var(--color-surface)] border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="font-semibold tracking-tight">Новый заказ</div>
          <button onClick={onClose} className="size-8 grid place-items-center rounded-md hover:bg-[var(--color-surface-2)]">
            <X className="size-4" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <Field label="Услуга">
            <Select value={serviceId} onChange={setServiceId}>
              <option value="">— выберите —</option>
              {(services.data?.items ?? []).filter((s) => s.is_active).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.base_price.toLocaleString("ru-RU")} ₽
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Имя клиента">
              <Input placeholder="Иван Петров" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Телефон">
              <Input required placeholder="+7 999 000-00-00" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </Field>
          </div>

          <Field label="Адрес">
            <Input required placeholder="Москва, ул. Тверская 12, кв 45" value={address} onChange={(e) => setAddress(e.target.value)} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Когда">
              <Input required type="datetime-local" value={scheduled} onChange={(e) => setScheduled(e.target.value)} />
            </Field>
            <Field label="Мастер (опц.)">
              <Select value={masterId} onChange={setMasterId}>
                <option value="">— подобрать автоматически —</option>
                {(masters.data?.items ?? [])
                  .filter((m) => m.is_active && m.activated_at)
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name}
                    </option>
                  ))}
              </Select>
            </Field>
          </div>

          <Field label="Комментарий">
            <Textarea placeholder="Особые пожелания, код домофона…" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
        </div>
        <div className="px-5 py-4 border-t flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button
            onClick={() => create.mutate()}
            disabled={!serviceId || !phone || !address || create.isPending}
          >
            {create.isPending ? "Создаём…" : "Создать заказ"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-[var(--color-text-muted)]">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-full rounded-lg border bg-[var(--color-surface)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-500)]"
    >
      {children}
    </select>
  );
}

// defaultDateTime returns tomorrow at 10:00 in local-time format suitable for
// a <input type="datetime-local" /> field.
function defaultDateTime() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
