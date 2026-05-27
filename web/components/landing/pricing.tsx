"use client";

import { ArrowRight, Check } from "lucide-react";
import { motion } from "motion/react";
import { SectionTitle } from "./primitives";
import { Reveal, StaggerContainer, StaggerItem } from "./motion";

const PLANS = [
  {
    name: "Стартер",
    price: "9 990",
    currency: "₸",
    per: "/мес",
    desc: "До 5 мастеров",
    feats: [
      "Канбан-доска заказов",
      "Telegram-бот для клиентов",
      "Авто-распределение",
      "До 100 заказов/мес",
    ],
    cta: "Начать бесплатно",
  },
  {
    name: "Команда",
    price: "29 990",
    currency: "₸",
    per: "/мес",
    featured: true,
    desc: "До 25 мастеров",
    feats: [
      "Всё из «Стартер»",
      "Бот для мастеров",
      "Рейтинги и отзывы",
      "Безлимит заказов",
      "CSV-экспорт",
    ],
    cta: "Начать бесплатно",
  },
  {
    name: "Бизнес",
    price: "По запросу",
    currency: "",
    per: "",
    desc: "От 25 мастеров",
    feats: [
      "Всё из «Команда»",
      "API и Webhooks",
      "Свой брендинг в боте",
      "Персональный менеджер",
      "On-prem по запросу",
    ],
    cta: "Связаться",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-24 sm:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal>
          <SectionTitle
            align="center"
            eyebrow="Тарифы"
            title={
              <>
                Платите за результат,{" "}
                <span className="gradient-text">
                  а не за лицензии
                </span>
              </>
            }
            sub="14 дней бесплатно. Без карты при регистрации. Без шаблонов «связаться с отделом продаж»."
          />
        </Reveal>

        <StaggerContainer className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-3.5" staggerDelay={0.1}>
          {PLANS.map((p) => (
            <StaggerItem key={p.name}>
              <motion.div
                className={`relative rounded-[22px] p-7 sm:p-8 h-full ${
                  p.featured ? "shadow-[var(--shadow-xl)]" : "shadow-[var(--shadow-card)]"
                } ${p.featured ? "md:-translate-y-2" : ""}`}
                style={{
                  background: p.featured ? "var(--color-leaf)" : "var(--color-surface)",
                  color: p.featured ? "var(--color-lime)" : "var(--color-ink)",
                  border: p.featured ? "1px solid var(--color-leaf)" : "1px solid var(--color-line)",
                }}
                whileHover={{
                  y: p.featured ? -10 : -4,
                  boxShadow: p.featured
                    ? "0 32px 64px -20px rgba(15, 42, 26, 0.3), 0 0 60px -12px rgba(78, 217, 200, 0.2)"
                    : "0 18px 40px -16px rgba(15, 42, 26, 0.18)",
                }}
                transition={{ duration: 0.3 }}
              >
                {p.featured && (
                  <motion.div
                    className="absolute top-4 right-4 text-[11px] font-bold px-2.5 py-1 rounded-full"
                    style={{
                      background: "var(--color-mint)",
                      color: "var(--color-leaf-deep)",
                    }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Популярный
                  </motion.div>
                )}

                <div className="text-[14px] font-semibold opacity-85">{p.name}</div>

                <div className="mt-3.5 flex items-baseline gap-1.5 flex-wrap">
                  <span
                    className="font-bold tracking-[-0.03em] tnum"
                    style={{ fontSize: "clamp(2rem, 3.6vw, 2.6rem)", lineHeight: 1 }}
                  >
                    {p.price}
                  </span>
                  {p.currency && (
                    <span className="text-[18px] font-semibold opacity-90">{p.currency}</span>
                  )}
                  {p.per && (
                    <span className="text-[14px] opacity-70">{p.per}</span>
                  )}
                </div>
                <div className="text-[13px] opacity-70 mt-1">{p.desc}</div>

                <div
                  className="my-5 h-px"
                  style={{
                    background: p.featured
                      ? "rgba(255,255,255,0.15)"
                      : "var(--color-line)",
                  }}
                />

                <ul className="flex flex-col gap-2.5 mb-7">
                  {p.feats.map((f) => (
                    <li key={f} className="flex gap-2.5 text-[13.5px]">
                      <Check
                        className="size-4 shrink-0 mt-0.5"
                        strokeWidth={2.5}
                        style={{
                          color: p.featured ? "var(--color-lime)" : "var(--color-moss)",
                        }}
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                <motion.button
                  className={`w-full h-11 rounded-xl font-semibold inline-flex items-center justify-center gap-1.5 ${
                    p.featured
                      ? "bg-[color:var(--color-mint)] text-[color:var(--color-leaf-deep)]"
                      : "border border-[color:var(--color-line)] bg-white text-[color:var(--color-ink)]"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                >
                  {p.cta}
                  <ArrowRight className="size-3.5" />
                </motion.button>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
