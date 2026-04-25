import { Bot, Send } from "lucide-react";

export function BotPreview() {
  return (
    <section id="bots" className="py-24 sm:py-32 bg-gradient-to-b from-[var(--color-brand-50)]/40 via-white to-[var(--color-brand-50)]/40">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-block text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-700)]">
            Telegram-боты
          </div>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            Два бота, заточенных под{" "}
            <span className="gradient-text">свою роль</span>
          </h2>
          <p className="mt-4 text-lg text-[var(--color-text-muted)]">
            Клиент не разберётся в интерфейсе мастера — и наоборот. Каждому — своё.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Client bot */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs font-semibold">
              <span className="size-2 rounded-full bg-blue-500" />
              Бот для клиента
            </div>
            <h3 className="mt-3 text-2xl font-bold tracking-tight">@CleanOpsBookingBot</h3>
            <p className="mt-2 text-[var(--color-text-muted)]">
              Запись за 4 шага: услуга → дата → адрес → подтверждение. После — пуш о подтверждении и фото мастера.
            </p>
            <div className="mt-6">
              <Phone>
                <ChatHeader name="CleanOpsBookingBot" subtitle="bot" />
                <ChatBody>
                  <BotBubble>
                    Добро пожаловать в <b>BlueSparkle Cleaning</b>! Что нужно убрать?
                  </BotBubble>
                  <BotChips items={["Стандартная — 3 500 ₽", "Генеральная — 7 500 ₽", "После ремонта — 12 000 ₽"]} highlight={1} />
                  <UserBubble>Генеральная</UserBubble>
                  <BotBubble>Когда удобно?</BotBubble>
                  <BotChips items={["Сегодня", "Завтра", "Сб 26.04"]} highlight={2} />
                  <UserBubble>Сб 26.04 в 10:00</UserBubble>
                  <BotBubble>Адрес уборки?</BotBubble>
                  <UserBubble>Москва, ул. Тверская 12, кв 45</UserBubble>
                  <ConfirmCard
                    title="Генеральная уборка"
                    when="Сб 26.04 в 10:00"
                    addr="Тверская 12, кв 45"
                    price="7 500 ₽"
                  />
                </ChatBody>
                <ChatInput />
              </Phone>
            </div>
          </div>

          {/* Master bot */}
          <div className="lg:mt-24">
            <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs font-semibold">
              <span className="size-2 rounded-full bg-emerald-500" />
              Бот для мастера
            </div>
            <h3 className="mt-3 text-2xl font-bold tracking-tight">@CleanOpsMasterBot</h3>
            <p className="mt-2 text-[var(--color-text-muted)]">
              Новые заказы прилетают как пуши с кнопками «Взять / Пропустить». Один тап — заказ ваш.
            </p>
            <div className="mt-6">
              <Phone>
                <ChatHeader name="CleanOpsMasterBot" subtitle="bot" tone="emerald" />
                <ChatBody>
                  <BotBubble tone="emerald">
                    Добро пожаловать, <b>Анна!</b>
                    <br />
                    Вы активированы как мастер.
                  </BotBubble>
                  <NotificationCard
                    title="🆕 Новый заказ!"
                    rows={[
                      ["Услуга", "Генеральная уборка"],
                      ["Когда", "Сб 26.04, 10:00"],
                      ["Адрес", "Тверская 12, кв 45"],
                      ["Оплата", "7 500 ₽"],
                    ]}
                  />
                  <UserBubble>✅ Взять</UserBubble>
                  <BotBubble tone="emerald">
                    Заказ принят. Удачной работы! Клиент уже получил подтверждение.
                  </BotBubble>
                  <BotBubble tone="emerald">
                    🚿 После начала уборки нажмите <b>Начать</b>, после окончания — <b>Завершить</b>.
                  </BotBubble>
                </ChatBody>
                <ChatInput />
              </Phone>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Phone ------------------------------------ */

function Phone({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto max-w-[360px]">
      <div
        aria-hidden
        className="absolute -inset-4 bg-gradient-to-br from-emerald-200/50 to-cyan-200/40 blur-2xl rounded-[3rem]"
      />
      <div className="relative rounded-[2.5rem] border-[10px] border-zinc-900 bg-zinc-900 shadow-2xl">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 h-5 w-28 rounded-b-2xl bg-zinc-900 z-10" />
        <div className="rounded-[2rem] overflow-hidden bg-[#e6ecf3]">{children}</div>
      </div>
    </div>
  );
}

