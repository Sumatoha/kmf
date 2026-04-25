import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-24 sm:py-32">
      <div className="max-w-5xl mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-zinc-950 p-10 sm:p-16 text-white">
          {/* glow */}
          <div
            aria-hidden
            className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-emerald-500/30 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-cyan-500/20 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-grid opacity-[0.04] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
          />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="size-3.5 text-emerald-300" /> Готовы начать?
            </div>
            <h2 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight max-w-3xl">
              Превратите хаос в&nbsp;
              <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-emerald-200 bg-clip-text text-transparent">
                стройный поток заказов
              </span>
            </h2>
            <p className="mt-5 text-lg text-zinc-300 max-w-xl leading-relaxed">
              Регистрация занимает 3 минуты. До первого заказа в боте — час. Без карты, без обязательств.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="group h-12 inline-flex items-center gap-2 px-6 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-semibold shadow-lg"
              >
                Начать бесплатно
                <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="mailto:hello@cleanops.app"
                className="h-12 inline-flex items-center gap-2 px-6 rounded-xl border border-white/20 hover:bg-white/5 font-medium"
              >
                Написать нам
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
