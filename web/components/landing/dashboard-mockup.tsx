import {
  Sparkles,
  LayoutDashboard,
  ClipboardList,
  Users,
  UserCog,
  Settings,
  TrendingUp,
  Star,
} from "lucide-react";

// A non-interactive, hand-crafted preview of the CRM dashboard. Built with
// the same design tokens as the real app so it stays in sync visually.
export function DashboardMockup() {
  return (
    <div className="rounded-2xl border bg-white shadow-2xl shadow-emerald-900/10 overflow-hidden">
      <BrowserChrome />

      <div className="grid grid-cols-[180px_1fr] h-[460px]">
        {/* sidebar */}
        <aside className="bg-white border-r flex flex-col">
          <div className="p-3 border-b flex items-center gap-2">
            <div className="size-7 grid place-items-center rounded-lg bg-[var(--color-brand-600)] text-white">
              <Sparkles className="size-3.5" />
            </div>
            <div className="text-sm font-bold">CleanOps</div>
          </div>
          <nav className="flex-1 p-2 space-y-1 text-xs">
            <NavRow icon={<LayoutDashboard className="size-3.5" />} label="Дашборд" active />
            <NavRow icon={<ClipboardList className="size-3.5" />} label="Заказы" badge="14" />
            <NavRow icon={<UserCog className="size-3.5" />} label="Мастера" />
            <NavRow icon={<Users className="size-3.5" />} label="Клиенты" />
            <NavRow icon={<Settings className="size-3.5" />} label="Услуги" />
          </nav>
        </aside>

        {/* main */}
        <main className="bg-[var(--color-bg)] overflow-hidden">
          <div className="px-5 py-4 border-b bg-white flex items-center justify-between">
            <div>
              <div className="text-base font-bold tracking-tight">Дашборд</div>
              <div className="text-[11px] text-[var(--color-text-muted)]">Сегодня, 25 апреля</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-7 px-2.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-medium grid place-items-center">
                online
              </div>
            </div>
          </div>

          <div className="p-4 grid grid-cols-3 gap-3">
            <Stat label="Новые" value="12" tone="blue" trend="+3" />
            <Stat label="В работе" value="8" tone="cyan" trend="+1" />
            <Stat label="Сегодня" value="₽ 47.5к" tone="emerald" trend="+18%" big />
          </div>

          <div className="px-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border bg-white p-3">
              <div className="flex items-center justify-between">
                <div className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wide">Топ мастеров</div>
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
              </div>
              <div className="mt-2 space-y-1.5">
                <MasterRow name="Анна К." rating="4.9" jobs={42} />
                <MasterRow name="Игорь Р." rating="4.8" jobs={38} />
                <MasterRow name="Мария Д." rating="4.7" jobs={29} />
              </div>
            </div>

            <div className="rounded-xl border bg-white p-3">
              <div className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wide">Загрузка недели</div>
              <Sparkline />
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
      <div className="ml-3 flex-1 max-w-sm h-5 rounded-md bg-white border text-[10px] text-[var(--color-text-muted)] grid place-items-center">
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
          ? "bg-[var(--color-brand-50)] text-[var(--color-brand-700)] font-semibold"
          : "text-[var(--color-text)]/70"
      }`}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
          {badge}
        </span>
      )}
    </div>
  );
}

const TONES: Record<string, string> = {
  blue: "from-blue-50 to-blue-100/40 border-blue-200/50 text-blue-700",
  cyan: "from-cyan-50 to-cyan-100/40 border-cyan-200/50 text-cyan-700",
  emerald: "from-emerald-50 to-emerald-100/60 border-emerald-200/60 text-emerald-700",
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
      <div className="text-[10px] uppercase tracking-wider opacity-70">{label}</div>
      <div className={`mt-1 font-bold tracking-tight ${big ? "text-2xl" : "text-xl"} text-zinc-900`}>
        {value}
      </div>
      <div className="text-[11px] mt-1 inline-flex items-center gap-1 opacity-80">
        <TrendingUp className="size-3" /> {trend}
      </div>
    </div>
  );
}

function MasterRow({ name, rating, jobs }: { name: string; rating: string; jobs: number }) {
  return (
    <div className="flex items-center justify-between text-[11px]">
      <div className="flex items-center gap-2">
        <div className="size-5 rounded-full bg-gradient-to-br from-emerald-200 to-emerald-400" />
        <span className="font-medium">{name}</span>
      </div>
      <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
        <span className="inline-flex items-center gap-0.5">
          <Star className="size-2.5 fill-amber-400 text-amber-400" />
          {rating}
        </span>
        <span>{jobs}</span>
      </div>
    </div>
  );
}

function Sparkline() {
  // hand-tuned values to look like a smooth weekly trend
  const points = [12, 18, 14, 22, 28, 24, 32];
  const max = Math.max(...points);
  return (
    <div className="mt-2 flex items-end gap-1.5 h-16">
      {points.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm bg-gradient-to-t from-emerald-400 to-emerald-200"
          style={{ height: `${(v / max) * 100}%` }}
        />
      ))}
    </div>
  );
}
