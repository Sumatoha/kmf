import { ChevronDown } from "lucide-react";

const ITEMS = [
  {
    q: "Сколько времени уходит на запуск?",
    a: "От регистрации до первого заказа в боте — обычно меньше дня. Создаёте аккаунт, добавляете услуги и цены, приглашаете мастеров по ссылкам. Клиенты пишут боту по ссылке, которую вы даёте на сайте, в визитках или Instagram.",
  },
  {
    q: "А свои Telegram-боты заводить надо?",
    a: "Нет. На тарифе Старт вы используете общие @CleanOpsBookingBot и @CleanOpsMasterBot — каждая компания цепляется через личную ссылку с tenant-кодом. На тарифе Pro можно подключить свой бот с вашим брендом и аватаркой.",
  },
  {
    q: "Как происходит распределение заказов?",
    a: "Когда клиент подтверждает запись, бот мастеров рассылает уведомление всем доступным мастерам с кнопкой «Взять». Первый, кто принял — получает заказ. Остальным приходит уведомление, что заказ уже занят. Это занимает в среднем 30 секунд.",
  },
  {
    q: "Что если ни один мастер не возьмёт заказ?",
    a: "Заказ остаётся в статусе «Новый» в CRM, и диспетчер видит его на канбан-доске. Можно вручную назначить любого мастера или связаться с клиентом и перенести.",
  },
  {
    q: "Где хранятся данные? Это безопасно?",
    a: "Данные хранятся в Postgres на серверах в РФ (или в Supabase, по вашему выбору). Каждая компания изолирована — вы видите только свои заказы и мастеров. Пароли хранятся в виде bcrypt-хэшей, авторизация — по JWT.",
  },
  {
    q: "Можно интегрировать с моей CRM или 1С?",
    a: "На тарифе Pro доступен API и вебхуки на ключевые события (новый заказ, выполнение, отзыв). На Enterprise делаем индивидуальные интеграции с 1С, Битрикс24, AmoCRM и собственными системами.",
  },
  {
    q: "Что с онлайн-оплатой?",
    a: "В первой версии оплата идёт офлайн (наличные / перевод после уборки). Подключение Telegram Payments и ЮKassa — в roadmap на ближайшие пару месяцев.",
  },
  {
    q: "Сколько компаний платформа выдержит?",
    a: "Архитектура multi-tenant с изоляцией через tenant_id и индексами по нему. На стандартном Postgres без проблем тянет тысячи компаний и сотни тысяч заказов в месяц.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-24 sm:py-32 bg-[var(--color-surface-2)]/40">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center">
          <div className="inline-block text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-700)]">
            FAQ
          </div>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            Частые вопросы
          </h2>
        </div>

        <div className="mt-12 space-y-3">
          {ITEMS.map((it, i) => (
            <details
              key={i}
              className="group rounded-2xl border bg-white px-5 py-4 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="text-base font-semibold">{it.q}</span>
                <ChevronDown className="size-5 text-[var(--color-text-muted)] transition-transform group-open:rotate-180 shrink-0 ml-4" />
              </summary>
              <p className="mt-3 text-[var(--color-text-muted)] leading-relaxed">{it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
