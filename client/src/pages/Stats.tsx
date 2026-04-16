import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import { Search, Database, TrendingUp, Filter, Sparkles } from "lucide-react";

interface ColumnStat {
  name: string;
  label: string;
  type: string;
  filled: number;
  empty: number;
  percentage: number;
}

interface StatsData {
  overall: {
    total: number;
    withAmount: number;
    withDeadline: number;
    permanent: number;
    avgAmount: number;
    withContactEmail: number;
    withProcessingTime: number;
    withPreparationAdvice: number;
  };
  columns: ColumnStat[];
  total: number;
}

export default function Stats() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"percentage" | "name">("percentage");

  const { data, isLoading } = useQuery<StatsData>({
    queryKey: ["/api/grants/stats-detail"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-12 w-96" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!data) {
    return <div>Erreur lors du chargement des statistiques</div>;
  }

  // Filtrer et trier les colonnes
  let filteredColumns = data.columns.filter((col) =>
    col.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (typeFilter !== "all") {
    filteredColumns = filteredColumns.filter((col) => col.type === typeFilter);
  }

  if (sortBy === "percentage") {
    filteredColumns.sort((a, b) => b.percentage - a.percentage);
  } else {
    filteredColumns.sort((a, b) => a.label.localeCompare(b.label));
  }

  // Données pour le graphique en barres (top 15)
  const topColumns = filteredColumns.slice(0, 15);

  // Catégoriser les colonnes par taux de remplissage
  const categoryData = [
    {
      name: "Excellent (80-100%)",
      value: filteredColumns.filter((c) => c.percentage >= 80).length,
      color: "#10b981",
    },
    {
      name: "Bon (60-79%)",
      value: filteredColumns.filter((c) => c.percentage >= 60 && c.percentage < 80).length,
      color: "#3b82f6",
    },
    {
      name: "Moyen (40-59%)",
      value: filteredColumns.filter((c) => c.percentage >= 40 && c.percentage < 60).length,
      color: "#f59e0b",
    },
    {
      name: "Faible (<40%)",
      value: filteredColumns.filter((c) => c.percentage < 40).length,
      color: "#ef4444",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center gap-4 mb-2">
            <Database className="w-10 h-10 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-900">Statistiques de la Base de Données</h1>
          </div>
          <p className="text-gray-600 text-lg mb-4">
            Analyse détaillée du taux de remplissage des colonnes de la table <code className="bg-gray-100 px-2 py-1 rounded text-sm">grants</code>
          </p>
          <Link href="/enrichment-monitor">
            <Button size="lg" data-testid="button-enrichment-monitor">
              <Sparkles className="mr-2 h-4 w-4" />
              Monitoring Enrichissement
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        {/* KPIs globaux */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Subventions</CardDescription>
              <CardTitle className="text-3xl">{data.overall.total}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Avec Montant</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {data.overall.withAmount}
                <span className="text-sm text-gray-500 ml-2">
                  ({Math.round((data.overall.withAmount / data.overall.total) * 100)}%)
                </span>
              </CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Permanentes</CardDescription>
              <CardTitle className="text-3xl text-blue-600">
                {data.overall.permanent}
                <span className="text-sm text-gray-500 ml-2">
                  ({Math.round((data.overall.permanent / data.overall.total) * 100)}%)
                </span>
              </CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Montant Moyen</CardDescription>
              <CardTitle className="text-3xl text-purple-600">
                {data.overall.avgAmount ? `${(data.overall.avgAmount / 1000).toFixed(0)}K €` : "N/A"}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* KPIs Enrichissement */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-2 border-orange-200 bg-orange-50">
            <CardHeader className="pb-3">
              <CardDescription className="text-orange-700 font-semibold">📧 Avec Email Contact</CardDescription>
              <CardTitle className="text-3xl text-orange-600">
                {data.overall.withContactEmail}
                <span className="text-sm text-gray-600 ml-2">
                  ({Math.round((data.overall.withContactEmail / data.overall.total) * 100)}%)
                </span>
              </CardTitle>
            </CardHeader>
          </Card>
          
          <Card className="border-2 border-teal-200 bg-teal-50">
            <CardHeader className="pb-3">
              <CardDescription className="text-teal-700 font-semibold">⏱️ Avec Délai de Traitement</CardDescription>
              <CardTitle className="text-3xl text-teal-600">
                {data.overall.withProcessingTime}
                <span className="text-sm text-gray-600 ml-2">
                  ({Math.round((data.overall.withProcessingTime / data.overall.total) * 100)}%)
                </span>
              </CardTitle>
            </CardHeader>
          </Card>
          
          <Card className="border-2 border-indigo-200 bg-indigo-50">
            <CardHeader className="pb-3">
              <CardDescription className="text-indigo-700 font-semibold">💡 Avec Conseils Préparation</CardDescription>
              <CardTitle className="text-3xl text-indigo-600">
                {data.overall.withPreparationAdvice}
                <span className="text-sm text-gray-600 ml-2">
                  ({Math.round((data.overall.withPreparationAdvice / data.overall.total) * 100)}%)
                </span>
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filtres */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher une colonne..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-column"
                />
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger data-testid="select-type-filter">
                  <SelectValue placeholder="Type de colonne" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="text">Texte</SelectItem>
                  <SelectItem value="number">Nombre</SelectItem>
                  <SelectItem value="array">Array</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as "percentage" | "name")}>
                <SelectTrigger data-testid="select-sort">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Taux de remplissage</SelectItem>
                  <SelectItem value="name">Nom alphabétique</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Graphique en barres - Top colonnes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Top {topColumns.length} Colonnes - Taux de Remplissage
              </CardTitle>
              <CardDescription>
                Colonnes avec le meilleur taux de complétion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topColumns} layout="vertical" margin={{ left: 150 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} unit="%" />
                  <YAxis type="category" dataKey="label" width={140} />
                  <Tooltip
                    formatter={(value: number) => `${value}%`}
                    contentStyle={{ backgroundColor: "white", border: "1px solid #ddd" }}
                  />
                  <Bar dataKey="percentage" radius={[0, 8, 8, 0]}>
                    {topColumns.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.percentage >= 80
                            ? "#10b981"
                            : entry.percentage >= 60
                            ? "#3b82f6"
                            : entry.percentage >= 40
                            ? "#f59e0b"
                            : "#ef4444"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Graphique en camembert - Répartition */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition par Qualité de Remplissage</CardTitle>
              <CardDescription>
                Distribution des colonnes selon leur taux de complétion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tableau détaillé */}
        <Card>
          <CardHeader>
            <CardTitle>Détails par Colonne ({filteredColumns.length} colonnes)</CardTitle>
            <CardDescription>
              Vue complète du taux de remplissage de chaque colonne
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Colonne</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Rempli</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Vide</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Taux</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Progression</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredColumns.map((col, idx) => (
                    <tr key={col.name} className="border-b hover:bg-gray-50" data-testid={`row-column-${idx}`}>
                      <td className="py-3 px-4 font-medium">{col.label}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {col.type}
                        </span>
                      </td>
                      <td className="text-right py-3 px-4 text-green-600">{col.filled}</td>
                      <td className="text-right py-3 px-4 text-red-600">{col.empty}</td>
                      <td className="text-right py-3 px-4 font-semibold">{col.percentage}%</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all"
                              style={{
                                width: `${col.percentage}%`,
                                backgroundColor:
                                  col.percentage >= 80
                                    ? "#10b981"
                                    : col.percentage >= 60
                                    ? "#3b82f6"
                                    : col.percentage >= 40
                                    ? "#f59e0b"
                                    : "#ef4444",
                              }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
