"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { api, setToken } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { User } from "@/lib/types";

export default function SignupPage() {
  const router = useRouter();
  const [tenantName, setTenantName] = useState("");
  const [tenantSlug, setTenantSlug] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  function autoSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9-\s]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 32);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api<{ token: string; user: User }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          tenant_slug: tenantSlug,
          tenant_name: tenantName,
          email,
          password,
          full_name: fullName,
        }),
      });
      setToken(res.token);
      toast.success(`Добро пожаловать, ${res.user.full_name}!`);
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось зарегистрироваться");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-4 py-10 bg-gradient-to-br from-[var(--color-brand-50)] via-[var(--color-bg)] to-white">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="size-10 grid place-items-center rounded-xl bg-[var(--color-brand-600)] text-white">
            <Sparkles className="size-5" />
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight">CleanOps</div>
            <div className="text-xs text-[var(--color-text-muted)]">CRM для клининговых компаний</div>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Регистрация компании</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Название компании</label>
                <Input
                  required
                  placeholder="BlueSparkle Cleaning"
                  value={tenantName}
                  onChange={(e) => {
                    setTenantName(e.target.value);
                    if (!tenantSlug) setTenantSlug(autoSlug(e.target.value));
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Код компании (для ссылки боту)</label>
                <Input
                  required
                  pattern="[a-z0-9][a-z0-9-]{1,30}[a-z0-9]"
                  placeholder="bluesparkle"
                  value={tenantSlug}
                  onChange={(e) => setTenantSlug(autoSlug(e.target.value))}
                />
                <p className="text-xs text-[var(--color-text-muted)]">
                  Будет использоваться в ссылке: t.me/CleanOpsBookingBot?start=tenant_<b>{tenantSlug || "..."}</b>
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Ваше имя</label>
                  <Input required placeholder="Иван Петров" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Email</label>
                  <Input required type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Пароль</label>
                <Input
                  required
                  type="password"
                  minLength={6}
                  placeholder="минимум 6 символов"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Создаём аккаунт…" : "Создать компанию"}
              </Button>
            </form>
            <p className="text-xs text-[var(--color-text-muted)] mt-4 text-center">
              Уже есть аккаунт?{" "}
              <Link href="/login" className="text-[var(--color-brand-700)] font-medium">
                Войти
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
