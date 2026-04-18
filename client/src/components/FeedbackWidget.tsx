import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";

type FeedbackType = "suggestion" | "bug";

const PLACEHOLDERS: Record<FeedbackType, string> = {
  suggestion: "Une idée pour améliorer Mecene ? On est à l'écoute.",
  bug: "Décrivez le problème. Page + action qui déclenche le bug si possible.",
};

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<FeedbackType>("suggestion");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  // Ouvre le widget si ?feedback=1 (liens depuis email/PDF)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("feedback") === "1") setIsOpen(true);
  }, []);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await fetch("/api/beta-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          message: message.trim(),
          page: window.location.pathname,
          userAgent: navigator.userAgent,
        }),
      });
      setSent(true);
      setTimeout(() => {
        setIsOpen(false);
        setSent(false);
        setMessage("");
      }, 2000);
    } catch {
      // silently fail — feedback is non-critical
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        aria-label="Donner un retour"
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 pl-4 pr-5 py-3 rounded-full transition-all hover:scale-[1.03]"
        style={{
          background: "var(--mc-primary)",
          color: "var(--mc-bg)",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "12px",
          fontWeight: 600,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          boxShadow: "0 10px 40px rgba(6,214,160,0.35), 0 0 0 1px rgba(6,214,160,0.5)",
        }}
      >
        <MessageSquare className="w-3.5 h-3.5" strokeWidth={2.5} />
        Feedback
      </button>

      {/* Panel */}
      {isOpen && (
        <div
          data-testid="feedback-panel"
          className="fixed bottom-20 right-5 z-[60] w-80 mc-card p-5"
          style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="mc-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: "var(--mc-primary)" }}>
                Beta · vos retours
              </div>
              <div className="font-semibold text-sm" style={{ color: "var(--mc-text)" }}>
                Dites-nous tout.
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-lg leading-none hover:text-white transition"
              style={{ color: "var(--mc-muted)" }}
              aria-label="Fermer"
            >
              ×
            </button>
          </div>

          {sent ? (
            <div className="py-8 text-center">
              <div className="mc-display text-3xl mb-2" style={{ color: "var(--mc-primary)" }}>
                MERCI<span style={{ color: "var(--mc-primary)" }}>.</span>
              </div>
              <p className="text-sm" style={{ color: "var(--mc-muted)" }}>
                Votre retour a été envoyé.
              </p>
            </div>
          ) : (
            <>
              {/* Toggle */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => setType("suggestion")}
                  className="mc-mono text-[10px] uppercase tracking-widest py-2 rounded-full border transition"
                  style={{
                    borderColor: type === "suggestion" ? "var(--mc-primary)" : "var(--mc-border)",
                    background: type === "suggestion" ? "var(--mc-primary-soft)" : "transparent",
                    color: type === "suggestion" ? "var(--mc-primary)" : "var(--mc-muted)",
                  }}
                >
                  Suggestion
                </button>
                <button
                  onClick={() => setType("bug")}
                  className="mc-mono text-[10px] uppercase tracking-widest py-2 rounded-full border transition"
                  style={{
                    borderColor: type === "bug" ? "var(--mc-primary)" : "var(--mc-border)",
                    background: type === "bug" ? "var(--mc-primary-soft)" : "transparent",
                    color: type === "bug" ? "var(--mc-primary)" : "var(--mc-muted)",
                  }}
                >
                  Bug
                </button>
              </div>

              <textarea
                data-testid="feedback-textarea"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={PLACEHOLDERS[type]}
                className="mc-input w-full text-sm rounded-lg px-3 py-2 focus:outline-none"
                style={{
                  background: "var(--mc-bg)",
                  border: "1px solid var(--mc-border)",
                  color: "var(--mc-text)",
                  minHeight: 90,
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--mc-primary)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--mc-border)")}
              />

              <div className="flex items-center justify-between mt-3">
                <div className="mc-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--mc-muted-2)" }}>
                  Anonyme
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={!message.trim() || sending}
                  className="mc-btn-primary px-4 py-2 rounded-full text-xs mc-mono uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? "Envoi…" : "Envoyer"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
