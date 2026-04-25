import { Building2, Link2, MessageCircle, Sparkles } from "lucide-react";

const STEPS = [
  {
    icon: Building2,
    title: "Регистрируете компанию",
    desc: "5 минут: название, логотип, ваш прайс на услуги. Готово.",
  },
  {
    icon: Link2,
    title: "Получаете 2 ссылки",
    desc: "Ссылка для клиентов и пригласительные ссылки для мастеров — раздаёте.",
  },
  {
    icon: MessageCircle,
    title: "Клиенты пишут боту",
    desc: "Выбирают услугу, дату, адрес. Бот собирает заявку без оператора.",
  },
  {
    icon: Sparkles,
    title: "Мастер делает уборку",
    desc: "Принимает заказ, отмечает выполнение. Клиент получает уведомления.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-24 sm:py-32 relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-dots [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] pointer-events-none"
      />

      <div className="relative max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-block text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-700)]">
            Как это работает
          </div>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            От нуля до первого заказа —{" "}
            <span className="gradient-text">за&nbsp;один&nbsp;день</span>
          </h2>
          <p className="mt-4 text-lg text-[var(--color-text-muted)]">
            Никаких внедрений и обучений. Запускаетесь сами, без подрядчиков.
          </p>
        </div>

        <div className="mt-16 relative">
          {/* connecting line */}
          <div
            aria-hidden
            className="hidden lg:block absolute top-12 left-12 right-12 h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className="relative">
                  <div className="size-12 rounded-2xl bg-white border-2 border-[var(--color-brand-500)] grid place-items-center text-[var(--color-brand-700)] relative z-10 shadow-sm">
                    <Icon className="size-5" />
                    <div className="absolute -top-2 -right-2 size-6 rounded-full bg-[var(--color-brand-600)] text-white text-xs font-bold grid place-items-center">
                      {i + 1}
                    </div>
                  </div>
                  <h3 className="mt-5 text-lg font-bold tracking-tight">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
