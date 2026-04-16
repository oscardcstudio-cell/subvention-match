import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useQuery } from "@tanstack/react-query";
import { Lock, Loader2, TrendingUp, Euro, Calendar } from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import type { GrantResult } from "@shared/schema";
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";

export default function ResultsGraphPage() {
  const { language, setLanguage, t } = useLanguage();
  const [, setLocation] = useLocation();
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("sessionId");
    if (id) {
      setSessionId(id);
    } else {
      setLocation("/");
    }
  }, [setLocation]);

  const { data, isLoading } = useQuery<{ results: GrantResult[]; isPaid: boolean }>({
    queryKey: ["/api/results", sessionId],
    enabled: !!sessionId,
  });

  const handleUnlock = () => {
    setLocation(`/checkout?sessionId=${sessionId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-emerald-500 to-teal-700 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-white/90 mx-auto" />
          <p className="text-white/70">{t.loading}</p>
        </div>
      </div>
    );
  }

  const results = data?.results || [];
  const isPaid = data?.isPaid || false;
  const visibleResults = isPaid ? results : results.slice(0, 1);
  const hasLockedResults = !isPaid && results.length > 1;

  // Prepare data for charts
  const amountData = visibleResults.map((grant, index) => ({
    name: `#${index + 1}`,
    montant: parseInt(grant.amount.replace(/[^\d]/g, '')) || 0,
  }));

  const totalAmount = amountData.reduce((sum, item) => sum + item.montant, 0);

  const COLORS = ['#118AB2', '#06D6A0', '#FFD166', '#EF476F', '#073B4C'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-emerald-500 to-teal-700">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-6">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <a href="/" data-testid="link-home">
            <span className="font-bold text-2xl text-white/95" style={{ fontFamily: 'serif' }}>
              SubventionMatch
            </span>
          </a>
          <LanguageToggle language={language} onLanguageChange={setLanguage} />
        </div>
      </header>

      {/* Main */}
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-light text-white/95 mb-2">
              {language === "fr" 
                ? `${results.length} subvention${results.length > 1 ? 's' : ''} - Vue analytique`
                : `${results.length} grant${results.length > 1 ? 's' : ''} - Analytics view`
              }
            </h1>
          </div>

          {/* Unlock Block */}
          {hasLockedResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="white-card p-6 text-center">
                <Lock className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {language === "fr" 
                    ? `Débloquez ${results.length - 1} subventions supplémentaires`
                    : `Unlock ${results.length - 1} more grants`
                  }
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {language === "fr"
                    ? "Accédez aux graphiques complets et à toutes les données"
                    : "Access full charts and all data"
                  }
                </p>
                <div className="text-3xl font-bold text-gray-900 mb-4">2,00€</div>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleUnlock}
                  data-testid="button-unlock"
                >
                  {language === "fr" ? "Débloquer" : "Unlock"}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="white-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {language === "fr" ? "Subventions trouvées" : "Grants found"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{visibleResults.length}</div>
              </CardContent>
            </Card>

            <Card className="white-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {language === "fr" ? "Montant total" : "Total amount"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {totalAmount.toLocaleString('fr-FR')}€
                </div>
              </CardContent>
            </Card>

            <Card className="white-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {language === "fr" ? "Montant moyen" : "Average amount"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {Math.round(totalAmount / visibleResults.length).toLocaleString('fr-FR')}€
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Bar Chart */}
            <Card className="white-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  {language === "fr" ? "Montants par subvention" : "Amounts by grant"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={amountData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value}€`} />
                    <Bar dataKey="montant" fill="#118AB2" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pie Chart */}
            <Card className="white-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Euro className="h-5 w-5 text-primary" />
                  {language === "fr" ? "Répartition des montants" : "Amount distribution"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={amountData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="montant"
                    >
                      {amountData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}€`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Grants List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">
              {language === "fr" ? "Liste des subventions" : "Grants list"}
            </h2>
            {visibleResults.map((grant, index) => (
              <motion.div
                key={grant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="white-card">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="text-xs text-gray-400 mb-1">
                          #{String(index + 1).padStart(2, '0')}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {grant.title}
                        </h3>
                        <p className="text-sm text-gray-600">{grant.organization}</p>
                      </div>
                      <Badge variant="default" className="px-3 py-1">
                        {grant.amount}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{language === "fr" ? "Date limite : " : "Deadline: "}{grant.deadline}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
