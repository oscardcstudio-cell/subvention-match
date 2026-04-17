import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Mail,
  MapPin,
  Target,
  Lightbulb,
  Users,
  Clock,
  DollarSign,
  FileText,
  Download,
} from "lucide-react";
import type { FormSubmission } from "@shared/schema";

/**
 * Centralisation des URLs côté admin — si la route change, un seul endroit à
 * modifier.
 */
const urls = {
  results: (sessionId: string) => `/results?sessionId=${sessionId}`,
  pdf: (sessionId: string) => `/api/pdf/${sessionId}`,
};

/**
 * Helpers d'affichage
 */
function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 pb-2 border-b">
        {icon}
        {title}
      </div>
      <div className="space-y-3">{children}</div>
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

/**
 * Rend une liste de badges + un badge "Autre" si `other` est rempli.
 * Pattern répété 6x dans l'ancienne version.
 */
function BadgeList({
  items,
  other,
  colorClass,
}: {
  items: readonly string[] | null | undefined;
  other?: string | null;
  colorClass?: string;
}) {
  const safeItems = items ?? [];
  if (safeItems.length === 0 && !other) {
    return <span className="text-xs text-gray-400 italic">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {safeItems.map((item, i) => (
        <Badge
          key={`${item}-${i}`}
          className={colorClass ?? "bg-gray-100 text-gray-700"}
          variant={colorClass ? undefined : "secondary"}
        >
          {item}
        </Badge>
      ))}
      {other && (
        <Badge variant="outline" className="text-xs">
          {other}
        </Badge>
      )}
    </div>
  );
}

/**
 * Sections
 */
function ProfileSection({ s }: { s: FormSubmission }) {
  return (
    <Section title="Profil créatif" icon={<Users className="h-4 w-4" />}>
      <Field label="Statut">
        <BadgeList items={s.status} other={s.statusOther} />
      </Field>
      <Field label="Domaine artistique">
        <BadgeList
          items={s.artisticDomain}
          other={s.artisticDomainOther}
          colorClass="bg-purple-100 text-purple-700 text-xs"
        />
      </Field>
    </Section>
  );
}

function ContactSection({ s }: { s: FormSubmission }) {
  return (
    <Section title="Contact & Localisation" icon={<MapPin className="h-4 w-4" />}>
      <Field label="Email">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-mono">{s.email}</span>
        </div>
      </Field>
      <Field label="Région">
        <Badge className="bg-blue-100 text-blue-700">{s.region}</Badge>
      </Field>
      <Field label="International">
        <Badge variant={s.isInternational === "Oui" ? "default" : "secondary"}>
          {s.isInternational ?? "—"}
        </Badge>
      </Field>
    </Section>
  );
}

function ProjectSection({ s }: { s: FormSubmission }) {
  return (
    <Section title="Projet" icon={<Target className="h-4 w-4" />}>
      <Field label="Description">
        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
          {s.projectDescription || <span className="italic text-gray-400">—</span>}
        </p>
      </Field>
      <Field label="Type de projet">
        <BadgeList items={s.projectType} other={s.projectTypeOther} />
      </Field>
      <Field label="Stade du projet">
        {s.projectStage ? (
          <Badge className="bg-orange-100 text-orange-700">{s.projectStage}</Badge>
        ) : (
          <span className="text-xs text-gray-400 italic">—</span>
        )}
      </Field>
    </Section>
  );
}

function ImpactSection({ s }: { s: FormSubmission }) {
  return (
    <Section title="Innovation & Impact" icon={<Lightbulb className="h-4 w-4" />}>
      <Field label="Innovation">
        <BadgeList
          items={s.innovation}
          other={s.innovationOther}
          colorClass="bg-pink-100 text-pink-700 text-xs"
        />
      </Field>
      {s.socialDimension && s.socialDimension.length > 0 && (
        <Field label="Dimension sociale">
          <BadgeList
            items={s.socialDimension}
            other={s.socialDimensionOther}
            colorClass="bg-teal-100 text-teal-700 text-xs"
          />
        </Field>
      )}
    </Section>
  );
}

function NeedsSection({ s }: { s: FormSubmission }) {
  return (
    <Section title="Besoins" icon={<DollarSign className="h-4 w-4" />}>
      <Field label="Urgence">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400" />
          {s.urgency ? (
            <Badge className="bg-red-100 text-red-700">{s.urgency}</Badge>
          ) : (
            <span className="text-xs text-gray-400 italic">—</span>
          )}
        </div>
      </Field>
      <Field label="Types d'aide">
        <BadgeList
          items={s.aidTypes}
          other={s.aidTypesOther}
          colorClass="bg-green-100 text-green-700 text-xs"
        />
      </Field>
      <Field label="Périmètre géographique">
        <BadgeList items={s.geographicScope} />
      </Field>
    </Section>
  );
}

function ResultsSection({
  s,
  resultsCount,
}: {
  s: FormSubmission;
  resultsCount: number;
}) {
  if (resultsCount === 0) return null;
  return (
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
            data-testid={`button-view-results-${s.sessionId}`}
          >
            <a href={urls.results(s.sessionId)} target="_blank" rel="noopener noreferrer">
              Voir les résultats
            </a>
          </Button>
          {s.pdfPath && (
            <Button
              variant="default"
              size="sm"
              className="w-full bg-[#06D6A0] hover:bg-[#4a4325]"
              asChild
              data-testid={`button-download-pdf-${s.sessionId}`}
            >
              <a href={urls.pdf(s.sessionId)} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-2" />
                Télécharger le PDF
              </a>
            </Button>
          )}
        </div>
      </div>
    </Section>
  );
}

/**
 * Composant principal — affiche une soumission complète.
 */
export function SubmissionCard({ submission }: { submission: FormSubmission }) {
  const resultsCount = Array.isArray(submission.results) ? submission.results.length : 0;

  return (
    <Card className="p-6" data-testid={`card-submission-${submission.sessionId}`}>
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
            {new Date(submission.createdAt).toLocaleString("fr-FR")}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProfileSection s={submission} />
        <ContactSection s={submission} />
        <ProjectSection s={submission} />
        <ImpactSection s={submission} />
        <NeedsSection s={submission} />
        <ResultsSection s={submission} resultsCount={resultsCount} />
      </div>
    </Card>
  );
}
