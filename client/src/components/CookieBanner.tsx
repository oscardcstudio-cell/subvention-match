import { useState, useEffect } from "react";
import { hasConsentBeenDecided, setAnalyticsConsent, initSentryIfConsented } from "@/lib/analytics";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // N'affiche la bannière que si le choix n'a pas encore été fait
    if (!hasConsentBeenDecided()) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const accept = () => {
    setAnalyticsConsent(true);
    initSentryIfConsented();
    setVisible(false);
  };

  const refuse = () => {
    setAnalyticsConsent(false);
    setVisible(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t border-gray-200 shadow-lg px-4 py-3 sm:px-6 sm:py-4">
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <p className="text-sm text-gray-600 flex-1">
          Nous utilisons des cookies d'analyse (PostHog, Sentry) pour ameliorer le service.
          Aucune donnee n'est vendue.{" "}
          <a href="/confidentialite" className="underline text-gray-800">En savoir plus</a>
        </p>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={refuse}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
          >
            Refuser
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-sm text-white bg-black rounded-full hover:bg-gray-800 transition-colors"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
