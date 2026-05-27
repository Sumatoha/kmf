import {
  Sparkles,
  LayoutDashboard,
  ClipboardList,
  Users,
  UserCog,
  Settings,
  TrendingUp,
  Star,
  Search,
  Bell,
} from "lucide-react";

export function DashboardMockup() {
  return (
    <div className="rounded-3xl border bg-white shadow-[0_40px_120px_-30px_rgba(15,23,42,0.30)] overflow-hidden">
      <BrowserChrome />

      <div className="grid grid-cols-[200px_1fr] h-[480px]">
        {/* sidebar */}
        <aside className="bg-[var(--color-surface-2)]/60 border-r flex flex-col">
          <div className="p-3.5 border-b flex items-center gap-2">
            <div className="size-7 grid place-items-center rounded-lg bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] text-white shadow-[0_6px_16px_-6px_rgba(16,185,129,0.55)]">
              <Sparkles className="size-3.5" />
            </div>
            <div className="text-sm font-bold">CleanOps</div>
          </div>
          <nav className="flex-1 p-2 space-y-0.5 text-[12px]">
            <NavRow icon={<LayoutDashboard className="size-3.5" />} label="Дашборд" active />
            <NavRow icon={<ClipboardList className="size-3.5" />} label="Заказы" badge="14" />
            <NavRow icon={<UserCog className="size-3.5" />} label="Мастера" />
            <NavRow icon={<Users className="size-3.5" />} label="Клиенты" />
            <NavRow icon={<Settings className="size-3.5" />} label="Услуги" />
          </nav>
          <div className="p-3 border-t">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-full bg-gradient-to-br from-emerald-300 to-emerald-500" />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold truncate">Алексей П.</div>
                <div className="text-[10px] text-[var(--color-text-muted)]">Owner</div>
              </div>
            </div>
          </div>
        </aside>

        {/* main */}
        <main className="bg-[var(--color-bg)] overflow-hidden">
          <div className="px-5 py-3 border-b bg-white flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div>
                <div className="text-[15px] font-bold tracking-tight">Дашборд</div>
                <div className="text-[10.5px] text-[var(--color-text-muted)]">Сегодня · 25 апреля</div>
              </div>
              <div className="ml-6 flex-1 max-w-xs hidden lg:block">
                <div className="h-7 rounded-md bg-[var(--color-surface-2)] border flex items-center gap-2 px-2">
                  <Search className="size-3 text-[var(--color-text-muted)]" />
                  <span className="text-[11px] text-[var(--color-text-muted)]">
                    Поиск заказов, мастеров…
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative size-7 rounded-md border bg-white grid place-items-center">
                <Bell className="size-3 text-[var(--color-text-muted)]" />
                <span className="absolute -top-1 -right-1 size-2 rounded-full bg-rose-500 ring-2 ring-white" />
              </div>
              <div className="h-7 px-2.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold grid items-center">
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  online
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 grid grid-cols-3 gap-3">
            <Stat label="Новые" value="12" tone="blue" trend="+3" />
            <Stat label="В работе" value="8" tone="cyan" trend="+1" />
            <Stat label="Сегодня" value="₽ 47.5к" tone="emerald" trend="+18%" big />
          </div>

          <div className="px-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border bg-white p-3.5">
              <div className="flex items-center justify-between">
                <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">
                  Топ мастеров
                </div>
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
              </div>
              <div className="mt-2.5 space-y-2">
                <MasterRow name="Анна К." rating="4.9" jobs={42} pos={1} />
                <MasterRow name="Игорь Р." rating="4.8" jobs={38} pos={2} />
                <MasterRow name="Мария Д." rating="4.7" jobs={29} pos={3} />
              </div>
            </div>

            <div className="rounded-xl border bg-white p-3.5">
              <div className="flex items-center justify-between">
                <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">
                  Загрузка недели
                </div>
                <div className="text-[10px] text-emerald-700 font-bold">+24%</div>
              </div>
              <Sparkline />
              <div className="mt-2 grid grid-cols-7 gap-1 text-[9px] text-[var(--color-text-muted)] text-center font-medium">
                {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function BrowserChrome() {
  return (
    <div className="px-4 h-9 border-b bg-[var(--color-surface-2)] flex items-center gap-2">
      <span className="size-2.5 rounded-full bg-rose-400" />
      <span className="size-2.5 rounded-full bg-amber-400" />
      <span className="size-2.5 rounded-full bg-emerald-400" />
      <div className="ml-3 flex-1 max-w-sm h-5 rounded-md bg-white border text-[10px] text-[var(--color-text-muted)] flex items-center justify-center gap-1">
        <span className="text-emerald-600">●</span>
        cleanops.app/dashboard
      </div>
    </div>
  );
}

function NavRow({
  icon,
  label,
  active,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md ${
        active
          ? "bg-white text-[var(--color-brand-700)] font-semibold shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06)] border border-emerald-100"
          : "text-[var(--color-text)]/65 hover:text-[var(--color-text)] hover:bg-white/60"
      }`}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">
          {badge}
        </span>
      )}
    </div>
  );
}

const TONES: Record<string, string> = {
  blue: "from-blue-50 to-blue-100/50 border-blue-200/60 text-blue-700",
  cyan: "from-cyan-50 to-cyan-100/50 border-cyan-200/60 text-cyan-700",
  emerald: "from-emerald-50 to-emerald-100/60 border-emerald-200/70 text-emerald-700",
};

function Stat({
  label,
  value,
  tone,
  trend,
  big,
}: {
  label: string;
  value: string;
  tone: string;
  trend: string;
  big?: boolean;
}) {
  return (
    <div className={`rounded-xl border bg-gradient-to-br ${TONES[tone]} p-3 relative overflow-hidden`}>
      <div className="text-[10px] uppercase tracking-wider opacity-75 font-semibold">
        {label}
      </div>
      <div className={`mt-1 font-black tracking-tight ${big ? "text-2xl" : "text-xl"} text-zinc-900`}>
        {value}
      </div>
      <div className="text-[11px] mt-1 inline-flex items-center gap-1 opacity-90 font-semibold">
        <TrendingUp className="size-3" /> {trend}
      </div>
      <div
        aria-hidden
        className="absolute -right-4 -bottom-4 size-16 rounded-full bg-white/40 blur-xl pointer-events-none"
      />
    </div>
  );
}

function MasterRow({
  name,
  rating,
  jobs,
  pos,
}: {
  name: string;
  rating: string;
  jobs: number;
  pos: number;
}) {
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <div className="flex items-center justify-between text-[11px]">
      <div className="flex items-center gap-2">
        <span className="text-sm">{medals[pos - 1]}</span>
        <div className="size-5 rounded-full bg-gradient-to-br from-emerald-200 to-emerald-400" />
        <span className="font-semibold">{name}</span>
      </div>
      <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
        <span className="inline-flex items-center gap-0.5 font-medium">
          <Star className="size-2.5 fill-amber-400 text-amber-400" />
          {rating}
        </span>
        <span>{jobs}</span>
      </div>
    </div>
  );
}

function Sparkline() {
  const points = [12, 18, 14, 22, 28, 24, 32];
  const max = Math.max(...points);
  return (
    <div className="mt-2 flex items-end gap-1.5 h-16">
      {points.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm bg-gradient-to-t from-emerald-500 via-emerald-400 to-emerald-200 relative overflow-hidden"
          style={{ height: `${(v / max) * 100}%` }}
        >
          <span
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-transparent via-white/30 to-transparent"
            style={{ animation: "var(--animate-shimmer)", animationDelay: `${i * 0.15}s` }}
          />
        </div>
      ))}
    </div>
  );
}
