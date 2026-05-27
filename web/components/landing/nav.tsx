"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/cn";
import { getToken } from "@/lib/api";
import { Logo } from "./primitives";

const LINKS = [
  { href: "#features", label: "Возможности" },
  { href: "#kanban", label: "Канбан" },
  { href: "#dashboard", label: "Дашборд" },
  { href: "#telegram", label: "Telegram-бот" },
  { href: "#pricing", label: "Тарифы" },
  { href: "#case", label: "Кейсы" },
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
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-3 inset-x-0 z-50"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div
          className={cn(
            "flex items-center justify-between rounded-[18px] px-3 sm:px-4 transition-all duration-300",
            "border glass shadow-[var(--shadow-sm)]",
            scrolled
              ? "h-12 shadow-[var(--shadow-md)]"
              : "h-14",
          )}
        >
          <Link href="/" className="flex items-center gap-2 group">
            <Logo size={18} />
          </Link>

          <nav className="hidden md:flex items-center gap-0.5 ml-8">
            {LINKS.map((l, i) => (
              <motion.a
                key={l.href}
                href={l.href}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.04, duration: 0.4 }}
                className="px-3 py-1.5 text-[13px] font-medium text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)] rounded-lg transition-colors relative group"
              >
                {l.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-4/5 h-[2px] rounded-full bg-[color:var(--color-mint)] transition-all duration-300" />
              </motion.a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2 ml-auto">
            {authed ? (
              <Link href="/dashboard" className="btn-primary h-9 px-4 text-[13px]">
                Открыть CRM
                <ArrowRight className="size-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="h-9 inline-flex items-center px-3 text-[13px] font-medium text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)] rounded-lg transition-colors"
                >
                  Войти
                </Link>
                <a href="#how" className="btn-ghost h-9 px-4 text-[13px]">
                  Демо
                </a>
                <Link href="/signup" className="btn-primary h-9 px-4 text-[13px]">
                  Начать бесплатно
                  <ArrowRight className="size-3.5" />
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 -mr-2 rounded-lg hover:bg-black/5 transition-colors ml-auto"
            onClick={() => setOpen((v) => !v)}
            aria-label="Меню"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="md:hidden mt-2 rounded-2xl border glass p-4 shadow-[var(--shadow-lg)]"
            >
              <div className="flex flex-col">
                {LINKS.map((l, i) => (
                  <motion.a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="py-2.5 text-sm text-[color:var(--color-ink)]"
                  >
                    {l.label}
                  </motion.a>
                ))}
                <div className="border-t my-3" />
                {authed ? (
                  <Link href="/dashboard" className="py-2 text-sm font-semibold text-[color:var(--color-leaf)]">
                    Открыть CRM →
                  </Link>
                ) : (
                  <>
                    <Link href="/login" className="py-2 text-sm">Войти</Link>
                    <Link
                      href="/signup"
                      onClick={() => setOpen(false)}
                      className="btn-primary mt-2 h-10 px-4 text-sm justify-center"
                    >
                      Начать бесплатно
                      <ArrowRight className="size-4" />
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
