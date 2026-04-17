import { FileText, CheckCircle, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface Note {
  text: string;
  priority: string;
  done: boolean;
  date?: string;
}

export default function Notes() {
  const notes: Record<string, Note[]> = {
    "Issues à vérifier": [
      {
        text: "Couverture régionale : On affiche '13 régions couvertes' - à vérifier si c'est juste ou si on devrait l'étendre/modifier",
        priority: "warning",
        done: false
      }
    ],
    "Homepage": [
      {
        text: "Comparer une recherche ChatGPT (nulle, générique) vs notre recherche (excellente, spécialisée sur les subventions culturelles françaises) pour montrer la différence de qualité",
        priority: "normal",
        done: false
      },
      {
        text: "Ajouter titre 'Je suis...' avec tags cliquables en dessous (un musicien, un écrivain, un artiste plasticien, etc.) pour filtrer/orienter dès le début",
        priority: "normal",
        done: false
      }
    ],
    "Formulaire": [
      {
        text: "Ajouter champ 'âge' dans le formulaire car certaines subventions sont réservées aux moins de 25 ans",
        priority: "normal",
        done: false
      }
    ],
    "Enrichissement & Scraping": [
      {
        text: "Système d'enrichissement IA automatique avec DeepSeek",
        priority: "high",
        done: true,
        date: "23 Nov 2025"
      },
      {
        text: "Système de scraping automatique opérationnel avec Puppeteer - 5 scrapers prioritaires implémentés (CNM, SACEM, ADAMI, SPEDIDAM, Ministère Culture)",
        priority: "high",
        done: true,
        date: "23 Nov 2025"
      },
      {
        text: "Architecture modulaire avec retry mechanism et gestion des ressources",
        priority: "high",
        done: true,
        date: "23 Nov 2025"
      },
      {
        text: "Page admin /enrichment-monitor pour visualiser et lancer les scraping",
        priority: "high",
        done: true,
        date: "23 Nov 2025"
      },
      {
        text: "Détection intelligente des doublons (titre + organisme)",
        priority: "high",
        done: true,
        date: "23 Nov 2025"
      },
      {
        text: "Placeholders eligibility statiques et conformes aux contraintes de qualité",
        priority: "high",
        done: true,
        date: "23 Nov 2025"
      },
      {
        text: "Implémenter les 19 scrapers restants pour couvrir les 24 organismes français",
        priority: "high",
        done: false
      },
      {
        text: "Planifier QA périodique pour valider les sélecteurs CSS après évolution des sites",
        priority: "normal",
        done: false
      }
    ],
    "Qualité des données": [
      {
        text: "Analyse automatique de qualité sur 211 subventions actives",
        priority: "high",
        done: true,
        date: "23 Nov 2025"
      },
      {
        text: "Page admin /data-quality avec statistiques et problèmes détectés",
        priority: "high",
        done: true,
        date: "23 Nov 2025"
      },
      {
        text: "Enrichissement IA automatique (résume descriptions/eligibility longues, complète champs manquants)",
        priority: "high",
        done: true,
        date: "23 Nov 2025"
      },
      {
        text: "Enrichissement exécuté sur 187 subventions actives → 32 changements (titres raccourcis)",
        priority: "high",
        done: true,
        date: "23 Nov 2025"
      },
      {
        text: "Qualité améliorée : 424 warnings → 392 warnings (32 problèmes résolus)",
        priority: "high",
        done: true,
        date: "23 Nov 2025"
      }
    ]
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Haute priorité</Badge>;
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">À vérifier</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Normal</Badge>;
    }
  };

  const totalNotes = Object.values(notes).flat().length;
  const completedNotes = Object.values(notes).flat().filter(n => n.done).length;
  const progress = Math.round((completedNotes / totalNotes) * 100);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-[#118AB2]" />
                <h1 className="text-3xl font-bold tracking-tight">Notes & TODO</h1>
              </div>
              <p className="text-gray-600 mt-1">Idées et améliorations pour SubventionMatch</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Progression</div>
              <div className="text-3xl font-bold text-[#06D6A0]">{progress}%</div>
              <div className="text-xs text-gray-500">{completedNotes}/{totalNotes} complétées</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <div className="text-sm text-gray-600 mb-1">Total notes</div>
            <div className="text-3xl font-bold text-gray-900">{totalNotes}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-gray-600 mb-1">Complétées</div>
            <div className="text-3xl font-bold text-green-600">{completedNotes}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-gray-600 mb-1">En attente</div>
            <div className="text-3xl font-bold text-blue-600">{totalNotes - completedNotes}</div>
          </Card>
        </div>

        {/* Notes par catégorie */}
        <div className="space-y-8">
          {Object.entries(notes).map(([category, categoryNotes]) => (
            <div key={category}>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                {category}
                <span className="text-sm font-normal text-gray-500">
                  ({categoryNotes.filter(n => n.done).length}/{categoryNotes.length})
                </span>
              </h2>
              
              <div className="space-y-3">
                {categoryNotes.map((note, index) => (
                  <Card key={index} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {note.done ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-base ${note.done ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                          {note.text}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {getPriorityBadge(note.priority)}
                          {note.date && (
                            <span className="text-xs text-gray-500">
                              ✅ {note.date}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
