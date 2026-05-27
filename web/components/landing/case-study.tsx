"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import CountUp from "react-countup";
import { Avatar, Pill } from "./primitives";
import { Reveal, StaggerContainer, StaggerItem, slideInLeft, slideInRight } from "./motion";

const METRICS = [
  { l: "Заказов в месяц", before: "320", after: 780, d: "+143%" },
  { l: "Время на распределение", before: "3,2 ч/день", afterStr: "20 мин", d: "−90%" },
  { l: "Жалоб от клиентов", before: "11/мес", afterStr: "3/мес", d: "−73%" },
  { l: "Средний рейтинг мастера", before: "4,3", after: 4.9, decimals: 1, d: "+0,6" },
];

export function CaseStudy() {
  return (
    <section
      id="case"
      className="relative py-24 sm:py-28"
      style={{ background: "var(--color-surface-2)" }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-14 items-center">
          <Reveal variants={slideInLeft}>
            <div>
              <Pill variant="leaf">Кейс · Tazalyq Almaty</Pill>
              <div
                className="serif text-[color:var(--color-ink)] mt-5 leading-tight"
                style={{ fontSize: "clamp(1.6rem, 3.4vw, 2.4rem)" }}
              >
                «Раньше менеджер вёл 80 заказов в Excel
                <br />
                и тонул в WhatsApp-чатах.
                <br />
                Сейчас ведёт 240 — и закрывает ноут в&nbsp;18:00».
              </div>
              <div className="flex items-center gap-3 mt-7">
                <Avatar name="АТ" tone="moss" size={44} />
                <div>
                  <div className="text-[14px] font-semibold">Аскар Турсунов</div>
                  <div className="text-[12.5px] text-[color:var(--color-muted)]">
                    Со-основатель Tazalyq Almaty · 28 мастеров
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <StaggerContainer className="grid grid-cols-2 gap-3" staggerDelay={0.1}>
            {METRICS.map((m) => (
              <StaggerItem key={m.l}>
                <motion.div
                  className="card p-5 group"
                  whileHover={{ y: -3, boxShadow: "0 18px 40px -16px rgba(15, 42, 26, 0.18)" }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="text-[11px] text-[color:var(--color-muted)] font-medium tracking-[0.03em] uppercase">
                    {m.l}
                  </div>
                  <div className="flex items-baseline gap-2 mt-2.5">
                    <span className="text-[13px] text-[color:var(--color-muted-2)] line-through tnum">
                      {m.before}
                    </span>
                    <ArrowRight className="size-3 text-[color:var(--color-muted-2)]" />
                    <span className="text-[26px] font-semibold tracking-[-0.025em] tnum">
                      {m.after !== undefined ? (
                        <CountUp
                          end={m.after}
                          duration={2}
                          decimals={m.decimals || 0}
                          enableScrollSpy
                          scrollSpyOnce
                        />
                      ) : m.afterStr}
                    </span>
                  </div>
                  <motion.div
                    initial={{ scale: 0.9 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, type: "spring" }}
                  >
                    <Pill variant="leaf" className="mt-2.5">{m.d}</Pill>
                  </motion.div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}
