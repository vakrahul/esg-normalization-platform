import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const styles: Record<Variant, string> = {
  primary: "bg-brand-950 text-white hover:bg-brand-800",
  secondary: "bg-white text-brand-950 border border-slate-200 hover:border-blue-300",
  ghost: "text-brand-800 hover:bg-blue-50",
};

export default function PillButton({
  variant = "primary",
  className = "",
  children,
  ...props
}: Props) {
  return (
    <button
      className={`rounded-full px-6 py-2.5 text-sm font-medium transition ${styles[variant]} ${className} disabled:opacity-50`}
      {...props}
    >
      {children}
    </button>
  );
}
