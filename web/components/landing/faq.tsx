"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SectionTitle } from "./primitives";
import { Reveal } from "./motion";

const ITEMS = [
  {
    q: "Сколько занимает запуск?",
    a: "15 минут на регистрацию, 1 день на загрузку команды и заказов. Шаблоны чек-листов уже встроены — для квартир, офисов, ресторанов.",
  },
  {
    q: "Нужно ли клинерам приложение?",
    a: "Нет. Клинеры работают только в Telegram-боте — он есть у всех. Никаких скачиваний, обучений и паролей.",
  },
  {
    q: "Что с оплатой клиентов?",
    a: "Оплату принимаем картой и Apple/Google Pay прямо в боте — через ЮKassa, Robokassa или Stripe. Деньги поступают вам, мы не берём комиссию с транзакций.",
  },
  {
    q: "Можно подключить наш CRM?",
    a: "Да. Есть готовые интеграции с amoCRM, Bitrix24, Notion и Google Sheets. Открытое API — на тарифе «Бизнес».",
  },
  {
    q: "Как защищены данные клиентов?",
    a: "Серверы в РФ (Yandex Cloud), шифрование в транзите и в базе. Подписываем NDA и соглашение по 152-ФЗ.",
  },
  {
    q: "Что если не подойдёт?",
    a: "Первые 14 дней бесплатно, без карты. Если решите уйти — выгрузим все заказы и контакты в CSV одной кнопкой.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="relative py-24 sm:py-28">
      <div className="max-w-3xl mx-auto px-6">
        <Reveal>
          <SectionTitle align="center" eyebrow="Вопросы" title="Часто спрашивают" />
        </Reveal>

        <div className="mt-12 border-t">
          {ITEMS.map((it, i) => (
            <motion.div
              key={i}
              className="border-b"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full px-1 py-5 flex items-center justify-between text-left group"
              >
                <span className="text-[17px] font-medium tracking-[-0.015em] group-hover:text-[color:var(--color-leaf)] transition-colors">
                  {it.q}
                </span>
                <motion.div
                  animate={{ rotate: open === i ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Plus className="size-[18px] shrink-0 text-[color:var(--color-muted)]" />
                </motion.div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="pb-5 text-[15px] text-[color:var(--color-muted)] leading-relaxed max-w-[700px]">
                      {it.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
