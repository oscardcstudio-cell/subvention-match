import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, Mail } from "lucide-react";

export default function LoadingPage() {
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  
  const searchParams = new URLSearchParams(window.location.search);
  const sessionId = searchParams.get("sessionId");

  useEffect(() => {
    if (!sessionId) {
      setLocation("/");
      return;
    }

    const timer1 = setTimeout(() => setStep(1), 800);
    const timer2 = setTimeout(() => setStep(2), 2000);
    const timer3 = setTimeout(() => setStep(3), 3500);
    const finalTimer = setTimeout(() => {
      setLocation(`/results?sessionId=${sessionId}`);
    }, 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(finalTimer);
    };
  }, [sessionId, setLocation]);

  const steps = [
    {
      icon: <Loader2 className="h-16 w-16 text-primary animate-spin" />,
      text: language === "fr" ? "Analyse de votre profil..." : "Analyzing your profile...",
    },
    {
      icon: <Loader2 className="h-16 w-16 text-primary animate-spin" />,
      text: language === "fr" ? "Matching avec les subventions..." : "Matching with grants...",
    },
    {
      icon: <Mail className="h-16 w-16 text-[#06D6A0]" />,
      text: language === "fr" ? "Email envoyé avec votre PDF !" : "Email sent with your PDF!",
    },
    {
      icon: <CheckCircle2 className="h-16 w-16 text-[#06D6A0]" />,
      text: language === "fr" ? "Redirection vers vos résultats..." : "Redirecting to your results...",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#073B4C] via-[#118AB2] to-[#06D6A0] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-2xl p-12 text-center"
        >
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-6"
          >
            {steps[step].icon}
            <p className="text-xl font-medium text-gray-900">
              {steps[step].text}
            </p>
          </motion.div>

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-6 p-4 bg-[#06D6A0]/10 rounded-xl border-2 border-[#06D6A0]"
            >
              <p className="text-sm text-gray-700">
                {language === "fr" 
                  ? "📧 Vérifiez votre boîte email (et vos spams)" 
                  : "📧 Check your inbox (and spam folder)"}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
