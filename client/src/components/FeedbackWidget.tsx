import { useState, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"bug" | "suggestion">("bug");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  // Ouvre le widget automatiquement si ?feedback=1 dans l'URL
  // (utilisé par les liens depuis l'email et le PDF)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("feedback") === "1") {
      setIsOpen(true);
    }
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
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 z-[9998] bg-black text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-all hover:scale-105"
          aria-label="Donner un retour"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-[9998] w-80 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
            <span className="text-sm font-semibold text-gray-800">Retour beta</span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {sent ? (
            <div className="p-6 text-center">
              <div className="text-2xl mb-2">Merci !</div>
              <p className="text-sm text-gray-500">Votre retour a ete envoye.</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {/* Type toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setType("bug")}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                    type === "bug"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  Probleme
                </button>
                <button
                  onClick={() => setType("suggestion")}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                    type === "suggestion"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  Suggestion
                </button>
              </div>

              {/* Message */}
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  type === "bug"
                    ? "Decrivez le probleme rencontre..."
                    : "Votre idee ou suggestion..."
                }
                className="w-full h-24 text-sm border border-gray-200 rounded-lg p-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-black"
              />

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!message.trim() || sending}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-white bg-black rounded-full hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                {sending ? "Envoi..." : "Envoyer"}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
