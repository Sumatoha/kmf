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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api<{ token: string; user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(res.token);
      toast.success(`С возвращением, ${res.user.full_name}`);
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось войти");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 mesh-eco" />
      <motion.div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full pointer-events-none opacity-30"
        style={{ background: "radial-gradient(circle, var(--color-sage), transparent 70%)" }}
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
            <CardTitle>Вход в систему</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <motion.div className="space-y-1.5" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <label className="text-sm font-medium" htmlFor="email">Email</label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
              </motion.div>
              <motion.div className="space-y-1.5" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
                <label className="text-sm font-medium" htmlFor="password">Пароль</label>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Входим…" : "Войти"}
                </Button>
              </motion.div>
            </form>
            <p className="text-xs text-[var(--color-muted)] mt-4 text-center">
              Нет аккаунта?{" "}
              <Link href="/signup" className="text-[var(--color-moss)] font-medium hover:text-[var(--color-leaf)] transition-colors">
                Зарегистрировать компанию
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
