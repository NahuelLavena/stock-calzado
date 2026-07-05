import type { ReactNode } from "react";

type AlertVariant = "info" | "success" | "warning" | "error";

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<AlertVariant, string> = {
  info: "bg-indigo-50 text-indigo-800 border-indigo-200",
  success: "bg-emerald-50 text-emerald-800 border-emerald-200",
  warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
  error: "bg-rose-50 text-rose-800 border-rose-200",
};

const iconMap: Record<AlertVariant, string> = {
  info: "ℹ️",
  success: "✅",
  warning: "⚠️",
  error: "❌",
};

export function Alert({
  variant = "info",
  title,
  children,
  className = "",
}: AlertProps) {
  return (
    <div
      className={`rounded-md border p-4 ${variantStyles[variant]} ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-sm">{iconMap[variant]}</span>
        <div className="flex-1">
          {title && <h4 className="mb-1 text-sm font-semibold">{title}</h4>}
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
