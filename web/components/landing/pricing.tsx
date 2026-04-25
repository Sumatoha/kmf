import { Check, Sparkles } from "lucide-react";

const TIERS = [
  {
    name: "Старт",
    price: "Бесплатно",
    priceNote: "навсегда",
    description: "Чтобы попробовать. Идеально для маленькой команды.",
    features: [
      "До 50 заказов в месяц",
      "До 3 мастеров",
      "Оба Telegram-бота",
      "CRM с канбан-доской",
      "Email-поддержка",
    ],
    cta: "Начать бесплатно",
  },
  {
    name: "Pro",
    price: "2 990 ₽",
    priceNote: "/ месяц",
    description: "Для растущей компании, которая хочет расти быстрее.",
    features: [
      "Безлимит заказов и мастеров",
      "Свой бренд в Telegram-боте",
      "API и вебхуки",
      "Реал-тайм аналитика",
      "Приоритетная поддержка",
      "Экспорт данных",
    ],
    cta: "Попробовать 14 дней",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Индивидуально",
    priceNote: "от 19 990 ₽",
    description: "Для сетей с филиалами и интеграциями с 1С/Битрикс/Onec.",
    features: [
      "Всё из Pro",
      "Свой домен и логотип",
      "SSO / SAML",
      "Личный менеджер",
      "SLA 99.9%",
      "On-premise по запросу",
    ],
    cta: "Связаться с нами",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-block text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-700)]">
            Тарифы
          </div>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            Платите, когда{" "}
            <span className="gradient-text">начнёте&nbsp;зарабатывать</span>
          </h2>
          <p className="mt-4 text-lg text-[var(--color-text-muted)]">
            Стартуйте бесплатно. Переходите на платный тариф, когда упрётесь в лимиты.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={
                t.featured
                  ? "relative rounded-2xl bg-zinc-950 text-white p-8 shadow-2xl shadow-emerald-900/20 ring-1 ring-emerald-500/30 md:-translate-y-3"
                  : "relative rounded-2xl border bg-white p-8"
              }
            >
              {t.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                  <Sparkles className="size-3" /> Популярный выбор
                </div>
              )}
              <div className="text-sm font-semibold uppercase tracking-wider opacity-70">
                {t.name}
              </div>
              <div className="mt-4 flex items-baseline gap-1.5">
                <div className="text-4xl font-black tracking-tight">{t.price}</div>
                <div className={`text-sm ${t.featured ? "text-zinc-400" : "text-[var(--color-text-muted)]"}`}>
                  {t.priceNote}
                </div>
              </div>
              <p
                className={`mt-3 text-sm ${
                  t.featured ? "text-zinc-300" : "text-[var(--color-text-muted)]"
                }`}
              >
                {t.description}
              </p>

              <ul className="mt-6 space-y-3">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <span
                      className={`mt-0.5 size-5 rounded-full grid place-items-center shrink-0 ${
                        t.featured ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      <Check className="size-3" />
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`mt-8 w-full h-11 rounded-xl font-medium transition-colors ${
                  t.featured
                    ? "bg-white text-zinc-900 hover:bg-zinc-100"
                    : "bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-700)] text-white"
                }`}
              >
                {t.cta}
              </button>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-[var(--color-text-muted)]">
          Все цены без НДС. Платите рублями, картой или счётом для юр. лица.
        </p>
      </div>
    </section>
  );
}
