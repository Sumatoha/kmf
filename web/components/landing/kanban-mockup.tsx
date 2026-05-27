import {
  Sparkles,
  Filter,
  Plus,
  Search,
  MoreHorizontal,
  Clock,
  MapPin,
} from "lucide-react";

type Card = {
  id: string;
  service: string;
  area: string;
  when: string;
  addr: string;
  master?: { name: string; tone: "emerald" | "blue" | "amber" | "rose" };
  flag?: "rush" | "vip";
};

type Column = {
  key: "new" | "assigned" | "confirmed" | "in_progress" | "done";
  title: string;
  count: number;
  tone: string;
  cards: Card[];
};

const COLUMNS: Column[] = [
  {
    key: "new",
    title: "Новые",
    count: 4,
    tone: "blue",
    cards: [
      {
        id: "1284",
        service: "Генеральная",
        area: "65 м² · 3 комн.",
        when: "Сб 26.04 · 10:00",
        addr: "Тверская 12",
        flag: "rush",
      },
      {
        id: "1283",
        service: "Стандартная",
        area: "42 м² · 2 комн.",
        when: "Пт 25.04 · 16:00",
        addr: "Арбат 38",
      },
    ],
  },
  {
    key: "assigned",
    title: "Назначен",
    count: 3,
    tone: "violet",
    cards: [
      {
        id: "1282",
        service: "Генеральная",
        area: "85 м² · 4 комн.",
        when: "Сб 26.04 · 14:00",
        addr: "Маросейка 9",
        master: { name: "Анна К.", tone: "emerald" },
      },
      {
        id: "1281",
        service: "После ремонта",
        area: "120 м²",
        when: "Вс 27.04 · 09:00",
        addr: "Покровка 22",
        master: { name: "Игорь Р.", tone: "blue" },
        flag: "vip",
      },
    ],
  },
  {
    key: "confirmed",
    title: "Подтверждён",
    count: 2,
    tone: "amber",
    cards: [
      {
        id: "1278",
        service: "Стандартная",
        area: "55 м² · 2 комн.",
        when: "Пт 25.04 · 11:00",
        addr: "Никитская 5",
        master: { name: "Мария Д.", tone: "amber" },
      },
    ],
  },
  {
    key: "in_progress",
    title: "В работе",
    count: 1,
    tone: "cyan",
    cards: [
      {
        id: "1277",
        service: "Генеральная",
        area: "72 м² · 3 комн.",
        when: "Идёт · 09:30",
        addr: "Пятницкая 18",
        master: { name: "Анна К.", tone: "emerald" },
      },
    ],
  },
  {
    key: "done",
    title: "Выполнен",
    count: 8,
    tone: "emerald",
    cards: [
      {
        id: "1276",
        service: "Стандартная",
        area: "38 м² · 1 комн.",
        when: "Сегодня · 08:00",
        addr: "Лесная 7",
        master: { name: "Игорь Р.", tone: "blue" },
      },
      {
        id: "1275",
        service: "Генеральная",
        area: "60 м² · 2 комн.",
        when: "Вчера · 19:00",
        addr: "Зубовский 3",
        master: { name: "Мария Д.", tone: "amber" },
      },
    ],
  },
];

export function KanbanMockup() {
  return (
    <div className="rounded-3xl border bg-white shadow-[0_40px_120px_-30px_rgba(15,23,42,0.30)] overflow-hidden">
      <BrowserChrome />

      <div className="grid grid-cols-[200px_1fr]">
        <Sidebar />
        <div className="bg-[var(--color-bg)]">
          <Toolbar />
          <Board />
        </div>
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
        cleanops.app/orders
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="bg-[var(--color-surface-2)]/60 border-r flex flex-col">
      <div className="p-3.5 border-b flex items-center gap-2">
        <div className="size-7 grid place-items-center rounded-lg bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] text-white shadow-[0_6px_16px_-6px_rgba(16,185,129,0.55)]">
          <Sparkles className="size-3.5" />
        </div>
        <div className="text-sm font-bold">CleanOps</div>
      </div>
      <nav className="flex-1 p-2 space-y-0.5 text-[12px]">
        <SideLink label="Дашборд" />
        <SideLink label="Заказы" badge="14" active />
        <SideLink label="Мастера" />
        <SideLink label="Клиенты" />
        <SideLink label="Услуги" />
        <SideLink label="Аналитика" />
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
  );
}

