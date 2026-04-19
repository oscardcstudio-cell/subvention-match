import { MatchCard } from "./ResultsPage";
import type { GrantResult } from "@shared/schema";

const base: GrantResult = {
  id: "demo-1",
  title: "Aide à la création musicale",
  organization: "Centre National de la Musique (CNM)",
  amount: "5 000 — 15 000 €",
  deadline: "",
  frequency: "Annuel",
  isRecurring: true,
  description:
    "Soutien aux compositeurs et interprètes pour la création d'œuvres musicales originales (enregistrement, composition, développement artistique).",
  eligibility:
    "Artiste-interprète ou compositeur professionnel avec un projet de création original.",
  applicationDifficulty: "moyen",
  matchScore: 87,
  matchReason:
    "Profil de producteur électronique et projet de création d'EP parfaitement alignés avec cette aide.",
  preparationAdvice:
    "Soigne la note d'intention artistique et joins des maquettes. Le CNM valorise la cohérence entre parcours et projet.",
  url: "https://cnm.fr",
  grantType: ["Aide à la création"],
  eligibleSectors: ["Musiques actuelles"],
};

const variants: Array<{ label: string; grant: GrantResult }> = [
  {
    label: "1. Deadline OK (récurrente, dans 3 mois)",
    grant: {
      ...base,
      deadline: "2026-07-15",
      deadlineStatus: "ok",
    },
  },
  {
    label: "2. Deadline TRÈS COURTE (récurrente, 10 jours)",
    grant: {
      ...base,
      deadline: "2026-04-28",
      deadlineStatus: "short-recurring",
      deadlineNotice:
        "Deadline très courte (10 jours) — monter un dossier solide en si peu de temps est risqué. Mieux vaut viser l'édition de l'année prochaine.",
    },
  },
  {
    label: "3. Édition PASSÉE (récurrente)",
    grant: {
      ...base,
      deadline: "2026-02-15",
      deadlineStatus: "passed-recurring",
      deadlineNotice:
        "Édition 2026 terminée — prochaine session attendue vers le 15 février 2027. Prépare ton dossier dès maintenant pour l'année prochaine.",
    },
  },
  {
    label: "4. URGENT (one-shot, 7 jours)",
    grant: {
      ...base,
      isRecurring: false,
      frequency: "Ponctuel",
      deadline: "2026-04-25",
      deadlineStatus: "urgent",
      deadlineNotice: "Urgent : il ne reste que 7 jours pour déposer le dossier.",
    },
  },
];

export default function CardPreviewPage() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--mc-bg)", color: "var(--mc-text)" }}
    >
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        <div>
          <h1 className="mc-display text-3xl mb-2">Preview — Deadline notices</h1>
          <p className="text-sm" style={{ color: "var(--mc-muted)" }}>
            4 variantes de la MatchCard selon le statut de la deadline.
          </p>
        </div>
        {variants.map((v, i) => (
          <section key={i} className="space-y-3">
            <div
              className="mc-mono text-[11px] uppercase tracking-widest"
              style={{ color: "var(--mc-muted-2)" }}
            >
              {v.label}
            </div>
            <MatchCard
              grant={v.grant}
              rank={i + 1}
              top={i === 0}
              feedback={undefined}
              onFeedback={() => {}}
              language="fr"
            />
          </section>
        ))}
      </div>
    </div>
  );
}
