"use client";

import { motion } from "motion/react";
import { Logo } from "./primitives";
import { Reveal, StaggerContainer, StaggerItem } from "./motion";

const COLS = [
  {
    t: "Продукт",
    l: ["Канбан", "Дашборд", "Telegram-бот", "Расписание", "API"],
  },
  {
    t: "Решения",
    l: ["Для офисов", "Для квартир", "Для ресторанов", "Для салонов", "Корпорациям"],
  },
  {
    t: "Компания",
    l: ["О нас", "Блог", "Кейсы", "Карьера", "Контакты"],
  },
  {
    t: "Связаться",
    l: ["hi@cleanops.io", "+7 495 000-00-00", "Telegram @cleanops", "Алматы"],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t bg-[color:var(--color-bg)] pt-12 pb-9 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-6">
        <Reveal className="col-span-2 md:col-span-1">
          <Logo size={20} />
          <div className="mt-3.5 text-[13px] text-[color:var(--color-muted)] max-w-[260px] leading-relaxed">
            Операционная система для клининговых команд. Без таблиц, без хаоса,
            без мессенджеров.
          </div>
        </Reveal>
        {COLS.map((c, ci) => (
          <motion.div
            key={c.t}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: ci * 0.06, duration: 0.5 }}
          >
            <div className="text-[12px] font-semibold mb-3.5">{c.t}</div>
            <ul className="list-none p-0 m-0 flex flex-col gap-2">
              {c.l.map((x) => (
                <li
                  key={x}
                  className="text-[13px] text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)] transition-colors cursor-pointer"
                >
                  {x}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
      <div className="max-w-6xl mx-auto mt-8 pt-5 border-t flex flex-col sm:flex-row justify-between gap-2 text-[12px] text-[color:var(--color-muted-2)]">
        <div>© 2026 CleanOps. Сделано в Алматы с заботой о чистоте.</div>
        <div className="flex gap-4">
          <span className="hover:text-[color:var(--color-ink)] transition-colors cursor-pointer">Политика</span>
          <span className="hover:text-[color:var(--color-ink)] transition-colors cursor-pointer">Оферта</span>
          <span className="hover:text-[color:var(--color-ink)] transition-colors cursor-pointer">Cookies</span>
        </div>
      </div>
    </footer>
  );
}
