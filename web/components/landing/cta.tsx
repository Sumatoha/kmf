"use client";

import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { motion } from "motion/react";
import { Reveal, StaggerContainer, StaggerItem, scaleIn } from "./motion";

const STEPS = [
  "Зарегистрируйтесь — 30 сек",
  "Загрузите команду из CSV",
  "Подключите Telegram-бота",
  "Запустите первые заказы",
];

export function FinalCTA() {
  return (
    <section className="relative py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal variants={scaleIn}>
          <div
            className="relative overflow-hidden rounded-[32px] p-10 sm:p-16 text-white noise-overlay"
            style={{ background: "var(--color-ink)" }}
          >
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at 80% 30%, rgba(123,229,187,0.22), transparent 55%), radial-gradient(ellipse at 20% 90%, rgba(43,170,130,0.30), transparent 55%)",
              }}
            />

            <motion.div
              className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full pointer-events-none opacity-10"
              style={{ background: "radial-gradient(circle, var(--color-mint), transparent 70%)" }}
              animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />

            <div className="relative grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center z-10">
              <div>
                <motion.div
                  className="font-extrabold tracking-[-0.035em] leading-[1.02]"
                  style={{ fontSize: "clamp(2.2rem, 5vw, 3.4rem)" }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  Команда из 15 мастеров — заводится за{" "}
                  <span
                    className="serif font-normal"
                    style={{ color: "var(--color-mint)" }}
                  >
                    один день
                  </span>
                  .
                </motion.div>
                <motion.div
                  className="mt-5 max-w-xl leading-relaxed"
                  style={{ fontSize: 16, color: "rgba(255,255,255,0.7)" }}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15, duration: 0.6 }}
                >
                  Регистрируетесь — загружаете заказы — приглашаете команду в бота. Готово.
                  Никаких внедренцев, договоров на 60 страниц и обучения по 4 часа.
                </motion.div>
                <motion.div
                  className="mt-9 flex gap-2.5 flex-wrap"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.25, duration: 0.6 }}
                >
                  <Link href="/signup" className="btn-accent group">
                    Начать бесплатно
                    <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <a
                    href="mailto:hello@cleanops.app"
                    className="h-11 inline-flex items-center gap-2 px-5 rounded-xl font-medium text-[14px] transition-all hover:bg-white/10"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "white",
                    }}
                  >
                    <Phone className="size-3.5" />
                    Поговорить с командой
                  </a>
                </motion.div>
              </div>

              <motion.div
                className="rounded-[18px] p-6"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  backdropFilter: "blur(10px)",
                }}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <div
                  className="text-[12px] tracking-[0.04em] uppercase font-medium"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  Запуск за 4 шага
                </div>
                <ol className="mt-5 list-none p-0 flex flex-col gap-3.5">
                  {STEPS.map((x, i) => (
                    <motion.li
                      key={x}
                      className="flex items-center gap-3.5 text-[14px]"
                      style={{ color: "rgba(255,255,255,0.9)" }}
                      initial={{ opacity: 0, x: 12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + i * 0.08, duration: 0.4 }}
                    >
                      <motion.span
                        className="size-7 rounded-full grid place-items-center text-[12px] font-bold"
                        style={{
                          background: "var(--color-mint)",
                          color: "var(--color-leaf-deep)",
                        }}
                        whileHover={{ scale: 1.15 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        {i + 1}
                      </motion.span>
                      {x}
                    </motion.li>
                  ))}
                </ol>
              </motion.div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
