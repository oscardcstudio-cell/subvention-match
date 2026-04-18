import { useEffect, useState } from "react";
import { useStripe, Elements, PaymentElement, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Lock, Loader2, CheckCircle } from "lucide-react";
import { trackPaymentCompleted } from "@/lib/analytics";

// Use lazy initialization to ensure env vars are loaded
let stripePromise: Promise<any> | null = null;

function getStripePromise() {
  if (!stripePromise) {
    if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
      throw new Error("Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY");
    }
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
  }
  return stripePromise;
}

function CheckoutForm({ sessionId }: { sessionId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      toast({
        title: t.paymentError,
        description: error.message,
        variant: "destructive",
      });
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      // Mark session as paid
      await apiRequest("POST", "/api/verify-payment", { sessionId });
      trackPaymentCompleted({ sessionId });

      toast({
        title: t.paymentSuccess,
        description: t.paymentDescription,
      });

      // Redirect to results
      setLocation(`/results?sessionId=${sessionId}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="mc-btn-primary w-full py-3 rounded-lg mc-mono text-sm uppercase tracking-widest inline-flex items-center justify-center gap-2 disabled:opacity-60"
        data-testid="button-pay"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {t.loading}
          </>
        ) : (
          <>
            <Lock className="w-3.5 h-3.5" />
            {t.paymentButton}
          </>
        )}
      </button>
      <p className="mc-mono text-xs text-center uppercase tracking-widest flex items-center justify-center gap-2" style={{ color: "var(--mc-muted-2)" }}>
        <Lock className="w-3 h-3" />
        {t.unlockSecure}
      </p>
    </form>
  );
}

export default function CheckoutPage() {
  const { language, setLanguage, t } = useLanguage();
  const [, setLocation] = useLocation();
  const [sessionId, setSessionId] = useState<string>("");
  const [clientSecret, setClientSecret] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("sessionId");
    
    if (id) {
      setSessionId(id);
      
      apiRequest("POST", "/api/create-payment-intent", { sessionId: id, amount: 2 })
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
        })
        .catch((err) => {
          console.error("Payment intent creation failed:", err);
          setLocation("/");
        });
    } else {
      setLocation("/");
    }
  }, [setLocation]);

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--mc-bg)", color: "var(--mc-text)" }}>
        <div className="flex items-center gap-3 mc-mono text-sm uppercase tracking-widest" style={{ color: "var(--mc-muted)" }}>
          <Loader2 className="w-4 h-4 animate-spin" /> {t.loading}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--mc-bg)", color: "var(--mc-text)" }}>
      <div className="mc-mono text-xs text-center py-2 px-4" style={{ background: "var(--mc-warn)", color: "var(--mc-bg)" }}>
        [ BETA ] &nbsp;&nbsp; {language === "fr" ? "Aperçu V1 — pendant la beta, tout reste gratuit." : "V1 preview — during beta, everything stays free."}
      </div>

      <header className="mc-section-rule">
        <div className="max-w-6xl mx-auto px-6 md:px-8 h-14 flex items-center justify-between">
          <a href="/" data-testid="link-home" className="mc-display text-lg" style={{ textDecoration: "none", color: "var(--mc-text)" }}>
            Mecene<span style={{ color: "var(--mc-primary)" }}>.</span>
          </a>
          <div className="flex items-center gap-3">
            <div className="mc-mono text-xs uppercase tracking-widest hidden md:flex items-center gap-2" style={{ color: "var(--mc-muted)" }}>
              <Lock className="w-3 h-3" /> {language === "fr" ? "Paiement sécurisé · Stripe" : "Secure · Stripe"}
            </div>
            <LanguageToggle language={language} onLanguageChange={setLanguage} />
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center py-16 px-6">
        <div className="max-w-2xl mx-auto w-full">
          <div className="mc-card overflow-hidden">
            <div className="text-center space-y-3 p-8 pb-4">
              <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "var(--mc-primary-soft)" }}>
                <Lock className="w-5 h-5" style={{ color: "var(--mc-primary)" }} />
              </div>
              <div>
                <h2 className="mc-display text-3xl mb-1">{t.paymentTitle}</h2>
                <p className="text-sm" style={{ color: "var(--mc-muted)" }}>{t.paymentDescription}</p>
              </div>
              <div className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg" style={{ background: "var(--mc-primary-soft)" }}>
                <span className="mc-display text-2xl" style={{ color: "var(--mc-primary)" }}>{t.paymentAmount}</span>
              </div>
            </div>
            <div className="space-y-5 p-8 pt-4">
              <div className="grid grid-cols-3 gap-3 p-3 mc-card-soft">
                {[
                  language === "fr" ? "Accès immédiat" : "Instant access",
                  language === "fr" ? "Toutes les subventions" : "All grants",
                  language === "fr" ? "Paiement sécurisé" : "Secure payment",
                ].map((t, i) => (
                  <div key={i} className="text-center space-y-1">
                    <CheckCircle className="w-3.5 h-3.5 mx-auto" style={{ color: "var(--mc-primary)" }} />
                    <p className="text-xs" style={{ color: "var(--mc-muted)" }}>{t}</p>
                  </div>
                ))}
              </div>

              <Elements stripe={getStripePromise()} options={{ clientSecret, appearance: { theme: "night", variables: { colorPrimary: "#06D6A0", colorBackground: "#0A0A0A", colorText: "#F5F5F6", colorDanger: "#EF476F", borderRadius: "10px", fontFamily: "Inter, system-ui, sans-serif" } } }}>
                <CheckoutForm sessionId={sessionId} />
              </Elements>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
