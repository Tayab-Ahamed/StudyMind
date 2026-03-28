import React from "react";

export function Spinner({ size = "md", className = "" }) {
  const s = { sm: "w-4 h-4 border-2", md: "w-5 h-5 border-2", lg: "w-8 h-8 border-[3px]" }[size];
  return (
    <div className={`${s} rounded-full border-current border-t-transparent animate-spin opacity-70 ${className}`} />
  );
}

export function ThinkingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 150, 300].map((d) => (
        <span key={d} className="thinking-dot" style={{ animationDelay: `${d}ms` }} />
      ))}
    </div>
  );
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6 animate-fade-in">
      <div className="text-5xl mb-4 opacity-30">{icon}</div>
      <p className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>{title}</p>
      {description && <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function SkeletonList({ count = 4, height = "h-16" }) {
  return (
    <div className="space-y-2 p-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`skeleton ${height} rounded-xl`} style={{ animationDelay: `${i * 80}ms` }} />
      ))}
    </div>
  );
}

export function SkeletonText({ lines = 6 }) {
  const widths = ["w-full", "w-5/6", "w-full", "w-4/5", "w-full", "w-3/4"];
  return (
    <div className="space-y-3 animate-fade-in">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`skeleton h-4 rounded-lg ${widths[i % widths.length]}`} />
      ))}
    </div>
  );
}

export function Alert({ type = "error", message, onDismiss }) {
  const styles = {
    error:   "bg-red-500/10 border-red-500/20 text-red-500",
    warning: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
    success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  };
  return (
    <div className={`border rounded-xl px-4 py-3 text-sm flex items-start gap-2 animate-fade-up ${styles[type]}`}>
      <span>{type === "error" ? "⚠️" : type === "success" ? "✓" : "ℹ"}</span>
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="opacity-60 hover:opacity-100 text-base leading-none">×</button>
      )}
    </div>
  );
}
