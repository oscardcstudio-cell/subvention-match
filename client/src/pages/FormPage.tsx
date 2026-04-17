import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formDataSchema, type FormData } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

const frenchRegions = [
  "Auvergne-Rhône-Alpes",
  "Bourgogne-Franche-Comté",
  "Bretagne",
  "Centre-Val de Loire",
  "Corse",
  "Grand Est",
  "Hauts-de-France",
  "Île-de-France",
  "Normandie",
  "Nouvelle-Aquitaine",
  "Occitanie",
  "Pays de la Loire",
  "Provence-Alpes-Côte d'Azur",
];

export default function FormPage() {
  const { language, setLanguage, t } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showStatusOther, setShowStatusOther] = useState(false);
  const [showDomainOther, setShowDomainOther] = useState(false);
  const [showProjectTypeOther, setShowProjectTypeOther] = useState(false);
  const [showInnovationOther, setShowInnovationOther] = useState(false);
  const [showSocialOther, setShowSocialOther] = useState(false);
  const [showAidTypesOther, setShowAidTypesOther] = useState(false);
  const [regionSuggestions, setRegionSuggestions] = useState<string[]>([]);
  const [showRegionSuggestions, setShowRegionSuggestions] = useState(false);

  // Lire le paramètre domain depuis l'URL pour pré-remplir le formulaire
  const urlParams = new URLSearchParams(window.location.search);
  const domainFromUrl = urlParams.get('domain');

  const form = useForm<FormData>({
    resolver: zodResolver(formDataSchema),
    defaultValues: {
      status: [],
      statusOther: "",
      artisticDomain: domainFromUrl ? [domainFromUrl] : [],
      artisticDomainOther: "",
      projectDescription: "",
      projectType: [],
      projectTypeOther: "",
      projectStage: "",
      region: "",
      isInternational: "",
      innovation: [],
      innovationOther: "",
      socialDimension: [],
      socialDimensionOther: "",
      urgency: "",
      aidTypes: [],
      aidTypesOther: "",
      geographicScope: [],
      email: "",
      age: undefined,
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/submit-form", data);
      return response.json();
    },
    onSuccess: (data) => {
      setLocation(`/results?sessionId=${data.sessionId}`);
    },
    onError: (error: Error) => {
      toast({
        title: language === "fr" ? "Erreur" : "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    submitMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-6 md:px-8">
          <a href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary" />
            <span className="font-serif text-xl font-bold">Mécène</span>
          </a>
          <LanguageToggle language={language} onLanguageChange={setLanguage} />
        </div>
      </header>

      {/* Form */}
      <main className="py-12 md:py-16">
        <div className="container max-w-4xl px-6 md:px-8">
          <div className="mb-8">
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">{t.formTitle}</h1>
            <p className="text-muted-foreground">{t.heroSubtitle}</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Section 1: Profil créatif */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">{t.section1}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="status"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">{t.status}</FormLabel>
                        </div>
                        {["artiste-auto", "micro-entreprise", "association", "collectif", "porteur-projet", "autre"].map((item) => (
                          <FormField
                            key={item}
                            control={form.control}
                            name="status"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item)}
                                      onCheckedChange={(checked) => {
                                        const newValue = checked
                                          ? [...field.value, item]
                                          : field.value?.filter((value) => value !== item);
                                        field.onChange(newValue);
                                        if (item === "autre") {
                                          setShowStatusOther(!!checked);
                                        }
                                      }}
                                      data-testid={`checkbox-status-${item}`}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {item === "artiste-auto" && t.artisteAutoEntrepreneur}
                                    {item === "micro-entreprise" && t.microEntreprise}
                                    {item === "association" && t.association}
                                    {item === "collectif" && t.collectif}
                                    {item === "porteur-projet" && t.porteurProjet}
                                    {item === "autre" && (language === "fr" ? "Autre" : "Other")}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {showStatusOther && (
                    <FormField
                      control={form.control}
                      name="statusOther"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{language === "fr" ? "Précisez votre statut" : "Please specify your status"}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder={language === "fr" ? "Votre statut..." : "Your status..."} data-testid="input-status-other" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="artisticDomain"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">{t.artisticDomain}</FormLabel>
                        </div>
                        {["arts-numeriques", "audiovisuel", "arts-plastiques", "spectacle-vivant", "musique", "ecriture", "patrimoine", "autre"].map((item) => (
                          <FormField
                            key={item}
                            control={form.control}
                            name="artisticDomain"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item)}
                                      onCheckedChange={(checked) => {
                                        const newValue = checked
                                          ? [...field.value, item]
                                          : field.value?.filter((value) => value !== item);
                                        field.onChange(newValue);
                                        if (item === "autre") {
                                          setShowDomainOther(!!checked);
                                        }
                                      }}
                                      data-testid={`checkbox-domain-${item}`}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {item === "arts-numeriques" && t.artsNumeriques}
                                    {item === "audiovisuel" && t.audiovisuel}
                                    {item === "arts-plastiques" && t.artsPlastiques}
                                    {item === "spectacle-vivant" && t.spectacleVivant}
                                    {item === "musique" && t.musique}
                                    {item === "ecriture" && t.ecriture}
                                    {item === "patrimoine" && t.patrimoine}
                                    {item === "autre" && (language === "fr" ? "Autre" : "Other")}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {showDomainOther && (
                    <FormField
                      control={form.control}
                      name="artisticDomainOther"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{language === "fr" ? "Précisez votre domaine artistique" : "Please specify your artistic domain"}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder={language === "fr" ? "Votre domaine..." : "Your domain..."} data-testid="input-domain-other" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">
                          {language === "fr" ? "Votre âge" : "Your age"}
                          <span className="text-muted-foreground text-sm ml-2">
                            ({language === "fr" ? "optionnel, utile pour certaines aides réservées aux -25 ans" : "optional, useful for grants reserved for under-25s"})
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="120"
                            placeholder={language === "fr" ? "Ex: 24" : "e.g., 24"}
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === "" ? undefined : parseInt(value));
                            }}
                            data-testid="input-age"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Section 2: Votre projet */}
              <Card className="border-primary/20 shadow-lg">
                <CardHeader className="bg-primary/5">
                  <CardTitle className="font-serif text-2xl">{t.section2}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <FormField
                    control={form.control}
                    name="projectDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">
                          {language === "fr" ? "Décrivez votre projet" : "Describe your project"}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder={language === "fr" ? "Parlez-nous de votre projet en quelques phrases..." : "Tell us about your project in a few sentences..."}
                            className="min-h-32 resize-none"
                            data-testid="textarea-project-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="projectType"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">{t.projectType}</FormLabel>
                        </div>
                        {["creation", "production", "residence", "formation", "equipement", "diffusion", "action-culturelle", "autre"].map((item) => (
                          <FormField
                            key={item}
                            control={form.control}
                            name="projectType"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item)}
                                      onCheckedChange={(checked) => {
                                        const newValue = checked
                                          ? [...field.value, item]
                                          : field.value?.filter((value) => value !== item);
                                        field.onChange(newValue);
                                        if (item === "autre") {
                                          setShowProjectTypeOther(!!checked);
                                        }
                                      }}
                                      data-testid={`checkbox-project-type-${item}`}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {item === "creation" && t.creationArtistique}
                                    {item === "production" && t.productionOeuvre}
                                    {item === "residence" && t.residence}
                                    {item === "formation" && t.formation}
                                    {item === "equipement" && t.equipement}
                                    {item === "diffusion" && t.diffusion}
                                    {item === "action-culturelle" && t.actionCulturelle}
                                    {item === "autre" && (language === "fr" ? "Autre" : "Other")}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {showProjectTypeOther && (
                    <FormField
                      control={form.control}
                      name="projectTypeOther"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{language === "fr" ? "Précisez le type de projet" : "Please specify the project type"}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder={language === "fr" ? "Votre type de projet..." : "Your project type..."} data-testid="input-project-type-other" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Section 3: Localisation */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">{t.section3}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {language === "fr" ? "Pour les aides régionales" : "For regional grants"}
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem className="relative">
                        <FormLabel>{t.region}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={language === "fr" ? "Tapez votre région..." : "Type your region..."}
                            data-testid="input-region"
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value);
                              
                              if (value.trim()) {
                                const filtered = frenchRegions.filter(region => 
                                  region.toLowerCase().includes(value.toLowerCase())
                                );
                                setRegionSuggestions(filtered);
                                setShowRegionSuggestions(true);
                              } else {
                                setShowRegionSuggestions(false);
                              }
                            }}
                            onFocus={() => {
                              if (field.value && field.value.trim()) {
                                const filtered = frenchRegions.filter(region => 
                                  region.toLowerCase().includes(field.value.toLowerCase())
                                );
                                setRegionSuggestions(filtered);
                                setShowRegionSuggestions(true);
                              }
                            }}
                            onBlur={() => {
                              setTimeout(() => setShowRegionSuggestions(false), 200);
                            }}
                          />
                        </FormControl>
                        {showRegionSuggestions && regionSuggestions.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
                            {regionSuggestions.map((region) => (
                              <div
                                key={region}
                                className="px-3 py-2 cursor-pointer hover-elevate"
                                onClick={() => {
                                  field.onChange(region);
                                  setShowRegionSuggestions(false);
                                }}
                                data-testid={`suggestion-${region}`}
                              >
                                {region}
                              </div>
                            ))}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isInternational"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>{t.international}</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="space-y-2"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="oui" data-testid="radio-international-oui" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {language === "fr" ? "Oui" : "Yes"}
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="non" data-testid="radio-international-non" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {language === "fr" ? "Non" : "No"}
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Section 4: Spécificités */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">{t.section4}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="innovation"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">{t.innovation}</FormLabel>
                        </div>
                        {["technologique", "sociale", "artistique", "environnementale", "autre"].map((item) => (
                          <FormField
                            key={item}
                            control={form.control}
                            name="innovation"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item)}
                                      onCheckedChange={(checked) => {
                                        const newValue = checked
                                          ? [...(field.value || []), item]
                                          : field.value?.filter((value) => value !== item) || [];
                                        field.onChange(newValue);
                                        if (item === "autre") {
                                          setShowInnovationOther(!!checked);
                                        }
                                      }}
                                      data-testid={`checkbox-innovation-${item}`}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {item === "technologique" && (language === "fr" ? "Innovation technologique" : "Technological innovation")}
                                    {item === "sociale" && (language === "fr" ? "Innovation sociale" : "Social innovation")}
                                    {item === "artistique" && (language === "fr" ? "Innovation artistique" : "Artistic innovation")}
                                    {item === "environnementale" && (language === "fr" ? "Innovation environnementale" : "Environmental innovation")}
                                    {item === "autre" && (language === "fr" ? "Autre" : "Other")}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {showInnovationOther && (
                    <FormField
                      control={form.control}
                      name="innovationOther"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{language === "fr" ? "Précisez l'innovation" : "Please specify the innovation"}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder={language === "fr" ? "Votre innovation..." : "Your innovation..."} data-testid="input-innovation-other" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="socialDimension"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">{t.socialDimension}</FormLabel>
                        </div>
                        {["inclusion", "accessibilite", "education", "diversite", "autre"].map((item) => (
                          <FormField
                            key={item}
                            control={form.control}
                            name="socialDimension"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item)}
                                      onCheckedChange={(checked) => {
                                        const newValue = checked
                                          ? [...(field.value || []), item]
                                          : field.value?.filter((value) => value !== item);
                                        field.onChange(newValue);
                                        if (item === "autre") {
                                          setShowSocialOther(!!checked);
                                        }
                                      }}
                                      data-testid={`checkbox-social-${item}`}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {item === "inclusion" && (language === "fr" ? "Inclusion sociale" : "Social inclusion")}
                                    {item === "accessibilite" && (language === "fr" ? "Accessibilité" : "Accessibility")}
                                    {item === "education" && (language === "fr" ? "Éducation" : "Education")}
                                    {item === "diversite" && (language === "fr" ? "Diversité culturelle" : "Cultural diversity")}
                                    {item === "autre" && (language === "fr" ? "Autre" : "Other")}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {showSocialOther && (
                    <FormField
                      control={form.control}
                      name="socialDimensionOther"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{language === "fr" ? "Précisez la dimension sociale" : "Please specify the social dimension"}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder={language === "fr" ? "Votre dimension sociale..." : "Your social dimension..."} data-testid="input-social-other" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Section 5: Besoins */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">{t.section5}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="urgency"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>{t.urgency}</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="space-y-2"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="immediat" data-testid="radio-urgency-immediat" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {t.urgencyImmediate}
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="3-mois" data-testid="radio-urgency-3-mois" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {t.urgency3Months}
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="6-mois" data-testid="radio-urgency-6-mois" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {t.urgency6Months}
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="plus-6-mois" data-testid="radio-urgency-plus-6-mois" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {t.urgency6Plus}
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="aidTypes"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">{t.aidTypes}</FormLabel>
                        </div>
                        {["toutes", "subvention", "bourse", "pret", "accompagnement", "residence", "prix", "autre"].map((item) => (
                          <FormField
                            key={item}
                            control={form.control}
                            name="aidTypes"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item)}
                                      onCheckedChange={(checked) => {
                                        let newValue;
                                        if (item === "toutes") {
                                          newValue = checked ? ["toutes"] : [];
                                        } else {
                                          newValue = checked
                                            ? [...(field.value || []).filter(v => v !== "toutes"), item]
                                            : field.value?.filter((value) => value !== item) || [];
                                        }
                                        field.onChange(newValue);
                                        if (item === "autre") {
                                          setShowAidTypesOther(!!checked);
                                        }
                                      }}
                                      data-testid={`checkbox-aidtype-${item}`}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {item === "toutes" && (language === "fr" ? "Toutes" : "All")}
                                    {item === "subvention" && (language === "fr" ? "Subvention" : "Grant")}
                                    {item === "bourse" && (language === "fr" ? "Bourse" : "Scholarship")}
                                    {item === "pret" && (language === "fr" ? "Prêt" : "Loan")}
                                    {item === "accompagnement" && (language === "fr" ? "Accompagnement" : "Support")}
                                    {item === "residence" && (language === "fr" ? "Résidence" : "Residency")}
                                    {item === "prix" && (language === "fr" ? "Prix" : "Award")}
                                    {item === "autre" && (language === "fr" ? "Autre" : "Other")}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {showAidTypesOther && (
                    <FormField
                      control={form.control}
                      name="aidTypesOther"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{language === "fr" ? "Précisez le type d'aide" : "Please specify the aid type"}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder={language === "fr" ? "Votre type d'aide..." : "Your aid type..."} data-testid="input-aidtype-other" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="geographicScope"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">{t.geographicScope}</FormLabel>
                        </div>
                        {["local", "regional", "national", "europeen", "international"].map((item) => (
                          <FormField
                            key={item}
                            control={form.control}
                            name="geographicScope"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), item])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== item
                                              ) || []
                                            );
                                      }}
                                      data-testid={`checkbox-scope-${item}`}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {item === "local" && (language === "fr" ? "Local" : "Local")}
                                    {item === "regional" && (language === "fr" ? "Régional" : "Regional")}
                                    {item === "national" && (language === "fr" ? "National" : "National")}
                                    {item === "europeen" && (language === "fr" ? "Européen" : "European")}
                                    {item === "international" && (language === "fr" ? "International" : "International")}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Section 6: Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">{t.section7}</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.email}</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder={language === "fr" ? "votre@email.com" : "your@email.com"} 
                            {...field} 
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={submitMutation.isPending}
                data-testid="button-submit"
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {language === "fr" ? "Envoi en cours..." : "Submitting..."}
                  </>
                ) : (
                  t.submitButton
                )}
              </Button>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
}
