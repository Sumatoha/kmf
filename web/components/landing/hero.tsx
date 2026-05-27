"use client";

import Link from "next/link";
import { ArrowRight, Bell, Check, Play, Send, Star } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import CountUp from "react-countup";
import { AvatarStack, Pill, StatusDot, TEAM } from "./primitives";
import { Reveal, FloatingCard } from "./motion";

const HERO_LOGOS = [
  "KASPI",
  "MAGNUM",
  "BEELINE",
  "CHOCO",
  "SULPAK",
  "FORTE",
  "AIR ASTANA",
  "TECHNODOM",
];

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={sectionRef} className="relative pt-28 sm:pt-36 pb-12 overflow-hidden">
      <motion.div
        aria-hidden
        className="absolute inset-0 mesh-eco pointer-events-none"
        style={{ y: bgY, opacity: bgOpacity }}
      />

      <motion.div
        className="absolute -top-32 left-[5%] w-[40rem] h-[40rem] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(closest-side, rgba(182,255,76,0.18), transparent 70%)",
          y: bgY,
        }}
        animate={{
          scale: [1, 1.08, 0.95, 1],
          x: [0, 40, -30, 0],
          y: [0, -30, 25, 0],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-20 -right-32 w-[36rem] h-[36rem] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(closest-side, rgba(46,107,67,0.10), transparent 70%)",
        }}
        animate={{
          scale: [1, 0.95, 1.08, 1],
          x: [0, -30, 40, 0],
          y: [0, 25, -30, 0],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 5 }}
      />

      <div className="relative max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-14 items-center">
          <div>
            <motion.a
              href="#telegram"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border bg-white pr-3 py-1.5 pl-1.5 text-[12.5px] font-medium text-[color:var(--color-muted)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow"
            >
              <span className="rounded-full bg-[color:var(--color-lime)] text-[color:var(--color-leaf-deep)] px-2 py-0.5 text-[11px] font-bold tracking-wider animate-pulse">
                NEW
              </span>
              Telegram-боты для клиента и клинера в одном окне
            </motion.a>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 font-extrabold text-[color:var(--color-ink)] tracking-[-0.04em] leading-[0.96]"
              style={{ fontSize: "clamp(2.6rem, 6.2vw, 4.8rem)" }}
            >
              Операционная система
              <br />
              <span className="gradient-text-hero">
                для клининговой
              </span>
              <br />
              команды.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-7 text-lg text-[color:var(--color-muted)] leading-relaxed max-w-xl"
            >
              Канбан заказов, авто-распределение мастерам, рейтинги
              и&nbsp;два&nbsp;Telegram-бота —
              без таблиц, WhatsApp-чатов и потерянных смен.
              Запуск за&nbsp;15&nbsp;минут.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-9 flex items-center gap-3 flex-wrap"
            >
              <Link href="/signup" className="btn-primary group">
                Запустить за 15 минут
                <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a href="#how" className="btn-ghost group">
                <Play className="size-3.5 fill-[color:var(--color-leaf)] text-[color:var(--color-leaf)]" />
                Посмотреть 2-мин демо
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-10 flex items-center gap-5"
            >
              <AvatarStack people={TEAM.slice(0, 5)} size={32} />
              <div className="text-[13px] text-[color:var(--color-muted)] leading-tight">
                <div>
                  <span className="text-[color:var(--color-ink)] font-semibold">
                    <CountUp end={140} duration={2.5} enableScrollSpy scrollSpyOnce />+ команд
                  </span>{" "}
                  ежедневно ведут заказы в CleanOps
                </div>
                <div className="inline-flex items-center gap-1 mt-1">
                  <Star className="size-3.5 fill-[color:var(--color-amber)] text-[color:var(--color-amber)]" />
                  4.9 средняя оценка клиентов
                </div>
              </div>
            </motion.div>
          </div>

          <HeroComposite />
        </div>

        <Reveal delay={0.5} className="mt-20">
          <div className="text-[12px] tracking-[0.12em] uppercase text-[color:var(--color-muted)] text-center">
            140+ клининговых компаний работают в CleanOps
          </div>
          <div className="mt-6 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-[color:var(--color-bg)] to-transparent" />
            <div className="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-[color:var(--color-bg)] to-transparent" />
            <div className="marquee-track border-y border-[color:var(--color-line-2)]">
              {[...HERO_LOGOS, ...HERO_LOGOS].map((l, i) => (
                <div
                  key={`${l}-${i}`}
                  className="px-8 py-4 text-center text-[13px] font-bold tracking-[0.06em] text-[color:var(--color-muted-2)] whitespace-nowrap border-r border-[color:var(--color-line-2)]"
                >
                  {l}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function HeroComposite() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40, rotateY: -8 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      transition={{ delay: 0.35, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative h-[440px] sm:h-[540px]"
      style={{ perspective: 1000 }}
    >
      <div
        aria-hidden
        className="absolute -inset-10 rounded-[40px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 30% 30%, rgba(182,255,76,0.20), transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(46,107,67,0.12), transparent 60%)",
        }}
      />

      <motion.div
        className="absolute left-0 top-0 right-[28px] bottom-[28px] bg-white rounded-[22px] border shadow-[var(--shadow-xl)] p-4 overflow-hidden"
        style={{ transform: "rotate(-1.5deg)" }}
        whileHover={{ scale: 1.01, rotate: -0.5 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[#FF5F57]" />
            <span className="size-2 rounded-full bg-[#FEBC2E]" />
            <span className="size-2 rounded-full bg-[#28C840]" />
            <span className="ml-3 text-[11px] text-[color:var(--color-muted)]">
              app.cleanops.io / dashboard
            </span>
          </div>
          <Pill variant="leaf">
            <StatusDot kind="live" pulse />
            Live
          </Pill>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            { l: "Сегодня", v: 47, d: "+8", c: "var(--color-moss)" },
            { l: "В работе", v: 12, d: "5 команд", c: "var(--color-mint-deep)" },
            { l: "QA", v: 3, d: "ждут", c: "var(--color-warn)" },
            { l: "Выручка", v: "1.05М ₸", d: "+22%", c: "var(--color-ok)" },
          ].map((t, i) => (
            <div key={i} className="rounded-xl p-2.5 surface-2 flex flex-col gap-1">
              <div className="text-[10px] text-[color:var(--color-muted)] font-medium">{t.l}</div>
              <div className="text-[20px] font-semibold tracking-tight">
                {typeof t.v === "number" ? (
                  <CountUp end={t.v} duration={2} enableScrollSpy scrollSpyOnce />
                ) : t.v}
              </div>
              <div className="text-[10px] font-bold" style={{ color: t.c }}>{t.d}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-1.5 text-[10px]">
          {[
            { t: "Назначены", n: 4, c: "var(--color-moss)", items: ["CO-4824 Magnum", "CO-4823 Choco-Family"] },
            { t: "В пути", n: 2, c: "#1E5A85", items: ["CO-4825 Loft 88м²"] },
            { t: "Идёт", n: 5, c: "var(--color-mint-deep)", items: ["CO-4826 Kaspi HQ", "CO-4827 Sulpak"] },
            { t: "Готово", n: 11, c: "var(--color-ok)", items: ["CO-4830 Esentai", "CO-4831 Bostandyk"] },
          ].map((col, i) => (
            <div key={i} className="rounded-lg surface-2 p-2">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full" style={{ background: col.c }} />
                  <span className="font-bold text-[10px]">{col.t}</span>
                </div>
                <span className="text-[color:var(--color-muted)]">{col.n}</span>
              </div>
              {col.items.map((it, j) => (
                <div key={j} className="bg-white border rounded-md px-1.5 py-1 mb-1 text-[9.5px] text-[color:var(--color-ink-2)]">
                  {it}
                </div>
              ))}
            </div>
          ))}
        </div>
      </motion.div>

      <FloatingCard
        className="absolute right-0 bottom-0 w-[230px] bg-white rounded-[18px] p-3.5 border shadow-[var(--shadow-xl)]"
        y={8}
        duration={5}
        delay={1}
      >
        <div style={{ transform: "rotate(3deg)" }}>
          <div className="flex items-center gap-2 mb-2.5">
            <div className="size-7 rounded-lg grid place-items-center text-white" style={{ background: "#229ED9" }}>
              <Send className="size-3.5" />
            </div>
            <div>
              <div className="text-[12px] font-semibold">CleanOps Bot</div>
              <div className="text-[10px] text-[color:var(--color-muted)]">Анна К. · клинер</div>
            </div>
          </div>
          <div
            className="px-2.5 py-2 rounded-xl rounded-tl-[4px] text-[11px] mb-1.5 inline-flex items-start gap-1.5"
            style={{ background: "#E7F2FB", color: "var(--color-ink)" }}
          >
            <Bell className="size-3 shrink-0 mt-0.5" style={{ color: "var(--color-mint-deep)" }} />
            <span>Заказ #CO-4825 · Esentai · 65 м²</span>
          </div>
          <div className="flex justify-end">
            <div
              className="px-2.5 py-2 rounded-xl rounded-tr-[4px] text-[11px] inline-flex items-center gap-1"
              style={{ background: "var(--color-leaf)", color: "var(--color-mint)" }}
            >
              <Check className="size-3" strokeWidth={3} /> Беру
            </div>
          </div>
        </div>
      </FloatingCard>

      <FloatingCard
        className="absolute -left-3 top-9 w-[220px] bg-white rounded-[14px] p-3 border shadow-[var(--shadow-xl)]"
        y={6}
        duration={4.5}
        delay={2}
      >
        <div style={{ transform: "rotate(-4deg)" }}>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="size-6 rounded-full grid place-items-center" style={{ background: "#FBDDD0", color: "#7A2913" }}>
              <Bell className="size-3" />
            </div>
            <div className="text-[11px] font-semibold">SLA-эскалация</div>
            <span className="ml-auto text-[10px] text-[color:var(--color-muted)]">2&apos;</span>
          </div>
          <div className="text-[11px] text-[color:var(--color-ink-2)] leading-snug">
            Команда CO-4823 опаздывает на 12 минут — клиенту отправлено сообщение
          </div>
        </div>
      </FloatingCard>
    </motion.div>
  );
}
