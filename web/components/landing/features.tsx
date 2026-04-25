import {
  Bot,
  Calendar,
  Globe2,
  KanbanSquare,
  Star,
  Zap,
} from "lucide-react";

export function Features() {
  return (
    <section id="features" className="py-24 sm:py-32 relative">
      <div className="max-w-6xl mx-auto px-4">
        <SectionHeader
          eyebrow="Возможности"
          title={
            <>
              Всё, что нужно <br />
              <span className="gradient-text">клининговой компании</span>
            </>
          }
          subtitle="От первой записи клиента до отметки о выполнении и отзыва — каждый шаг автоматизирован."
        />

        {/* Bento grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Big card: AI assignment */}
          <FeatureCard className="md:col-span-4 md:row-span-2">
            <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-brand-700)]">
              <Zap className="size-3.5" /> Авто-распределение
            </div>
            <h3 className="mt-3 text-2xl font-bold tracking-tight">
              Заказ улетает к мастеру за&nbsp;30&nbsp;секунд
            </h3>
            <p className="mt-2 text-[var(--color-text-muted)]">
              Когда клиент подтверждает запись в боте, система мгновенно рассылает
              предложение всем доступным мастерам. Первый, кто принял — забирает заказ.
              Без диспетчера, без обзвонов.
            </p>
            <div className="mt-6 rounded-xl border bg-white/70 p-4">
              <BroadcastIllustration />
            </div>
          </FeatureCard>

          {/* Two bots */}
          <FeatureCard className="md:col-span-2">
            <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-brand-700)]">
              <Bot className="size-3.5" /> Два Telegram-бота
            </div>
            <h3 className="mt-3 text-lg font-bold tracking-tight">
              Один — клиентам, второй — мастерам
            </h3>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Чёткое разделение интерфейсов. Клиент не видит то, что для мастера, и наоборот.
            </p>
          </FeatureCard>

          {/* Multi-tenant */}
          <FeatureCard className="md:col-span-2">
            <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-brand-700)]">
              <Globe2 className="size-3.5" /> Мульти-компания
            </div>
            <h3 className="mt-3 text-lg font-bold tracking-tight">
              Изолированные данные
            </h3>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Один деплой обслуживает множество компаний. Каждая видит только свои заказы и мастеров.
            </p>
          </FeatureCard>

          {/* Kanban */}
          <FeatureCard className="md:col-span-3">
            <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-brand-700)]">
              <KanbanSquare className="size-3.5" /> Канбан заказов
            </div>
            <h3 className="mt-3 text-lg font-bold tracking-tight">
              Видишь весь поток одним взглядом
            </h3>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              6 статусов: Новый → Назначен → Подтверждён → В работе → Выполнен. Никто не теряется.
            </p>
            <div className="mt-4">
              <KanbanIllustration />
            </div>
          </FeatureCard>

          {/* Ratings */}
          <FeatureCard className="md:col-span-3">
            <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-brand-700)]">
              <Star className="size-3.5" /> Рейтинги и отзывы
            </div>
            <h3 className="mt-3 text-lg font-bold tracking-tight">
              Качество вырастает само
            </h3>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Клиент ставит оценку после уборки. Лучшие мастера видны сразу, слабые — заметны.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <RatingIllustration />
            </div>
          </FeatureCard>

          {/* Calendar */}
          <FeatureCard className="md:col-span-6">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-brand-700)]">
                  <Calendar className="size-3.5" /> Расписание
                </div>
                <h3 className="mt-3 text-2xl font-bold tracking-tight">
                  Календарь видит всё, чего не видят таблицы
                </h3>
                <p className="mt-2 text-[var(--color-text-muted)]">
                  Загруженность мастеров по дням, окна между заказами, конфликты времени —
                  всё подсвечивается до того, как клиент получит «извините, не сможем».
                </p>
              </div>
              <CalendarIllustration />
            </div>
          </FeatureCard>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
}) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <div className="inline-block text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-700)]">
        {eyebrow}
      </div>
      <h2 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight leading-tight">{title}</h2>
      <p className="mt-4 text-lg text-[var(--color-text-muted)]">{subtitle}</p>
    </div>
  );
}

function FeatureCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`group relative rounded-2xl border bg-white p-6 hover:shadow-xl hover:shadow-emerald-900/5 transition-all overflow-hidden ${className}`}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[var(--color-brand-300)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
      />
      {children}
    </div>
  );
}

function BroadcastIllustration() {
  return (
    <div className="relative grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
      {/* order pill */}
      <div className="rounded-lg border bg-gradient-to-br from-emerald-50 to-emerald-100/40 p-3">
        <div className="text-[10px] uppercase tracking-wider text-emerald-700/70">Заказ</div>
        <div className="mt-1 text-sm font-semibold">Генеральная уборка</div>
        <div className="text-xs text-[var(--color-text-muted)] mt-1">3-комн., завтра 10:00</div>
        <div className="mt-2 text-base font-bold text-emerald-700">7 500 ₽</div>
      </div>

      {/* arrows */}
      <div className="flex flex-col gap-1.5 items-center">
        <div className="size-1 rounded-full bg-emerald-400" />
        <div className="size-1 rounded-full bg-emerald-400 opacity-70" />
        <div className="size-1 rounded-full bg-emerald-400 opacity-40" />
      </div>

      {/* masters */}
      <div className="space-y-2">
        {[
          { n: "Анна", s: "✓ Принят", on: true },
          { n: "Игорь", s: "пропущен", on: false },
          { n: "Мария", s: "пропущен", on: false },
        ].map((m) => (
          <div
            key={m.n}
            className={`flex items-center justify-between text-xs rounded-md px-2.5 py-1.5 border ${
              m.on
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-zinc-50 border-zinc-200 text-zinc-500"
            }`}
          >
            <span className="font-medium">{m.n}</span>
            <span>{m.s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function KanbanIllustration() {
  const cols = [
    { t: "Новые", n: 4, c: "bg-blue-100 text-blue-700" },
    { t: "В работе", n: 3, c: "bg-cyan-100 text-cyan-700" },
    { t: "Готово", n: 8, c: "bg-emerald-100 text-emerald-700" },
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {cols.map((col) => (
        <div key={col.t} className="rounded-lg border bg-[var(--color-surface-2)] p-2">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider">
            <span className="font-semibold">{col.t}</span>
            <span className={`px-1.5 rounded ${col.c}`}>{col.n}</span>
          </div>
          <div className="mt-2 space-y-1.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-2 rounded bg-white/80 border" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function RatingIllustration() {
  return (
    <>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className="size-5 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <div className="text-3xl font-bold tracking-tight">4.92</div>
      <div className="text-xs text-[var(--color-text-muted)]">средний по&nbsp;команде</div>
    </>
  );
}

function CalendarIllustration() {
  const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const grid = [
    [0, 2, 1, 3, 0, 0, 0],
    [1, 1, 2, 1, 0, 0, 0],
    [0, 0, 1, 2, 3, 1, 0],
    [2, 1, 0, 1, 2, 0, 0],
  ];
  const colors = ["bg-zinc-100", "bg-emerald-200", "bg-emerald-400", "bg-emerald-600"];
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="grid grid-cols-7 gap-1.5 text-[10px] text-center text-[var(--color-text-muted)] mb-2">
        {days.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {grid.flat().map((v, i) => (
          <div key={i} className={`aspect-square rounded ${colors[v]}`} />
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[10px] text-[var(--color-text-muted)]">
        меньше
        <div className="flex gap-1">
          {colors.map((c, i) => (
            <div key={i} className={`size-3 rounded ${c}`} />
          ))}
        </div>
        больше
      </div>
    </div>
  );
}
