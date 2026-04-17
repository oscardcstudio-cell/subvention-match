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
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full"
        size="lg"
        data-testid="button-pay"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t.loading}
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            {t.paymentButton}
          </>
        )}
      </Button>
      <p className="text-sm text-center text-muted-foreground flex items-center justify-center gap-2">
        <Lock className="h-3 w-3" />
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
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-emerald-500 to-teal-700 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-white/90 mx-auto" />
          <p className="text-white/70">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-emerald-500 to-teal-700 flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-6">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <a href="/" data-testid="link-home">
            <span className="font-bold text-2xl text-white/95" style={{ fontFamily: 'serif' }}>
              Mécène
            </span>
          </a>
          <LanguageToggle language={language} onLanguageChange={setLanguage} />
        </div>
      </header>

      {/* Payment */}
      <main className="flex-1 flex pt-32 pb-16 px-6">
        <div className="max-w-2xl mx-auto w-full">
          <div className="white-card shadow-xl">
            <div className="text-center space-y-3 p-8 pb-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-[#06D6A0]/10 flex items-center justify-center">
                <Lock className="h-6 w-6 text-[#06D6A0]" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold mb-1 text-gray-900">{t.paymentTitle}</h2>
                <p className="text-sm text-gray-600">{t.paymentDescription}</p>
              </div>
              <div className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-[#06D6A0]/10 rounded-lg">
                <span className="text-2xl font-bold text-[#06D6A0]">{t.paymentAmount}</span>
              </div>
            </div>
            <div className="space-y-5 p-8 pt-4">
              <div className="grid grid-cols-3 gap-3 p-3 bg-gray-100 rounded-lg">
                <div className="text-center space-y-1">
                  <CheckCircle className="h-4 w-4 text-[#06D6A0] mx-auto" />
                  <p className="text-xs text-gray-600">
                    {language === "fr" ? "Accès immédiat" : "Instant access"}
                  </p>
                </div>
                <div className="text-center space-y-1">
                  <CheckCircle className="h-4 w-4 text-[#06D6A0] mx-auto" />
                  <p className="text-xs text-gray-600">
                    {language === "fr" ? "Toutes les subventions" : "All grants"}
                  </p>
                </div>
                <div className="text-center space-y-1">
                  <CheckCircle className="h-4 w-4 text-[#06D6A0] mx-auto" />
                  <p className="text-xs text-gray-600">
                    {language === "fr" ? "Paiement sécurisé" : "Secure payment"}
                  </p>
                </div>
              </div>

              <Elements stripe={getStripePromise()} options={{ clientSecret }}>
                <CheckoutForm sessionId={sessionId} />
              </Elements>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
