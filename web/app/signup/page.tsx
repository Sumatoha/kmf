"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Leaf } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
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
    <div className="min-h-screen grid place-items-center px-4 py-10 relative overflow-hidden">
      <div className="absolute inset-0 mesh-eco" />
      <motion.div
        className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full pointer-events-none opacity-30"
        style={{ background: "radial-gradient(circle, var(--color-mint-soft), transparent 70%)" }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <motion.div
          className="flex items-center justify-center gap-2.5 mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <div className="size-10 grid place-items-center rounded-xl" style={{ background: "var(--color-leaf)", color: "var(--color-lime)" }}>
            <Leaf className="size-5" strokeWidth={2.2} />
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight">CleanOps</div>
            <div className="text-xs text-[var(--color-muted)]">CRM для клининговых компаний</div>
          </div>
        </motion.div>
        <Card className="shadow-[var(--shadow-lg)]">
          <CardHeader>
            <CardTitle>Регистрация компании</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <motion.div className="space-y-1.5" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
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
              </motion.div>
              <motion.div className="space-y-1.5" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <label className="text-sm font-medium">Код компании (для ссылки боту)</label>
                <Input
                  required
                  pattern="[a-z0-9][a-z0-9-]{1,30}[a-z0-9]"
                  placeholder="bluesparkle"
                  value={tenantSlug}
                  onChange={(e) => setTenantSlug(autoSlug(e.target.value))}
                />
                <p className="text-xs text-[var(--color-muted)]">
                  Будет использоваться в ссылке: t.me/CleanOpsBookingBot?start=tenant_<b>{tenantSlug || "..."}</b>
                </p>
              </motion.div>
              <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-3" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Ваше имя</label>
                  <Input required placeholder="Иван Петров" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Email</label>
                  <Input required type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </motion.div>
              <motion.div className="space-y-1.5" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <label className="text-sm font-medium">Пароль</label>
                <Input required type="password" minLength={6} placeholder="минимум 6 символов" value={password} onChange={(e) => setPassword(e.target.value)} />
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Создаём аккаунт…" : "Создать компанию"}
                </Button>
              </motion.div>
            </form>
            <p className="text-xs text-[var(--color-muted)] mt-4 text-center">
              Уже есть аккаунт?{" "}
              <Link href="/login" className="text-[var(--color-moss)] font-medium hover:text-[var(--color-leaf)] transition-colors">
                Войти
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
