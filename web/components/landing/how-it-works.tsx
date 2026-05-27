"use client";

import { CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { AvatarStack, SectionTitle, TEAM } from "./primitives";
import { Reveal, StaggerContainer, StaggerItem, slideInLeft, slideInRight } from "./motion";

type Card = {
  id: string;
  title: string;
  team: number[];
  pr: "low" | "med" | "high";
  prog?: number;
};

type Col = {
  title: string;
  count: number;
  color: string;
  cards: Card[];
};

const COLS: Col[] = [
  {
    title: "Новые",
    count: 4,
    color: "var(--color-muted)",
    cards: [
      { id: "CO-4821", title: "Kaspi HQ · Достык 38", team: [0, 1], pr: "med" },
      { id: "CO-4822", title: "ЖК Esentai Apartments", team: [], pr: "high" },
    ],
  },
  {
    title: "Назначены",
    count: 6,
    color: "var(--color-moss)",
    cards: [
      { id: "CO-4824", title: "Magnum Cash & Carry", team: [4], pr: "low" },
      { id: "CO-4823", title: "Choco-Family · ул. Маркова", team: [2, 3], pr: "high" },
    ],
  },
  {
    title: "В пути",
    count: 3,
    color: "#1E5A85",
    cards: [{ id: "CO-4825", title: "Loft 88м² · Бостандык", team: [2, 6], pr: "high" }],
  },
  {
    title: "Идёт уборка",
    count: 8,
    color: "var(--color-mint-deep)",
    cards: [
      { id: "CO-4826", title: "Beeline · 12 этаж", team: [0, 5], pr: "med", prog: 100 },
      { id: "CO-4827", title: "Sulpak Розыбакиева", team: [1], pr: "med", prog: 75 },
    ],
  },
  {
    title: "Проверка",
    count: 2,
    color: "var(--color-warn)",
    cards: [{ id: "CO-4828", title: "Студия 24м² · Самал", team: [7], pr: "low" }],
  },
  {
    title: "Завершено",
    count: 23,
    color: "var(--color-ok)",
    cards: [{ id: "CO-4830", title: "Townhouse · Горный гигант", team: [2, 6, 0], pr: "high" }],
  },
];

const BENEFITS = [
  "Авто-переходы по событиям из бота",
  "Drag & drop с уведомлением мастеру в Telegram",
  "Ручное назначение для частных клиентов",
  "Фильтры по тегам, SLA, типу уборки",
];

export function HowItWorks() {
  return (
    <section id="kanban" className="relative py-24 sm:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-14 items-center">
          <Reveal variants={slideInLeft}>
            <div>
              <SectionTitle
                eyebrow="Канбан"
                title={
                  <>
                    Заказы движутся{" "}
                    <span className="gradient-text">
                      сами по&nbsp;себе
                    </span>
                  </>
                }
                sub="Мастер принял заказ в боте → карточка ушла в «Назначен». Отметил «Выехал» → в «В пути». Подтвердил выполнение → в «Проверку». Ни одного клика менеджера."
              />
              <StaggerContainer className="mt-8 flex flex-col gap-3" staggerDelay={0.1}>
                {BENEFITS.map((x) => (
                  <StaggerItem key={x}>
                    <div className="flex gap-2.5 items-start text-[14px] text-[color:var(--color-ink-2)]">
                      <CheckCircle2
                        className="size-[18px] shrink-0 mt-0.5"
                        style={{ color: "var(--color-moss)" }}
                        strokeWidth={2}
                      />
                      <span>{x}</span>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </Reveal>

          <Reveal variants={slideInRight}>
            <KanbanBoard />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function KanbanBoard() {
  return (
    <motion.div
      className="rounded-[20px] border bg-white p-4 shadow-[var(--shadow-xl)] overflow-hidden"
      whileHover={{ boxShadow: "0 32px 64px -20px rgba(15, 42, 26, 0.22), 0 8px 24px rgba(15, 42, 26, 0.08)" }}
      transition={{ duration: 0.3 }}
    >
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
        {COLS.map((col, i) => (
          <motion.div
            key={col.title}
            className="rounded-xl surface-2 p-2"
            style={{ minHeight: 320 }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full" style={{ background: col.color }} />
                <span className="text-[11px] font-bold tracking-tight">{col.title}</span>
              </div>
              <span className="text-[10px] text-[color:var(--color-muted)]">{col.count}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {col.cards.map((c, j) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 + j * 0.08, duration: 0.4 }}
                >
                  <KanbanCard card={c} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function KanbanCard({ card }: { card: Card }) {
  return (
    <motion.div
      className="bg-white border rounded-[10px] p-2 text-[10px] cursor-default"
      whileHover={{ y: -2, boxShadow: "0 4px 14px rgba(15, 42, 26, 0.08)" }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex justify-between items-center mb-1">
        <span className="mono text-[9px] text-[color:var(--color-muted)]">{card.id}</span>
        {card.pr === "high" && (
          <motion.span
            className="size-1 rounded-full"
            style={{ background: "var(--color-err)" }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>
      <div className="text-[10.5px] font-medium leading-tight mb-1.5">{card.title}</div>
      <div className="flex items-center justify-between">
        {card.team.length > 0 ? (
          <AvatarStack people={card.team.map((idx) => TEAM[idx])} size={16} max={3} />
        ) : (
          <span className="text-[9px] text-[color:var(--color-muted)]">не назначен</span>
        )}
        {card.prog !== undefined && (
          <span className="text-[9px] font-bold" style={{ color: "var(--color-moss)" }}>
            {card.prog}%
          </span>
        )}
      </div>
    </motion.div>
  );
}
