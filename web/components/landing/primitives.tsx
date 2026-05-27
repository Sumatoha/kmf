import { Leaf } from "lucide-react";
import { cn } from "@/lib/cn";

export function Logo({ size = 22, className = "" }: { size?: number; className?: string }) {
  const inner = Math.round(size * 0.6);
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className="inline-grid place-items-center rounded-lg"
        style={{
          width: size + 6,
          height: size + 6,
          background: "var(--color-leaf)",
          color: "var(--color-lime)",
        }}
      >
        <Leaf size={inner} strokeWidth={2.2} />
      </span>
      <span
        className="font-semibold tracking-tight"
        style={{ fontSize: size, color: "var(--color-ink)" }}
      >
        CleanOps
      </span>
    </span>
  );
}

export function StatusDot({
  kind = "ok",
  pulse,
}: {
  kind?: "live" | "ok" | "warn" | "err";
  pulse?: boolean;
}) {
  const color =
    kind === "live"
      ? "var(--color-lime-deep)"
      : kind === "ok"
      ? "var(--color-ok)"
      : kind === "warn"
      ? "var(--color-warn)"
      : "var(--color-err)";
  return (
    <span
      className="inline-block size-1.5 rounded-full"
      style={{
        background: color,
        animation: pulse ? "var(--animate-pulse-slow)" : undefined,
      }}
    />
  );
}

export function Pill({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "default" | "leaf" | "lime" | "tomato" | "amber" | "outline";
  className?: string;
}) {
  const cls =
    variant === "leaf"
      ? "pill pill-leaf"
      : variant === "lime"
      ? "pill pill-lime"
      : variant === "tomato"
      ? "pill pill-tomato"
      : variant === "amber"
      ? "pill pill-amber"
      : "pill";
  return <span className={cn(cls, className)}>{children}</span>;
}

const AVATAR_TONES: Record<string, string> = {
  leaf: "linear-gradient(135deg, #1F7A5C, #134E3A)",
  moss: "linear-gradient(135deg, #4FB594, #1F7A5C)",
  mint: "linear-gradient(135deg, #7BE5BB, #2BAA82)",
  amber: "linear-gradient(135deg, #F4B53D, #C8841A)",
  sky: "linear-gradient(135deg, #BEE4FF, #7FB3DB)",
  tomato: "linear-gradient(135deg, #F2876A, #E5552B)",
  sage: "linear-gradient(135deg, #C4E5D5, #8FB89F)",
  ink: "linear-gradient(135deg, #2A3D33, #0E1A14)",
};

export function Avatar({
  name,
  tone = "leaf",
  size = 28,
}: {
  name: string;
  tone?: keyof typeof AVATAR_TONES;
  size?: number;
}) {
  const initials = name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const onLight = tone === "mint" || tone === "sage" || tone === "sky";
  return (
    <span
      className="inline-grid place-items-center rounded-full font-bold tracking-tight shrink-0"
      style={{
        width: size,
        height: size,
        background: AVATAR_TONES[tone],
        fontSize: size * 0.38,
        color: onLight ? "var(--color-leaf-deep)" : "white",
      }}
    >
      {initials}
    </span>
  );
}

export function AvatarStack({
  people,
  size = 22,
  max = 4,
}: {
  people: { name: string; tone?: keyof typeof AVATAR_TONES }[];
  size?: number;
  max?: number;
}) {
  const visible = people.slice(0, max);
  const overflow = people.length - visible.length;
  return (
    <span className="inline-flex items-center">
      {visible.map((p, i) => (
        <span
          key={i}
          style={{
            marginLeft: i === 0 ? 0 : -size * 0.3,
            boxShadow: "0 0 0 2px var(--color-surface)",
            borderRadius: "9999px",
          }}
        >
          <Avatar name={p.name} tone={p.tone || "leaf"} size={size} />
        </span>
      ))}
      {overflow > 0 && (
        <span
          className="inline-grid place-items-center rounded-full text-[10px] font-bold"
          style={{
            width: size,
            height: size,
            background: "var(--color-surface-2)",
            color: "var(--color-muted)",
            marginLeft: -size * 0.3,
            boxShadow: "0 0 0 2px var(--color-surface)",
          }}
        >
          +{overflow}
        </span>
      )}
    </span>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  sub,
  align = "left",
  className = "",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn(align === "center" && "text-center mx-auto max-w-2xl", className)}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className="mt-5 section-title">{title}</h2>
      {sub && (
        <p className="mt-5 text-lg text-[color:var(--color-muted)] leading-relaxed max-w-xl">
          {sub}
        </p>
      )}
    </div>
  );
}

export const TEAM = [
  { name: "Анна К.", tone: "leaf" as const },
  { name: "Светлана О.", tone: "moss" as const },
  { name: "Марина П.", tone: "amber" as const },
  { name: "Дмитрий Р.", tone: "sky" as const },
  { name: "Елена Т.", tone: "tomato" as const },
  { name: "Игорь В.", tone: "ink" as const },
  { name: "Юлия Н.", tone: "sage" as const },
  { name: "Олег М.", tone: "moss" as const },
];
