"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
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
    <div className="min-h-screen grid place-items-center px-4 bg-gradient-to-br from-[var(--color-brand-50)] via-[var(--color-bg)] to-white">
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
            <CardTitle>Вход в систему</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="email">Email</label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="password">Пароль</label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Входим…" : "Войти"}
              </Button>
            </form>
            <p className="text-xs text-[var(--color-text-muted)] mt-4 text-center">
              Создайте первого пользователя командой <code className="font-mono">make admin</code>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
