"use client";

import {
  Bell,
  KanbanSquare,
  Send,
  Star,
  Users,
  Webhook,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { Pill, SectionTitle } from "./primitives";
import { Reveal, StaggerContainer, StaggerItem, fadeUp } from "./motion";

const FEATURES = [
  {
    icon: Zap,
    title: "Авто-распределение за 30 секунд",
    desc: "Заказ улетает всем свободным мастерам сразу. Первый, кто принял в боте — забирает. Без диспетчера и обзвонов.",
    tag: "Распределение",
    accent: "var(--color-amber)",
  },
  {
    icon: Send,
    title: "Два Telegram-бота",
    desc: "Один — для клиентов: бронирование, статусы, уведомления. Второй — для мастеров: смены, заказы, история.",
    tag: "Боты",
    accent: "#229ED9",
  },
  {
    icon: KanbanSquare,
    title: "Канбан с живыми статусами",
    desc: "Новый → Назначен → В пути → Выполнен. Карточки двигаются автоматически по событиям из бота.",
    tag: "Канбан",
    accent: "var(--color-mint-deep)",
  },
  {
    icon: Users,
    title: "Мульти-компания",
    desc: "Один деплой обслуживает много компаний. Каждая видит только свои заказы, мастеров и статистику.",
    tag: "Tenant",
    accent: "var(--color-moss)",
  },
  {
    icon: Star,
    title: "Рейтинги и отзывы",
    desc: "После уборки клиент ставит оценку прямо в боте. Лучшие мастера на виду, слабые — заметны.",
    tag: "Качество",
    accent: "var(--color-amber)",
  },
  {
    icon: Webhook,
    title: "Webhooks и CSV-экспорт",
    desc: "API на ключевые события, выгрузка заказов и клиентов в CSV одной кнопкой. Интеграция с вашей системой.",
    tag: "API",
    accent: "var(--color-leaf)",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal>
          <SectionTitle
            eyebrow="Возможности"
            title={
              <>
                Шесть инструментов,
                <br />
                которые заменяют{" "}
                <span className="gradient-text">
                  чаты и&nbsp;таблицы
                </span>
              </>
            }
          />
        </Reveal>
        <StaggerContainer className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5" staggerDelay={0.08}>
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <StaggerItem key={f.title}>
                <motion.div
                  className="card p-6 flex flex-col gap-3.5 min-h-[220px] group cursor-default"
                  whileHover={{ y: -4, boxShadow: "0 18px 40px -16px rgba(15, 42, 26, 0.18), 0 4px 14px rgba(15, 42, 26, 0.06)" }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="flex items-center justify-between">
                    <motion.div
                      className="size-10 rounded-[11px] grid place-items-center"
                      style={{
                        background: `color-mix(in srgb, ${f.accent} 12%, transparent)`,
                        color: f.accent,
                      }}
                      whileHover={{ scale: 1.1, rotate: 4 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Icon className="size-5" strokeWidth={2} />
                    </motion.div>
                    <Pill variant="leaf">{f.tag}</Pill>
                  </div>
                  <div className="text-[19px] font-semibold tracking-tight leading-tight">
                    {f.title}
                  </div>
                  <div className="text-[14px] text-[color:var(--color-muted)] leading-relaxed">
                    {f.desc}
                  </div>
                  <div className="mt-auto pt-2">
                    <span className="text-[13px] font-medium text-[color:var(--color-moss)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 inline-flex items-center gap-1">
                      Подробнее →
                    </span>
                  </div>
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
