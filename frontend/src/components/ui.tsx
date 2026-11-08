import type { ReactNode } from "react";

type Tone = "live" | "violet" | "off";
const toneCls: Record<Tone, string> = {
  live: "bg-live",
  violet: "bg-violet",
  off: "bg-smoke",
};

export const Dot = ({ tone = "off" }: { tone?: Tone }) => (
  <span className={`h-2 w-2 flex-none rounded-full ${toneCls[tone]}`} />
);

export function State({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium leading-none sm:gap-2 sm:text-[13px] ${tone === "off" ? "text-smoke" : "text-white"}`}
    >
      <Dot tone={tone} />
      {children}
    </span>
  );
}

export function Seg<T extends string | number>({
  options,
  value,
  onChange,
  disabled,
}: {
  options: { value: T; label: string }[];
  value: T | null;
  onChange?: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <div
      role="radiogroup"
      className="inline-flex rounded-full bg-carbon p-1 shadow-hair"
    >
      {options.map((o) => (
        <button
          key={String(o.value)}
          role="radio"
          aria-checked={o.value === value}
          disabled={disabled}
          onClick={() => onChange?.(o.value)}
          className={`rounded-full px-3.5 py-2 text-[13px] font-medium leading-[1.2] transition-colors disabled:cursor-not-allowed disabled:opacity-60 sm:px-[22px] sm:py-2.5 sm:text-sm ${
            o.value === value
              ? "bg-white text-black"
              : "text-cloud hover:text-white"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export const Logo = () => (
  <span className="flex items-center gap-2.5 whitespace-nowrap text-[15px] text-[15px] font-medium leading-none text-white">
    <svg
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      stroke="#fff"
      strokeWidth="1.6"
      aria-hidden
    >
      <circle cx="13" cy="13" r="11.2" />
      <circle cx="13" cy="13" r="6.2" />
      <circle cx="13" cy="13" r="1.4" fill="#fff" />
    </svg>
    Smart Shoe Dryer
  </span>
);

export const PageHead = ({
  badge,
  title,
  sub,
}: {
  badge?: ReactNode;
  title: string;
  sub?: string;
}) => (
  <div className="pb-8 pt-11">
    {badge}
    <h1
      className={`text-[34px] font-light leading-[1.2] tracking-[-0.007em] text-white sm:text-5xl ${badge ? "mt-[18px]" : ""}`}
    >
      {title}
    </h1>
    {sub && <p className="mt-2.5 max-w-[60ch] text-base text-cloud">{sub}</p>}
  </div>
);