function ChatHeader({
  name,
  subtitle,
  tone = "blue",
}: {
  name: string;
  subtitle: string;
  tone?: "blue" | "emerald";
}) {
  const dot = tone === "emerald" ? "bg-emerald-500" : "bg-blue-500";
  return (
    <div className="px-4 pt-8 pb-3 bg-white border-b flex items-center gap-3">
      <div className={`size-9 rounded-full ${dot} grid place-items-center text-white`}>
        <Bot className="size-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold leading-tight truncate">{name}</div>
        <div className="text-[11px] text-[var(--color-text-muted)] leading-tight">{subtitle}</div>
      </div>
    </div>
  );
}

function ChatBody({ children }: { children: React.ReactNode }) {
  return <div className="p-3 space-y-1.5 h-[440px] overflow-hidden">{children}</div>;
}

function ChatInput() {
  return (
    <div className="px-3 py-2 border-t bg-white flex items-center gap-2">
      <div className="flex-1 h-9 rounded-full bg-[var(--color-surface-2)] border px-3 text-xs text-[var(--color-text-muted)] grid place-items-start content-center">
        Сообщение
      </div>
      <div className="size-9 rounded-full bg-blue-500 grid place-items-center text-white">
        <Send className="size-3.5" />
      </div>
    </div>
  );
}

function BotBubble({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "emerald" }) {
  const cls = tone === "emerald" ? "bg-emerald-50 border-emerald-200" : "bg-white";
  return (
    <div className="flex">
      <div className={`max-w-[78%] rounded-2xl rounded-tl-sm border ${cls} px-3 py-2 text-[12.5px] leading-snug`}>
        {children}
      </div>
    </div>
  );
}

function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[78%] rounded-2xl rounded-tr-sm bg-blue-500 text-white px-3 py-2 text-[12.5px] leading-snug">
        {children}
      </div>
    </div>
  );
}

function BotChips({ items, highlight }: { items: string[]; highlight?: number }) {
  return (
    <div className="flex flex-wrap gap-1.5 pl-1">
      {items.map((it, i) => (
        <div
          key={it}
          className={`text-[11px] px-2.5 py-1 rounded-full border ${
            i === highlight
              ? "bg-blue-50 border-blue-300 text-blue-700"
              : "bg-white border-zinc-200 text-zinc-700"
          }`}
        >
          {it}
        </div>
      ))}
    </div>
  );
}

function ConfirmCard({
  title,
  when,
  addr,
  price,
}: {
  title: string;
  when: string;
  addr: string;
  price: string;
}) {
  return (
    <div className="flex">
      <div className="max-w-[88%] rounded-2xl rounded-tl-sm border bg-white p-3 text-[12.5px] leading-snug">
        <div className="font-semibold">Подтвердите заказ:</div>
        <div className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
          <span className="text-[var(--color-text-muted)]">Услуга:</span>
          <span>{title}</span>
          <span className="text-[var(--color-text-muted)]">Когда:</span>
          <span>{when}</span>
          <span className="text-[var(--color-text-muted)]">Адрес:</span>
          <span>{addr}</span>
          <span className="text-[var(--color-text-muted)]">Стоимость:</span>
          <span className="font-semibold">{price}</span>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <button className="h-7 rounded-md bg-emerald-500 text-white text-[11px] font-medium">
            ✅ Подтвердить
          </button>
          <button className="h-7 rounded-md bg-zinc-100 text-zinc-700 text-[11px]">❌ Отмена</button>
        </div>
      </div>
    </div>
  );
}

function NotificationCard({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div className="flex">
      <div className="max-w-[88%] rounded-2xl rounded-tl-sm border-2 border-emerald-300 bg-white p-3 text-[12.5px] leading-snug shadow-md">
        <div className="font-bold text-emerald-700">{title}</div>
        <div className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <span className="text-[var(--color-text-muted)]">{k}:</span>
              <span>{v}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <button className="h-7 rounded-md bg-emerald-500 text-white text-[11px] font-medium">
            ✅ Взять
          </button>
          <button className="h-7 rounded-md bg-zinc-100 text-zinc-700 text-[11px]">⏭ Пропустить</button>
        </div>
      </div>
    </div>
  );
}
