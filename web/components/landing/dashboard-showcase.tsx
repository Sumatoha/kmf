"use client";

import {
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Star,
} from "lucide-react";
import { motion } from "motion/react";
import CountUp from "react-countup";
import { Avatar, Logo, Pill, SectionTitle, StatusDot } from "./primitives";
import { Reveal, scaleIn } from "./motion";

export function DashboardShowcase() {
  return (
    <section id="dashboard" className="relative py-24 sm:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal>
          <SectionTitle
            align="center"
            eyebrow="Дашборд"
            title={
              <>
                Открыли утром —{" "}
                <span className="gradient-text">
                  увидели весь день
                </span>
              </>
            }
            sub="Загрузка команд, заказы на сегодня, SLA-риски и выручка. Один экран — все ответы."
          />
        </Reveal>

        <Reveal variants={scaleIn} delay={0.15}>
          <motion.div
            className="mt-12 rounded-[24px] border bg-white p-5 shadow-[var(--shadow-xl)] noise-overlay"
            whileHover={{ boxShadow: "0 32px 64px -20px rgba(15, 42, 26, 0.22), 0 0 60px -12px rgba(78, 217, 200, 0.15)" }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4 px-1 relative z-10">
              <div className="flex items-center gap-2">
                <Logo size={16} />
                <span className="ml-3 text-[13px] text-[color:var(--color-muted)]">
                  · Дашборд / Сегодня, понедельник
                </span>
              </div>
              <div className="flex gap-1.5">
                <Pill variant="leaf">
                  <StatusDot kind="live" pulse />
                  Live · 12 команд на смене
                </Pill>
                <Pill>
                  <Calendar className="size-3" />
                  27 апр
                </Pill>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-3 relative z-10">
              <StatTile
                label="Заказов сегодня"
                value={47}
                delta="+8 vs вчера"
                kind="up"
                icon={<FileText className="size-3.5" />}
                sub="12 в работе"
                delay={0}
              />
              <StatTile
                label="Выручка"
                value={1050000}
                suffix=" ₸"
                separator=" "
                delta="+22%"
                kind="up"
                icon={<DollarSign className="size-3.5" />}
                sub="к плану 96%"
                delay={0.08}
              />
              <StatTile
                label="Загрузка команд"
                value={83}
                suffix="%"
                delta="3 свободны"
                kind="neutral"
                icon={<Users className="size-3.5" />}
                sub="9 из 12 на объектах"
                delay={0.16}
              />
              <StatTile
                label="SLA / NPS"
                valueStr="98% · 4.9"
                delta="2 риска"
                kind="down"
                icon={<Star className="size-3.5" />}
                sub="3 опоздания за неделю"
                delay={0.24}
              />
            </div>

            <div className="grid lg:grid-cols-[1.4fr_1fr] gap-2.5 relative z-10">
              <ScheduleCard />
              <AlertsCard />
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}

function StatTile({
  label,
  value,
  valueStr,
  suffix = "",
  separator,
  delta,
  kind,
  icon,
  sub,
  delay,
}: {
  label: string;
  value?: number;
  valueStr?: string;
  suffix?: string;
  separator?: string;
  delta: string;
  kind: "up" | "down" | "neutral";
  icon: React.ReactNode;
  sub: string;
  delay: number;
}) {
  const deltaColor = kind === "up" ? "var(--color-ok)" : kind === "down" ? "var(--color-err)" : "var(--color-muted)";
  const Trend = kind === "up" ? TrendingUp : kind === "down" ? TrendingDown : null;
  return (
    <motion.div
      className="rounded-[14px] border bg-white p-4 group hover:border-[color:var(--color-mint)] transition-colors"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
    >
      <div className="flex items-center justify-between text-[11px] text-[color:var(--color-muted)] font-medium">
        <span>{label}</span>
        <span style={{ color: "var(--color-muted-2)" }}>{icon}</span>
      </div>
      <div className="mt-2 text-[26px] font-medium tracking-[-0.025em] leading-none tnum">
        {value !== undefined ? (
          <CountUp end={value} duration={2} separator={separator || ","} suffix={suffix} enableScrollSpy scrollSpyOnce />
        ) : valueStr}
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px]">
        <span className="inline-flex items-center gap-1 font-semibold" style={{ color: deltaColor }}>
          {Trend && <Trend className="size-3" />}
          {delta}
        </span>
        <span className="text-[color:var(--color-muted-2)]">{sub}</span>
      </div>
    </motion.div>
  );
}

const SCHEDULE = [
  { name: "Айгуль К.", tone: "leaf" as const, blocks: [{ s: 8, e: 22, j: "Kaspi HQ" }, { s: 32, e: 50, j: "Beeline" }] },
  { name: "Динара С.", tone: "moss" as const, blocks: [{ s: 18, e: 50, j: "Loft 88м²" }, { s: 60, e: 80, j: "Esentai Apt" }] },
  { name: "Марина П.", tone: "amber" as const, blocks: [{ s: 60, e: 70, j: "Magnum" }] },
  { name: "Данияр Р.", tone: "sky" as const, blocks: [{ s: 50, e: 62, j: "Choco-Family" }] },
  { name: "Елена Т.", tone: "tomato" as const, blocks: [{ s: 0, e: 14, j: "Sulpak" }, { s: 26, e: 36, j: "Forte" }] },
  { name: "Олжас В.", tone: "ink" as const, blocks: [{ s: 8, e: 18, j: "Technodom" }] },
];

const BLOCK_BG = [
  "var(--color-mint-soft)",
  "var(--color-sage)",
  "#BEE4FF",
  "var(--color-cream)",
  "var(--color-mint-soft)",
  "var(--color-sage)",
];

function ScheduleCard() {
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex justify-between items-center mb-3">
        <div>
          <div className="text-[15px] font-semibold">Расписание команд</div>
          <div className="text-[12px] text-[color:var(--color-muted)] mt-0.5">
            9 из 12 клинеров на смене · 47 заказов
          </div>
        </div>
        <div className="flex gap-1 p-0.5 surface-2 rounded-[9px]">
          {["День", "Неделя", "Месяц"].map((t, i) => (
            <button
              key={t}
              className="px-3 py-1 text-[12px] font-medium rounded-md transition-all"
              style={{
                background: i === 0 ? "var(--color-surface)" : "transparent",
                color: i === 0 ? "var(--color-ink)" : "var(--color-muted)",
                boxShadow: i === 0 ? "var(--shadow-sm)" : "none",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[60px_1fr] gap-2">
        <div />
        <div className="flex text-[10px] text-[color:var(--color-muted-2)] mb-1.5">
          {["6", "8", "10", "12", "14", "16", "18", "20", "22"].map((h, i) => (
            <div key={h} className="flex-1" style={{ textAlign: i === 0 ? "left" : "center" }}>
              {h}:00
            </div>
          ))}
        </div>
        {SCHEDULE.map((row, r) => (
          <RowFragment key={row.name} row={row} bgIdx={r} />
        ))}
      </div>
    </div>
  );
}

function RowFragment({ row, bgIdx }: { row: (typeof SCHEDULE)[number]; bgIdx: number }) {
  return (
    <>
      <div className="flex items-center gap-1.5 text-[11px] font-medium h-7">
        <Avatar name={row.name} tone={row.tone} size={20} />
        <span className="truncate">{row.name}</span>
      </div>
      <div className="relative h-7 surface-2 rounded-md overflow-hidden">
        {row.blocks.map((b, i) => (
          <motion.div
            key={i}
            className="absolute top-[3px] bottom-[3px] rounded-[5px] px-1.5 text-[9.5px] font-semibold flex items-center whitespace-nowrap overflow-hidden"
            style={{
              left: `${b.s}%`,
              width: `${b.e - b.s}%`,
              background: BLOCK_BG[bgIdx % BLOCK_BG.length],
              color: "var(--color-leaf-deep)",
            }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: bgIdx * 0.06 + i * 0.1, duration: 0.5, ease: "easeOut" }}
          >
            {b.j}
          </motion.div>
        ))}
        <motion.div
          className="absolute left-[44%] top-0 bottom-0 w-px"
          style={{ background: "var(--color-err)" }}
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
    </>
  );
}

const ALERTS = [
  {
    kind: "err" as const,
    title: "Мастер CO-4823 опаздывает на 12 минут",
    sub: "Choco-Family · авто-сообщение клиенту",
    time: "2 мин",
  },
  {
    kind: "warn" as const,
    title: "Заказ CO-4825 ждёт назначения 8 минут",
    sub: "Никто не принял — нужно ручное распределение",
    time: "12 мин",
  },
  {
    kind: "ok" as const,
    title: "Заказ выполнен — Beeline 12 эт.",
    sub: "Оценка клиента 5 ★ · оплата подтверждена",
    time: "23 мин",
  },
  {
    kind: "err" as const,
    title: "Мастер Данияр Р. — отметил больничный",
    sub: "2 заказа на завтра требуют переназначения",
    time: "1 ч",
  },
];

function AlertsCard() {
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex justify-between items-center mb-3">
        <div className="text-[15px] font-semibold">Уведомления</div>
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
          <Pill variant="tomato">3 требуют действий</Pill>
        </motion.div>
      </div>
      <div className="flex flex-col gap-2.5">
        {ALERTS.map((a, i) => {
          const Icon = a.kind === "err" ? Bell : a.kind === "warn" ? Clock : CheckCircle2;
          const bg = a.kind === "err" ? "#FBDDD0" : a.kind === "warn" ? "#FBE9C0" : "#E7F2DC";
          const fg = a.kind === "err" ? "#7A2913" : a.kind === "warn" ? "#7A4F0A" : "var(--color-leaf-deep)";
          return (
            <motion.div
              key={i}
              className="rounded-[10px] surface-2 p-3 flex gap-2.5 hover:bg-[color:var(--color-surface)] transition-colors cursor-default"
              initial={{ opacity: 0, x: 12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <div className="size-7 rounded-full grid place-items-center shrink-0" style={{ background: bg, color: fg }}>
                <Icon className="size-3" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-medium leading-snug mb-0.5">{a.title}</div>
                <div className="text-[11px] text-[color:var(--color-muted)] truncate">{a.sub}</div>
              </div>
              <div className="text-[10px] text-[color:var(--color-muted-2)] whitespace-nowrap">{a.time}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <MiniMetric label="SLA" value={98} suffix="%" />
        <MiniMetric label="NPS" value={4.9} decimals={1} />
        <MiniMetric label="QA pass" value={96} suffix="%" />
      </div>
    </div>
  );
}

function MiniMetric({ label, value, suffix = "", decimals = 0 }: { label: string; value: number; suffix?: string; decimals?: number }) {
  return (
    <div className="rounded-[10px] surface-2 py-3">
      <div className="text-[10px] text-[color:var(--color-muted)] uppercase tracking-wider font-semibold">{label}</div>
      <div className="text-[18px] font-semibold tracking-tight tnum mt-0.5">
        <CountUp end={value} duration={2} decimals={decimals} suffix={suffix} enableScrollSpy scrollSpyOnce />
      </div>
    </div>
  );
}
