import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileData {
  // Step 1 – Formation
  universite: string;
  masterStatut: string;
  masterSpecialite: string;
  philoDomaines: string[];
  mathsDomaines: string[];

  // Step 2 – Travaux
  travauxActuels: string;
  themeMémoire: string;
  publications: string;
  questionsObsessionnelles: string;
  approche: string;

  // Step 3 – Compétences
  langages: string[];
  frameworksML: string[];
  niveauCoding: string;
  experienceLLM: string[];

  // Step 4 – Vision
  angleSecurite: string[];
  problemPhiloStatement: string;
  posture: string;
  influencesChercheurs: string;

  // Step 5 – Pratique
  disponibilite: string;
  contrats: string[];
  salaireMin: string;
  remote: string;
  contraintesMobilite: string;
}

const EMPTY: ProfileData = {
  universite: "",
  masterStatut: "",
  masterSpecialite: "",
  philoDomaines: [],
  mathsDomaines: [],
  travauxActuels: "",
  themeMémoire: "",
  publications: "",
  questionsObsessionnelles: "",
  approche: "",
  langages: [],
  frameworksML: [],
  niveauCoding: "",
  experienceLLM: [],
  angleSecurite: [],
  problemPhiloStatement: "",
  posture: "",
  influencesChercheurs: "",
  disponibilite: "",
  contrats: [],
  salaireMin: "",
  remote: "",
  contraintesMobilite: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toggle(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 accent-indigo-600"
      />
      {label}
    </label>
  );
}

function Radio({
  name,
  value,
  current,
  onChange,
  label,
}: {
  name: string;
  value: string;
  current: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
      <input
        type="radio"
        name={name}
        value={value}
        checked={current === value}
        onChange={() => onChange(value)}
        className="w-4 h-4 accent-indigo-600"
      />
      {label}
    </label>
  );
}

// ─── Match scoring ─────────────────────────────────────────────────────────────

function computeMatches(d: ProfileData) {
  let anthropic = 0;
  let conjecture = 0;
  let mistral = 0;
  let openai = 0;

  // Philo background helps all, especially Anthropic & Conjecture
  if (d.philoDomaines.includes("Philosophie de l'esprit")) { anthropic += 15; conjecture += 10; }
  if (d.philoDomaines.includes("Éthique normative")) { anthropic += 10; openai += 10; }
  if (d.philoDomaines.includes("Logique formelle")) { conjecture += 15; anthropic += 10; }
  if (d.philoDomaines.includes("Épistémologie")) { anthropic += 8; openai += 8; }

  // Maths
  if (d.mathsDomaines.includes("Théorie des probabilités")) { anthropic += 10; mistral += 10; openai += 10; }
  if (d.mathsDomaines.includes("Logique mathématique")) { conjecture += 20; anthropic += 15; }
  if (d.mathsDomaines.includes("Théorie des catégories")) { conjecture += 15; }
  if (d.mathsDomaines.includes("Optimisation")) { mistral += 15; openai += 10; }
  if (d.mathsDomaines.includes("Statistiques")) { mistral += 10; openai += 10; }

  // Vision angle
  if (d.angleSecurite.includes("Alignement des valeurs")) { anthropic += 20; openai += 15; }
  if (d.angleSecurite.includes("Interprétabilité mécaniste")) { anthropic += 20; }
  if (d.angleSecurite.includes("Gouvernance / politique IA")) { openai += 15; anthropic += 10; }
  if (d.angleSecurite.includes("Sécurité formelle / vérification")) { conjecture += 20; }
  if (d.angleSecurite.includes("Conscience machine")) { anthropic += 15; conjecture += 10; }
  if (d.angleSecurite.includes("Risques existentiels")) { conjecture += 15; anthropic += 10; }

  // Coding level helps Mistral
  if (d.niveauCoding === "Avancé") { mistral += 20; openai += 10; }
  if (d.niveauCoding === "Intermédiaire") { mistral += 10; }

  // LLM experience
  if (d.experienceLLM.includes("Interprétabilité")) { anthropic += 15; }
  if (d.experienceLLM.includes("RLHF")) { anthropic += 15; openai += 15; }
  if (d.experienceLLM.includes("Fine-tuning")) { mistral += 15; openai += 10; }
  if (d.experienceLLM.includes("Red-teaming")) { openai += 15; anthropic += 10; }

  // Cap at 100
  const cap = (n: number) => Math.min(100, Math.round(n));
  return {
    anthropic: cap(anthropic),
    conjecture: cap(conjecture),
    mistral: cap(mistral),
    openai: cap(openai),
  };
}

