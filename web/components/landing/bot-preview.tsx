"use client";

import {
  Bell,
  Check,
  ChevronLeft,
  Leaf,
  Mic,
  MoreVertical,
  Paperclip,
  Sun,
  ThumbsUp,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { SectionTitle } from "./primitives";
import { Reveal, StaggerContainer, StaggerItem, slideInLeft, slideInRight } from "./motion";

export function BotPreview() {
  return (
    <section
      id="telegram"
      className="relative py-24 sm:py-32 overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, var(--color-surface-2) 0%, var(--color-bg) 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <Reveal variants={slideInLeft}>
            <div>
              <SectionTitle
                eyebrow="Telegram-боты"
                title={
                  <>
                    Без приложений.
                    <br />
                    <span className="gradient-text">
                      Только Telegram.
                    </span>
                  </>
                }
                sub="Ваши клиенты и мастера уже в Telegram. CleanOps превращает его в полноценное рабочее место — без скачиваний и паролей."
              />

              <div className="mt-9 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <BotFeatureCol
                  accent="mint"
                  title="Бот для клиента"
                  items={[
                    "Бронирование за 4 шага",
                    "Выбор услуги, даты и адреса",
                    "Уведомления о статусе заказа",
                    "Оценка мастера после уборки",
                    "Напоминания о визите",
                  ]}
                />
                <BotFeatureCol
                  accent="leaf"
                  title="Бот для мастера"
                  items={[
                    "Push о новом заказе",
                    "Кнопки «Взять / Пропустить»",
                    "«Выехал» и «Выполнил» одним тапом",
                    "Список своих заказов на день",
                    "История и заработок за период",
                  ]}
                />
              </div>
            </div>
          </Reveal>

          <Reveal variants={slideInRight}>
            <div className="relative h-[580px] sm:h-[600px]">
              <BotPhone variant="client" rotation={-3} positionStyle="left-2 sm:left-5 top-3" delay={0} />
              <BotPhone variant="cleaner" rotation={3} positionStyle="right-2 sm:right-5 bottom-3 z-10" delay={0.15} />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function BotFeatureCol({
  title,
  items,
  accent,
}: {
  title: string;
  items: string[];
  accent: "mint" | "leaf";
}) {
  const dotColor = accent === "mint" ? "var(--color-mint-deep)" : "var(--color-leaf)";
  return (
    <div>
      <div
        className="text-[13px] font-bold mb-3 tracking-tight inline-flex items-center gap-2"
        style={{ color: "var(--color-leaf)" }}
      >
        <span className="size-2.5 rounded-full" style={{ background: dotColor }} />
        {title}
      </div>
      <StaggerContainer className="flex flex-col gap-2" staggerDelay={0.06}>
        {items.map((x) => (
          <StaggerItem key={x}>
            <div className="flex gap-2 text-[14px] text-[color:var(--color-ink-2)]">
              <Check
                className="size-4 shrink-0 mt-0.5"
                style={{ color: "var(--color-moss)" }}
                strokeWidth={2.5}
              />
              <span>{x}</span>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  );
}

function BotPhone({
  variant,
  rotation,
  positionStyle,
  delay,
}: {
  variant: "client" | "cleaner";
  rotation: number;
  positionStyle: string;
  delay: number;
}) {
  return (
    <motion.div
      className={`absolute w-[290px] h-[540px] bg-white rounded-[36px] overflow-hidden shadow-[var(--shadow-xl)] ${positionStyle}`}
      style={{
        border: "8px solid #1a1a1a",
        transform: `rotate(${rotation}deg)`,
      }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, rotate: rotation * 0.5 }}
    >
      <ChatHeader
        title={variant === "client" ? "CleanOps клиенту" : "CleanOps команде"}
        sub={variant === "client" ? "Готов помочь" : "Анна К. · смена идёт"}
      />
      <div
        className="px-3 py-3.5 overflow-hidden"
        style={{ background: "#E6EBEE", height: "calc(100% - 116px)" }}
      >
        {variant === "client" ? <ClientChat /> : <CleanerChat />}
      </div>
      <ChatInput />
    </motion.div>
  );
}

function ChatHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="px-3.5 pt-3.5 pb-2.5 flex items-center gap-2.5 text-white" style={{ background: "#5288c1" }}>
      <ChevronLeft className="size-4" />
      <div className="size-8 rounded-full grid place-items-center" style={{ background: "var(--color-leaf)", color: "var(--color-lime)" }}>
        <Leaf className="size-4" strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold leading-tight truncate">{title}</div>
        <div className="text-[10.5px] opacity-85 leading-tight">{sub}</div>
      </div>
      <MoreVertical className="size-3.5 opacity-90" />
    </div>
  );
}

function ChatInput() {
  return (
    <div className="absolute left-0 right-0 bottom-0 bg-white px-2.5 py-2 flex items-center gap-2 border-t" style={{ borderColor: "#DDD" }}>
      <Paperclip className="size-4" style={{ color: "#999" }} />
      <div className="flex-1 h-7 rounded-full px-3 text-[11px] flex items-center" style={{ background: "#F4F4F4", color: "#999" }}>
        Сообщение
      </div>
      <Mic className="size-4" style={{ color: "#999" }} />
    </div>
  );
}

function ClientChat() {
  return (
    <>
      <BotMsg>Здравствуйте, Алексей! Какую уборку нужно?</BotMsg>
      <BotMsg><ChatChips items={["Стандартная", "Генеральная", "После ремонта"]} /></BotMsg>
      <UserMsg chip>Генеральная</UserMsg>
      <BotMsg>Когда удобно?</BotMsg>
      <BotMsg><ChatChips items={["Завтра", "Сб 26.04", "Вс 27.04"]} /></BotMsg>
      <UserMsg chip>Сб 26.04 · 10:00</UserMsg>
      <BotMsg>Адрес?</BotMsg>
      <UserMsg>Алматы, Достык 38, кв 412</UserMsg>
      <BotMsg>
        Спасибо! Подтверждаете заказ?
        <ConfirmCard />
      </BotMsg>
    </>
  );
}

function ChatChips({ items }: { items: string[] }) {
  return (
    <div className="flex gap-1 mt-1.5 flex-wrap">
      {items.map((c) => (
        <span key={c} className="text-[10.5px] font-medium px-2 py-1 rounded-full" style={{ background: "#F0F4ED", color: "var(--color-leaf)" }}>
          {c}
        </span>
      ))}
    </div>
  );
}

function ConfirmCard() {
  return (
    <div className="mt-1.5 p-2 rounded-lg text-[10.5px] flex flex-col gap-1" style={{ background: "var(--color-leaf)", color: "var(--color-mint)" }}>
      <div className="font-semibold">Генеральная · 24 000 ₸</div>
      <div className="opacity-70">Сб 26.04 · 10:00 · Достык 38</div>
      <div className="mt-1 grid grid-cols-2 gap-1">
        <span className="inline-flex items-center justify-center gap-1 font-semibold py-1 rounded-md" style={{ background: "var(--color-mint)", color: "var(--color-leaf-deep)" }}>
          <Check className="size-3" strokeWidth={3} />Подтвердить
        </span>
        <span className="inline-flex items-center justify-center gap-1 py-1 rounded-md" style={{ background: "rgba(255,255,255,0.06)" }}>
          <X className="size-3" strokeWidth={3} />Отмена
        </span>
      </div>
    </div>
  );
}

function CleanerChat() {
  return (
    <>
      <BotMsg>
        <Sun className="inline size-3.5 mr-1 -mt-0.5" style={{ color: "var(--color-amber)" }} />
        Доброе утро, Анна!
      </BotMsg>
      <BotMsg>
        <Bell className="inline size-3.5 mr-1 -mt-0.5" style={{ color: "var(--color-mint-deep)" }} />
        Новый заказ
        <OrderOfferCard />
      </BotMsg>
      <UserMsg chip>Беру</UserMsg>
      <BotMsg>Заказ ваш. Клиенту отправлено подтверждение.</BotMsg>
      <BotMsg>
        Когда выедете — нажмите <b>Выехал</b>, после уборки — <b>Выполнил</b>.
      </BotMsg>
      <UserMsg chip>Выехал</UserMsg>
      <BotMsg>
        <ThumbsUp className="inline size-3.5 mr-1 -mt-0.5" style={{ color: "var(--color-mint-deep)" }} />
        Принято. Удачной работы!
      </BotMsg>
    </>
  );
}

function OrderOfferCard() {
  return (
    <div className="mt-1.5 p-2 rounded-lg text-[11px] border" style={{ background: "white", borderColor: "var(--color-mint-deep)" }}>
      <div className="font-bold" style={{ color: "var(--color-mint-deep)" }}>Генеральная · 24 000 ₸</div>
      <div className="mt-1 grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-[10.5px]" style={{ color: "var(--color-ink-2)" }}>
        <span style={{ color: "var(--color-muted)" }}>Когда:</span><span>Сб 26.04 · 10:00</span>
        <span style={{ color: "var(--color-muted)" }}>Адрес:</span><span>Достык 38, кв 412</span>
        <span style={{ color: "var(--color-muted)" }}>Площадь:</span><span>65 м² · 3 комн.</span>
      </div>
      <div className="mt-1.5 grid grid-cols-2 gap-1">
        <span className="inline-flex items-center justify-center gap-1 font-semibold py-1 rounded-md text-white" style={{ background: "var(--color-mint-deep)" }}>
          <Check className="size-3" strokeWidth={3} />Взять
        </span>
        <span className="text-center py-1 rounded-md" style={{ background: "var(--color-surface-2)" }}>Пропустить</span>
      </div>
    </div>
  );
}

function BotMsg({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex mb-2.5">
      <div className="max-w-[82%] rounded-xl rounded-bl-[4px] px-2.5 py-2 text-[12px] leading-snug" style={{ background: "white", color: "#0E1A14", boxShadow: "0 1px 1px rgba(0,0,0,0.06)" }}>
        {children}
      </div>
    </div>
  );
}

function UserMsg({ children, chip }: { children: React.ReactNode; chip?: boolean }) {
  return (
    <div className="flex justify-end mb-2.5">
      <div className="max-w-[82%] rounded-xl rounded-br-[4px] px-2.5 py-2 text-[12px] leading-snug font-medium" style={{ background: "#D6F2E5", color: "#0E1A14", boxShadow: "0 1px 1px rgba(0,0,0,0.06)" }}>
        {chip && <Check className="inline size-3 mr-1" strokeWidth={3} />}
        {children}
      </div>
    </div>
  );
}
