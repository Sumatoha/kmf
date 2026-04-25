import { ArrowRight, Sparkles } from "lucide-react";
import { DashboardMockup } from "./dashboard-mockup";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* mesh + grid background */}
      <div className="absolute inset-0 mesh-bg pointer-events-none" />
      <div className="absolute inset-0 bg-grid pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />

      {/* floating blobs */}
      <div
        className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-emerald-300/30 blur-3xl pointer-events-none"
        style={{ animation: "var(--animate-blob)" }}
      />
      <div
        className="absolute top-40 -right-20 w-96 h-96 rounded-full bg-cyan-300/20 blur-3xl pointer-events-none"
        style={{ animation: "var(--animate-blob)", animationDelay: "-4s" }}
      />

      <div className="relative max-w-6xl mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border bg-white/60 backdrop-blur px-3 py-1 text-xs">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
            </span>
            <span className="text-[var(--color-text-muted)]">
              Запуск — апрель 2026 · Multi-tenant SaaS
            </span>
          </div>

          <h1 className="mt-6 text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.05]">
            Управляйте клинингом
            <br />
            <span className="gradient-text">как Apple Store</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto leading-relaxed">
            CRM и два Telegram-бота — для записи клиентов и работы мастеров.
            Заказы летят сами от клиента к нужному мастеру за минуту, без звонков и таблиц.
          </p>

          <div className="mt-9 flex items-center justify-center gap-3 flex-wrap">
            <a
              href="#pricing"
              className="group h-12 inline-flex items-center gap-2 px-6 rounded-xl bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-700)] text-white font-medium shadow-lg shadow-emerald-600/20"
            >
              Начать бесплатно
              <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <a
              href="#how"
              className="h-12 inline-flex items-center gap-2 px-6 rounded-xl border bg-white hover:bg-[var(--color-surface-2)] font-medium"
            >
              Как это работает
            </a>
          </div>

          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-[var(--color-text-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="size-3.5" /> Без карты
            </span>
            <span>·</span>
            <span>5 минут до запуска</span>
            <span>·</span>
            <span>Поддержка 24/7</span>
          </div>
        </div>

        {/* Dashboard mockup */}
        <div className="mt-16 relative">
          <div
            aria-hidden
            className="absolute inset-x-12 -top-8 -bottom-8 bg-gradient-to-r from-emerald-300/30 via-cyan-200/30 to-emerald-300/30 blur-2xl rounded-full"
          />
          <div className="relative">
            <DashboardMockup />
          </div>
        </div>

        {/* logos / trust strip */}
        <div className="mt-16 text-center">
          <div className="text-xs uppercase tracking-widest text-[var(--color-text-muted)]">
            Уже доверяют CleanOps
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-60">
            {["BlueSparkle", "Чисто и Точка", "Sparkle&Co", "MasterClean", "Свежо"].map((n) => (
              <div key={n} className="text-sm font-bold tracking-tight">
                {n}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
