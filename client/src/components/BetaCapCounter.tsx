import { useQuery } from "@tanstack/react-query";

export function BetaCapCounter({ className }: { className?: string }) {
  const { data } = useQuery<{ count: number; cap: number; isFull: boolean }>({
    queryKey: ["/api/beta/capacity"],
    refetchInterval: 60_000, // rafraîchissement toutes les 60s
    staleTime: 30_000,
  });

  if (!data) return null;

  const { count, cap, isFull } = data;

  return (
    <div
      className={`inline-flex items-center gap-2 mc-mono text-xs uppercase tracking-widest ${className ?? ""}`}
      style={{ color: isFull ? "var(--mc-danger, #ef4444)" : "var(--mc-primary)" }}
    >
      <span
        style={{
          display: "inline-block",
          width: 8,
          height: 8,
          borderRadius: 999,
          background: isFull ? "var(--mc-danger, #ef4444)" : "var(--mc-primary)",
          animation: isFull ? "none" : "pulse 2s infinite",
        }}
      />
      {isFull
        ? "Beta complète — Rejoindre la liste d'attente"
        : `${count} / ${cap} places`}
    </div>
  );
}
