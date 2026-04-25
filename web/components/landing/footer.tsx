import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <div className="size-8 grid place-items-center rounded-lg bg-[var(--color-brand-600)] text-white">
                <Sparkles className="size-4" />
              </div>
              <span className="font-bold tracking-tight">CleanOps</span>
            </div>
            <p className="mt-3 text-sm text-[var(--color-text-muted)] max-w-xs">
              Современная CRM и Telegram-боты для клининговых компаний. Сделано с любовью к чистоте.
            </p>
          </div>

          <FooterCol
            title="Продукт"
            items={[
              { label: "Возможности", href: "#features" },
              { label: "Боты", href: "#bots" },
              { label: "Тарифы", href: "#pricing" },
              { label: "Войти", href: "/login" },
            ]}
          />

          <FooterCol
            title="Компания"
            items={[
              { label: "Контакты", href: "mailto:hello@cleanops.app" },
              { label: "Telegram", href: "#" },
              { label: "Политика", href: "#" },
              { label: "Оферта", href: "#" },
            ]}
          />
        </div>

        <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--color-text-muted)]">
          <div>© {new Date().getFullYear()} CleanOps. Все права защищены.</div>
          <div>Сделано в РФ</div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  items,
}: {
  title: string;
  items: { label: string; href: string }[];
}) {
  return (
    <div>
      <div className="text-sm font-semibold">{title}</div>
      <ul className="mt-3 space-y-2">
        {items.map((it) => (
          <li key={it.label}>
            <a
              href={it.href}
              className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              {it.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
