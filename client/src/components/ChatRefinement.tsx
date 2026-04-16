import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Send, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "assistant" | "user";
  content: string;
}

interface ChatRefinementProps {
  sessionId: string;
  initialCount: number;
  onCountUpdate: (newCount: number) => void;
  onClose: () => void;
}

export function ChatRefinement({ sessionId, initialCount, onCountUpdate, onClose }: ChatRefinementProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hey ! 👋 J'ai trouvé quelques subventions pour toi, mais je peux affiner encore plus si tu veux. Réponds juste à 2-3 questions rapides et on va te dénicher les meilleures aides possibles !",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRematching, setIsRematching] = useState(false);
  const [currentCount, setCurrentCount] = useState(initialCount);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Auto-focus input on mount
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // Simuler le re-matching
      setIsRematching(true);
      
      // Appel API pour affiner
      const response = await fetch(`/api/chat-refine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          userMessage,
          conversationHistory: messages,
        }),
      });

      if (!response.ok) throw new Error("Erreur réseau");

      const data = await response.json();
      
      // Mettre à jour le compteur
      setCurrentCount(data.newCount);
      onCountUpdate(data.newCount);
      setIsRematching(false);

      // Ajouter la réponse de l'assistant
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.assistantMessage },
      ]);
    } catch (error) {
      console.error("Erreur chat:", error);
      setIsRematching(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Oups, un souci technique... Réessaie ?",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl h-[600px] flex flex-col bg-background rounded-lg shadow-2xl border border-border overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-[#EF476F]/10 to-[#118AB2]/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#EF476F] to-[#118AB2] flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Affinage intelligent</h3>
              <p className="text-sm text-muted-foreground">
                {isRematching ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Recherche en cours...
                  </span>
                ) : (
                  <span className="font-bold text-[#06D6A0]">{currentCount} subventions</span>
                )}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            data-testid="button-close-chat"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-[#118AB2] to-[#073B4C] text-white"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-muted rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">En train de réfléchir...</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Animation de re-matching */}
          {isRematching && (
            <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative w-full max-w-md h-32">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ x: 0, opacity: 0.3 }}
                    animate={{
                      x: [0, 100, -100, 0],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                    className="absolute top-0 left-1/2 -translate-x-1/2"
                    style={{ top: `${i * 40}px` }}
                  >
                    <Card className="w-64 h-24 bg-gradient-to-br from-muted to-muted/50 blur-sm" />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-muted/30">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tape ta réponse ici..."
              disabled={isLoading}
              className="flex-1"
              data-testid="input-chat-message"
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              size="icon"
              className="bg-[#06D6A0] hover:bg-[#06D6A0]/90 text-white"
              data-testid="button-send-message"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
