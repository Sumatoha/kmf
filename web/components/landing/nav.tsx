"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { getToken } from "@/lib/api";

const LINKS = [
  { href: "#features", label: "Возможности" },
  { href: "#how", label: "Как это работает" },
  { href: "#bots", label: "Боты" },
  { href: "#pricing", label: "Тарифы" },
  { href: "#faq", label: "FAQ" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(Boolean(getToken()));
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all",
        scrolled ? "py-2" : "py-4",
      )}
    >
      <div className="mx-auto max-w-6xl px-4">
        <div
          className={cn(
            "flex items-center justify-between rounded-2xl px-4 transition-all",
            scrolled
              ? "h-12 glass border shadow-[0_4px_24px_rgba(0,0,0,0.04)]"
              : "h-14 bg-transparent",
          )}
        >
          <Link href="/" className="flex items-center gap-2">
            <div className="size-7 grid place-items-center rounded-lg bg-[var(--color-brand-600)] text-white">
              <Sparkles className="size-4" />
            </div>
            <span className="font-bold tracking-tight">CleanOps</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="px-3 py-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {authed ? (
              <Link
                href="/dashboard"
                className="h-9 inline-flex items-center px-4 rounded-lg bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-700)] text-white text-sm font-medium shadow-sm"
              >
                Открыть CRM
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="h-9 inline-flex items-center px-3 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                >
                  Войти
                </Link>
                <a
                  href="#pricing"
                  className="h-9 inline-flex items-center px-4 rounded-lg bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-700)] text-white text-sm font-medium shadow-sm"
                >
                  Начать бесплатно
                </a>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 -mr-2"
            onClick={() => setOpen((v) => !v)}
            aria-label="Меню"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden mt-2 rounded-2xl border bg-white p-4 shadow-lg">
            <div className="flex flex-col">
              {LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="py-2 text-sm text-[var(--color-text)]"
                >
                  {l.label}
                </a>
              ))}
              <div className="border-t my-2" />
              {authed ? (
                <Link href="/dashboard" className="py-2 text-sm font-medium text-[var(--color-brand-700)]">
                  Открыть CRM →
                </Link>
              ) : (
                <>
                  <Link href="/login" className="py-2 text-sm">Войти</Link>
                  <a href="#pricing" className="py-2 text-sm font-medium text-[var(--color-brand-700)]">
                    Начать бесплатно →
                  </a>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