function ScoreBar({ label, score, url }: { label: string; score: number; url: string }) {
  const color =
    score >= 70 ? "bg-emerald-500" : score >= 45 ? "bg-amber-400" : "bg-slate-300";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm font-medium">
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
          {label}
        </a>
        <span>{score}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

// ─── Summary view ─────────────────────────────────────────────────────────────

function Summary({ data, onBack }: { data: ProfileData; onBack: () => void }) {
  const scores = computeMatches(data);
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topMatch = sorted[0][0];

  const coverLetter = `Bonjour,

Je me permets de vous contacter suite à ma découverte de vos travaux en sécurité IA. Je suis ${data.masterStatut === "Obtenu" ? "titulaire" : "étudiant en"} d'un master en ${data.masterSpecialite || "Intelligence Artificielle"} (${data.universite || "à préciser"}), avec une formation parallèle en philosophie — notamment en ${data.philoDomaines.slice(0, 2).join(", ") || "logique et éthique"} — et une solide base mathématique en ${data.mathsDomaines.slice(0, 2).join(", ") || "logique formelle et probabilités"}.

${data.travauxActuels ? `Je travaille actuellement sur : ${data.travauxActuels}.` : ""}

Ce qui m'intéresse particulièrement dans votre organisation, c'est l'articulation entre rigueur formelle et questions philosophiques profondes sur l'alignement. ${data.problemPhiloStatement || "Je pense que la sécurité IA est avant tout un problème de définition — et donc philosophique."}

${data.influencesChercheurs ? `Mes influences principales : ${data.influencesChercheurs}.` : ""}

Je suis disponible ${data.disponibilite || "rapidement"} et ouvert à un échange pour explorer si ma trajectoire peut correspondre à vos besoins.

Cordialement,
Achraf Daghar`;

  const urls: Record<string, string> = {
    anthropic: "https://anthropic.com/careers",
    conjecture: "https://conjecture.dev",
    mistral: "https://mistral.ai/careers",
    openai: "https://openai.com/careers",
  };

  const labels: Record<string, string> = {
    anthropic: "Anthropic",
    conjecture: "Conjecture (Paris)",
    mistral: "Mistral AI",
    openai: "OpenAI",
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profil — Achraf Daghar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <div><span className="text-slate-500">Formation</span><p className="font-medium">{data.masterSpecialite || "—"} · {data.universite || "—"}</p></div>
            <div><span className="text-slate-500">Statut</span><p className="font-medium">{data.masterStatut || "—"}</p></div>
            <div><span className="text-slate-500">Philo</span><p className="font-medium">{data.philoDomaines.join(", ") || "—"}</p></div>
            <div><span className="text-slate-500">Maths</span><p className="font-medium">{data.mathsDomaines.join(", ") || "—"}</p></div>
            <div><span className="text-slate-500">Coding</span><p className="font-medium">{data.niveauCoding || "—"}</p></div>
            <div><span className="text-slate-500">Dispo</span><p className="font-medium">{data.disponibilite || "—"} · {data.remote || "—"}</p></div>
          </div>
          {data.travauxActuels && (
            <div>
              <span className="text-slate-500">Travaux actuels</span>
              <p className="font-medium">{data.travauxActuels}</p>
            </div>
          )}
          {data.questionsObsessionnelles && (
            <div>
              <span className="text-slate-500">Questions obsessionnelles</span>
              <p className="font-medium">{data.questionsObsessionnelles}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-2 pt-1">
            {data.angleSecurite.map((a) => <Badge key={a} variant="secondary">{a}</Badge>)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Match entreprises</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sorted.map(([key, score]) => (
            <ScoreBar key={key} label={labels[key]} score={score} url={urls[key]} />
          ))}
          <p className="text-xs text-slate-500 pt-1">
            Meilleur match : <strong>{labels[topMatch]}</strong> — postuler en priorité.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Brouillon de mail de contact</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap text-sm font-mono bg-slate-50 rounded-lg p-4 border text-slate-700 leading-relaxed">
            {coverLetter}
          </pre>
          <Button
            variant="outline"
            className="mt-3 w-full"
            onClick={() => navigator.clipboard.writeText(coverLetter)}
          >
            Copier le mail
          </Button>
        </CardContent>
      </Card>

      <Button variant="ghost" onClick={onBack} className="w-full text-slate-500">
        Modifier le profil
      </Button>
    </div>
  );
}

// ─── Steps ────────────────────────────────────────────────────────────────────

const STEPS = ["Formation", "Travaux", "Compétences", "Vision IA", "Pratique"];

function StepFormation({ data, set }: { data: ProfileData; set: (d: Partial<ProfileData>) => void }) {
  const philoOptions = [
    "Épistémologie", "Logique formelle", "Philosophie de l'esprit",
    "Éthique normative", "Métaphysique", "Philo des sciences", "Philo du langage",
  ];
  const mathsOptions = [
    "Logique mathématique", "Théorie des probabilités", "Théorie des catégories",
    "Optimisation", "Algèbre", "Topologie", "Théorie de la mesure", "Statistiques",
  ];
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Université / École</Label>
        <Input placeholder="ex. ENS Paris, Sorbonne, INSA..." value={data.universite} onChange={(e) => set({ universite: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Statut du master</Label>
        <div className="flex flex-col gap-2">
          {["Obtenu", "En cours"].map((v) => (
            <Radio key={v} name="masterStatut" value={v} current={data.masterStatut} onChange={(v) => set({ masterStatut: v })} label={v} />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Spécialité exacte du master IA</Label>
        <Input placeholder="ex. Machine Learning, NLP, IA et sciences cognitives..." value={data.masterSpecialite} onChange={(e) => set({ masterSpecialite: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Background philosophique</Label>
        <div className="grid grid-cols-2 gap-2">
          {philoOptions.map((o) => (
            <Checkbox key={o} label={o} checked={data.philoDomaines.includes(o)} onChange={() => set({ philoDomaines: toggle(data.philoDomaines, o) })} />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Domaines mathématiques de prédilection</Label>
        <div className="grid grid-cols-2 gap-2">
          {mathsOptions.map((o) => (
            <Checkbox key={o} label={o} checked={data.mathsDomaines.includes(o)} onChange={() => set({ mathsDomaines: toggle(data.mathsDomaines, o) })} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StepTravaux({ data, set }: { data: ProfileData; set: (d: Partial<ProfileData>) => void }) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Sur quoi travailles-tu en ce moment ?</Label>
        <Textarea placeholder="Projet, sujet de réflexion, recherche en cours..." value={data.travauxActuels} onChange={(e) => set({ travauxActuels: e.target.value })} rows={3} />
      </div>
      <div className="space-y-2">
        <Label>Thème de ton mémoire / thesis</Label>
        <Input placeholder="Titre ou sujet approximatif" value={data.themeMémoire} onChange={(e) => set({ themeMémoire: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Publications, articles, essais (même non publiés)</Label>
        <Textarea placeholder="Liste et brèves descriptions..." value={data.publications} onChange={(e) => set({ publications: e.target.value })} rows={3} />
      </div>
      <div className="space-y-2">
        <Label>Questions qui t'obsèdent</Label>
        <Textarea placeholder="Les problèmes sur lesquels tu reviens toujours..." value={data.questionsObsessionnelles} onChange={(e) => set({ questionsObsessionnelles: e.target.value })} rows={3} />
      </div>
      <div className="space-y-2">
        <Label>Ton approche naturelle</Label>
        <div className="flex flex-col gap-2">
          {["Plutôt conceptuelle / argumentative", "Plutôt formelle / mathématique", "Plutôt empirique / expérimentale", "Mixte"].map((v) => (
            <Radio key={v} name="approche" value={v} current={data.approche} onChange={(v) => set({ approche: v })} label={v} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StepCompetences({ data, set }: { data: ProfileData; set: (d: Partial<ProfileData>) => void }) {
  const langages = ["Python", "Julia", "Lean / Coq (proof assistants)", "Haskell", "R", "Rust", "Aucun"];
  const frameworks = ["PyTorch", "JAX", "HuggingFace Transformers", "scikit-learn", "Aucun"];
  const llmExp = ["Prompting avancé / jailbreaking", "Fine-tuning", "Interprétabilité", "Red-teaming", "RLHF / RLAIF", "Évaluation de modèles"];
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Langages de programmation</Label>
        <div className="grid grid-cols-2 gap-2">
          {langages.map((o) => (
            <Checkbox key={o} label={o} checked={data.langages.includes(o)} onChange={() => set({ langages: toggle(data.langages, o) })} />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Frameworks ML</Label>
        <div className="grid grid-cols-2 gap-2">
          {frameworks.map((o) => (
            <Checkbox key={o} label={o} checked={data.frameworksML.includes(o)} onChange={() => set({ frameworksML: toggle(data.frameworksML, o) })} />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Niveau coding général</Label>
        <div className="flex flex-col gap-2">
          {["Aucun / très basique", "Débutant (scripts simples)", "Intermédiaire", "Avancé"].map((v) => (
            <Radio key={v} name="niveauCoding" value={v} current={data.niveauCoding} onChange={(v) => set({ niveauCoding: v })} label={v} />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Expérience directe avec les LLMs</Label>
        <div className="grid grid-cols-2 gap-2">
          {llmExp.map((o) => (
            <Checkbox key={o} label={o} checked={data.experienceLLM.includes(o)} onChange={() => set({ experienceLLM: toggle(data.experienceLLM, o) })} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StepVision({ data, set }: { data: ProfileData; set: (d: Partial<ProfileData>) => void }) {
  const angles = [
    "Alignement des valeurs", "Interprétabilité mécaniste",
    "Gouvernance / politique IA", "Sécurité formelle / vérification",
    "Conscience machine", "Risques existentiels", "Éthique computationnelle",
  ];
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Angles qui t'intéressent dans la sécurité IA</Label>
        <div className="grid grid-cols-2 gap-2">
          {angles.map((o) => (
            <Checkbox key={o} label={o} checked={data.angleSecurite.includes(o)} onChange={() => set({ angleSecurite: toggle(data.angleSecurite, o) })} />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>En une phrase : pourquoi l'IA est un problème philosophique et pas juste technique ?</Label>
        <Textarea placeholder="Ta réponse sera utilisée dans le mail de contact..." value={data.problemPhiloStatement} onChange={(e) => set({ problemPhiloStatement: e.target.value })} rows={3} />
      </div>
      <div className="space-y-2">
        <Label>Ta posture sur les risques IA</Label>
        <div className="flex flex-col gap-2">
          {[
            "Pessimiste / risque existentiel réel",
            "Prudent mais optimiste",
            "Sceptique sur les risques LT, focalisé risques CT",
            "Indéterminé / en construction",
          ].map((v) => (
            <Radio key={v} name="posture" value={v} current={data.posture} onChange={(v) => set({ posture: v })} label={v} />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Chercheurs / penseurs qui t'influencent</Label>
        <Input placeholder="ex. Stuart Russell, Paul Christiano, Nick Bostrom..." value={data.influencesChercheurs} onChange={(e) => set({ influencesChercheurs: e.target.value })} />
      </div>
    </div>
  );
}

function StepPratique({ data, set }: { data: ProfileData; set: (d: Partial<ProfileData>) => void }) {
  const contrats = ["CDI", "CDD", "Fellowship / bourse de recherche", "Freelance / consulting", "Peu importe"];
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Disponibilité</Label>
        <div className="flex flex-col gap-2">
          {["Maintenant", "Dans 1 mois", "Dans 3 mois", "Flexible"].map((v) => (
            <Radio key={v} name="dispo" value={v} current={data.disponibilite} onChange={(v) => set({ disponibilite: v })} label={v} />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Type de contrat souhaité</Label>
        <div className="grid grid-cols-2 gap-2">
          {contrats.map((o) => (
            <Checkbox key={o} label={o} checked={data.contrats.includes(o)} onChange={() => set({ contrats: toggle(data.contrats, o) })} />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Salaire minimum annuel brut</Label>
        <div className="flex flex-col gap-2">
          {["< 30 000 €", "30 000 – 45 000 €", "45 000 – 60 000 €", "60 000 – 80 000 €", "80 000 €+"].map((v) => (
            <Radio key={v} name="salaire" value={v} current={data.salaireMin} onChange={(v) => set({ salaireMin: v })} label={v} />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Remote</Label>
        <div className="flex flex-col gap-2">
          {["Full remote", "Hybride OK", "Présentiel uniquement"].map((v) => (
            <Radio key={v} name="remote" value={v} current={data.remote} onChange={(v) => set({ remote: v })} label={v} />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Contraintes ou préférences de mobilité (facultatif)</Label>
        <Textarea placeholder="Villes, pays, situations particulières..." value={data.contraintesMobilite} onChange={(e) => set({ contraintesMobilite: e.target.value })} rows={2} />
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AchrafProfile() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [data, setData] = useState<ProfileData>(EMPTY);

  function set(patch: Partial<ProfileData>) {
    setData((prev) => ({ ...prev, ...patch }));
  }

  const stepComponents = [
    <StepFormation data={data} set={set} />,
    <StepTravaux data={data} set={set} />,
    <StepCompetences data={data} set={set} />,
    <StepVision data={data} set={set} />,
    <StepPratique data={data} set={set} />,
  ];

  if (done) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-slate-900">Profil Achraf Daghar</h1>
          <Summary data={data} onBack={() => setDone(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Profil recherche d'emploi</h1>
          <p className="text-slate-500 text-sm mt-1">Achraf Daghar — Philosophie · IA · Mathématiques</p>
        </div>

        {/* Progress */}
        <div className="flex gap-1">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-indigo-600" : "bg-slate-200"}`}
            />
          ))}
        </div>
        <p className="text-xs text-slate-400">{step + 1} / {STEPS.length} — {STEPS[step]}</p>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{STEPS[step]}</CardTitle>
          </CardHeader>
          <CardContent>{stepComponents[step]}</CardContent>
        </Card>

        <div className="flex gap-3">
          {step > 0 && (
            <Button variant="outline" className="flex-1" onClick={() => setStep((s) => s - 1)}>
              Retour
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => setStep((s) => s + 1)}>
              Suivant
            </Button>
          ) : (
            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => setDone(true)}>
              Voir le profil
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
