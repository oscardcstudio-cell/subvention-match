import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Calendar, Mail, MapPin, Target, Lightbulb, Users, Clock, DollarSign, FileText, Download } from "lucide-react";
import type { FormSubmission } from "@shared/schema";

export default function AdminPage() {
  const { data: submissions, isLoading, refetch } = useQuery<FormSubmission[]>({
    queryKey: ["/api/admin/submissions"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#06D6A0]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin - Soumissions</h1>
              <p className="text-sm text-gray-500 mt-1">
                {submissions?.length || 0} soumission(s) au total
              </p>
            </div>
            <Button onClick={() => refetch()} variant="outline" data-testid="button-refresh">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {submissions && submissions.length > 0 ? (
            submissions.map((submission) => (
              <SubmissionCard key={submission.sessionId} submission={submission} />
            ))
          ) : (
            <Card className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune soumission pour le moment</p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

function SubmissionCard({ submission }: { submission: FormSubmission }) {
  const resultsCount = submission.results ? (Array.isArray(submission.results) ? submission.results.length : 0) : 0;
  
  return (
    <Card className="p-6" data-testid={`card-submission-${submission.sessionId}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 pb-4 border-b">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-mono text-sm text-gray-500">
              Session: {submission.sessionId}
            </h3>
            {submission.isPaid === "true" && (
              <Badge className="bg-green-100 text-green-700">Payé</Badge>
            )}
            {resultsCount > 0 && (
              <Badge variant="secondary">{resultsCount} résultat(s)</Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            {new Date(submission.createdAt).toLocaleString('fr-FR')}
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section 1: Profil */}
        <Section title="Profil créatif" icon={<Users className="h-4 w-4" />}>
          <Field label="Statut">
            <div className="flex flex-wrap gap-1">
              {submission.status.map((s, i) => (
                <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
              ))}
              {submission.statusOther && (
                <Badge variant="outline" className="text-xs">{submission.statusOther}</Badge>
              )}
            </div>
          </Field>
          <Field label="Domaine artistique">
            <div className="flex flex-wrap gap-1">
              {submission.artisticDomain.map((d, i) => (
                <Badge key={i} className="bg-purple-100 text-purple-700 text-xs">{d}</Badge>
              ))}
              {submission.artisticDomainOther && (
                <Badge variant="outline" className="text-xs">{submission.artisticDomainOther}</Badge>
              )}
            </div>
          </Field>
        </Section>

        {/* Section 2: Contact & Localisation */}
        <Section title="Contact & Localisation" icon={<MapPin className="h-4 w-4" />}>
          <Field label="Email">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-mono">{submission.email}</span>
            </div>
          </Field>
          <Field label="Région">
            <Badge className="bg-blue-100 text-blue-700">{submission.region}</Badge>
          </Field>
          <Field label="International">
            <Badge variant={submission.isInternational === "Oui" ? "default" : "secondary"}>
              {submission.isInternational}
            </Badge>
          </Field>
        </Section>

        {/* Section 3: Projet */}
        <Section title="Projet" icon={<Target className="h-4 w-4" />}>
          <Field label="Description">
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
              {submission.projectDescription}
            </p>
          </Field>
          <Field label="Type de projet">
            <div className="flex flex-wrap gap-1">
              {submission.projectType.map((t, i) => (
                <Badge key={i} variant="secondary" className="text-xs">{t}</Badge>
              ))}
              {submission.projectTypeOther && (
                <Badge variant="outline" className="text-xs">{submission.projectTypeOther}</Badge>
              )}
            </div>
          </Field>
          <Field label="Stade du projet">
            <Badge className="bg-orange-100 text-orange-700">{submission.projectStage}</Badge>
          </Field>
        </Section>

        {/* Section 4: Innovation & Dimension sociale */}
        <Section title="Innovation & Impact" icon={<Lightbulb className="h-4 w-4" />}>
          <Field label="Innovation">
            <div className="flex flex-wrap gap-1">
              {submission.innovation.map((i, idx) => (
                <Badge key={idx} className="bg-pink-100 text-pink-700 text-xs">{i}</Badge>
              ))}
              {submission.innovationOther && (
                <Badge variant="outline" className="text-xs">{submission.innovationOther}</Badge>
              )}
            </div>
          </Field>
          {submission.socialDimension && submission.socialDimension.length > 0 && (
            <Field label="Dimension sociale">
              <div className="flex flex-wrap gap-1">
                {submission.socialDimension.map((s, idx) => (
                  <Badge key={idx} className="bg-teal-100 text-teal-700 text-xs">{s}</Badge>
                ))}
                {submission.socialDimensionOther && (
                  <Badge variant="outline" className="text-xs">{submission.socialDimensionOther}</Badge>
                )}
              </div>
            </Field>
          )}
        </Section>

        {/* Section 5: Besoins */}
        <Section title="Besoins" icon={<DollarSign className="h-4 w-4" />}>
          <Field label="Urgence">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <Badge className="bg-red-100 text-red-700">{submission.urgency}</Badge>
            </div>
          </Field>
          <Field label="Types d'aide">
            <div className="flex flex-wrap gap-1">
              {submission.aidTypes.map((a, i) => (
                <Badge key={i} className="bg-green-100 text-green-700 text-xs">{a}</Badge>
              ))}
              {submission.aidTypesOther && (
                <Badge variant="outline" className="text-xs">{submission.aidTypesOther}</Badge>
              )}
            </div>
          </Field>
          <Field label="Périmètre géographique">
            <div className="flex flex-wrap gap-1">
              {submission.geographicScope.map((g, i) => (
                <Badge key={i} variant="secondary" className="text-xs">{g}</Badge>
              ))}
            </div>
          </Field>
        </Section>

        {/* Section 6: Résultats */}
        {resultsCount > 0 && (
          <Section title="Résultats" icon={<FileText className="h-4 w-4" />}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Subventions trouvées</span>
                <Badge className="bg-[#06D6A0] text-white">{resultsCount}</Badge>
              </div>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  asChild
                  data-testid={`button-view-results-${submission.sessionId}`}
                >
                  <a href={`/results?sessionId=${submission.sessionId}`} target="_blank">
                    Voir les résultats
                  </a>
                </Button>
                
                {submission.pdfPath && (
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="w-full bg-[#06D6A0] hover:bg-[#4a4325]"
                    asChild
                    data-testid={`button-download-pdf-${submission.sessionId}`}
                  >
                    <a href={`/api/pdf/${submission.sessionId}`} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger le PDF
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </Section>
        )}
      </div>
    </Card>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 pb-2 border-b">
        {icon}
        {title}
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-500 uppercase">{label}</label>
      <div>{children}</div>
    </div>
  );
}
