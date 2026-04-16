import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

interface LanguageToggleProps {
  language: "fr" | "en";
  onLanguageChange: (lang: "fr" | "en") => void;
}

export function LanguageToggle({ language, onLanguageChange }: LanguageToggleProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onLanguageChange(language === "fr" ? "en" : "fr")}
      className="gap-2"
      data-testid="button-language-toggle"
    >
      <Globe className="h-4 w-4" />
      <span className="font-medium">{language === "fr" ? "EN" : "FR"}</span>
    </Button>
  );
}