function SideLink({
  label,
  active,
  badge,
}: {
  label: string;
  active?: boolean;
  badge?: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md ${
        active
          ? "bg-white text-[var(--color-brand-700)] font-semibold shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06)] border border-emerald-100"
          : "text-[var(--color-text)]/65"
      }`}
    >
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">
          {badge}
        </span>
      )}
    </div>
  );
}

function Toolbar() {
  return (
    <div className="px-5 py-3 border-b bg-white flex items-center gap-3">
      <div>
        <div className="text-[15px] font-bold tracking-tight">Заказы</div>
        <div className="text-[10.5px] text-[var(--color-text-muted)]">
          18 активных · 8 завершено сегодня
        </div>
      </div>
      <div className="flex-1 max-w-xs ml-4">
        <div className="h-7 rounded-md bg-[var(--color-surface-2)] border flex items-center gap-2 px-2">
          <Search className="size-3 text-[var(--color-text-muted)]" />
          <span className="text-[11px] text-[var(--color-text-muted)]">
            Поиск по адресу, мастеру…
          </span>
        </div>
      </div>
      <ToolbarButton>
        <Filter className="size-3" /> Фильтры
      </ToolbarButton>
      <ToolbarButton primary>
        <Plus className="size-3" /> Новый заказ
      </ToolbarButton>
    </div>
  );
}

function ToolbarButton({
  children,
  primary,
}: {
  children: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <button
      className={`h-7 px-2.5 rounded-md inline-flex items-center gap-1 text-[11px] font-semibold ${
        primary
          ? "bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] text-white shadow-[0_6px_16px_-6px_rgba(16,185,129,0.6)]"
          : "border bg-white text-[var(--color-text-muted)]"
      }`}
    >
      {children}
    </button>
  );
}

function Board() {
  return (
    <div className="p-3 grid grid-cols-5 gap-2.5 h-[420px] overflow-hidden">
      {COLUMNS.map((col) => (
        <BoardColumn key={col.key} column={col} />
      ))}
    </div>
  );
}

const COL_TONES: Record<string, { dot: string; chip: string }> = {
  blue:    { dot: "bg-blue-500",    chip: "bg-blue-100 text-blue-700" },
  violet:  { dot: "bg-violet-500",  chip: "bg-violet-100 text-violet-700" },
  amber:   { dot: "bg-amber-500",   chip: "bg-amber-100 text-amber-700" },
  cyan:    { dot: "bg-cyan-500",    chip: "bg-cyan-100 text-cyan-700" },
  emerald: { dot: "bg-emerald-500", chip: "bg-emerald-100 text-emerald-700" },
};

function BoardColumn({ column }: { column: Column }) {
  const tone = COL_TONES[column.tone];
  return (
    <div className="flex flex-col min-w-0">
      <div className="flex items-center justify-between px-1.5 mb-2">
        <div className="flex items-center gap-1.5">
          <span className={`size-1.5 rounded-full ${tone.dot}`} />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
            {column.title}
          </span>
          <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded ${tone.chip}`}>
            {column.count}
          </span>
        </div>
        <MoreHorizontal className="size-3 text-[var(--color-text-subtle)]" />
      </div>
      <div className="flex-1 space-y-1.5 overflow-hidden">
        {column.cards.map((card, i) => (
          <KanbanCard key={card.id} card={card} highlight={column.key === "new" && i === 0} />
        ))}
        {column.cards.length === 0 && (
          <div className="rounded-lg border border-dashed bg-white/40 h-16 grid place-items-center text-[10px] text-[var(--color-text-subtle)]">
            пусто
          </div>
        )}
      </div>
    </div>
  );
}

const MASTER_TONES: Record<string, string> = {
  emerald: "from-emerald-300 to-emerald-500",
  blue:    "from-blue-300 to-blue-500",
  amber:   "from-amber-300 to-amber-500",
  rose:    "from-rose-300 to-rose-500",
};

function KanbanCard({ card, highlight }: { card: Card; highlight?: boolean }) {
  return (
    <div
      className={`rounded-xl border bg-white p-2.5 group transition-all ${
        highlight
          ? "border-emerald-300 shadow-[0_10px_24px_-12px_rgba(16,185,129,0.45)]"
          : "border-zinc-200/80 shadow-[0_2px_8px_-3px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_18px_-8px_rgba(15,23,42,0.12)]"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9.5px] font-mono text-[var(--color-text-subtle)]">
          #{card.id}
        </span>
        {card.flag === "rush" && (
          <span className="text-[8.5px] font-bold uppercase tracking-wider rounded px-1.5 py-px bg-rose-50 text-rose-600 border border-rose-200">
            срочно
          </span>
        )}
        {card.flag === "vip" && (
          <span className="text-[8.5px] font-bold uppercase tracking-wider rounded px-1.5 py-px bg-amber-50 text-amber-700 border border-amber-200">
            vip
          </span>
        )}
      </div>
      <div className="text-[12px] font-bold tracking-tight leading-tight">
        {card.service}
      </div>
      <div className="text-[10.5px] text-[var(--color-text-muted)] mt-0.5">
        {card.area}
      </div>
      <div className="mt-2 space-y-0.5">
        <div className="flex items-center gap-1 text-[10.5px] text-[var(--color-text-muted)]">
          <Clock className="size-2.5" />
          {card.when}
        </div>
        <div className="flex items-center gap-1 text-[10.5px] text-[var(--color-text-muted)] truncate">
          <MapPin className="size-2.5 shrink-0" />
          {card.addr}
        </div>
      </div>
      {card.master && (
        <div className="mt-2 pt-2 border-t border-dashed flex items-center gap-1.5">
          <div
            className={`size-4 rounded-full bg-gradient-to-br ${MASTER_TONES[card.master.tone]}`}
          />
          <span className="text-[10.5px] font-semibold">{card.master.name}</span>
        </div>
      )}
    </div>
  );
}
