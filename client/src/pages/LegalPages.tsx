import { useLocation, Link } from "wouter";

function LegalLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "var(--mc-bg)", color: "var(--mc-text)" }}>
      <header className="mc-section-rule">
        <div className="max-w-6xl mx-auto px-6 md:px-8 h-14 flex items-center justify-between">
          <Link href="/">
            <a className="mc-display text-lg" style={{ textDecoration: "none", color: "var(--mc-text)" }}>
              Mecene<span style={{ color: "var(--mc-primary)" }}>.</span>
            </a>
          </Link>
          <nav className="hidden md:flex items-center gap-6 mc-mono text-xs uppercase tracking-widest" style={{ color: "var(--mc-muted)" }}>
            <Link href="/"><a className="hover:text-white transition" style={{ textDecoration: "none", color: "inherit" }}>Accueil</a></Link>
            <Link href="/mentions-legales"><a className="hover:text-white transition" style={{ textDecoration: "none", color: "inherit" }}>Mentions</a></Link>
            <Link href="/cgv"><a className="hover:text-white transition" style={{ textDecoration: "none", color: "inherit" }}>CGV</a></Link>
            <Link href="/confidentialite"><a className="hover:text-white transition" style={{ textDecoration: "none", color: "inherit" }}>Confidentialité</a></Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 md:px-8 py-20">
        <div className="mc-mono text-xs uppercase tracking-widest mb-10" style={{ color: "var(--mc-primary)" }}>/ Informations légales</div>
        <h1 className="mc-display text-5xl md:text-6xl mb-10">{title.toUpperCase()}<span style={{ color: "var(--mc-primary)" }}>.</span></h1>
        <div className="legal-content space-y-6" style={{ color: "var(--mc-muted)" }}>
          {children}
        </div>
      </main>

      <footer className="mc-section-rule">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 mc-mono text-xs uppercase tracking-widest flex flex-wrap justify-between gap-4" style={{ color: "var(--mc-muted)" }}>
          <span>© 2026 Mecene · Paris</span>
          <span className="flex gap-6">
            <Link href="/"><a className="hover:text-white transition" style={{ textDecoration: "none", color: "inherit" }}>Accueil</a></Link>
            <a href="mailto:contact@mecene.app" className="hover:text-white transition" style={{ textDecoration: "none", color: "inherit" }}>Contact</a>
          </span>
        </div>
      </footer>

      <style>{`
        .legal-content h2 {
          font-family: 'Archivo', sans-serif;
          font-weight: 800;
          letter-spacing: -0.02em;
          font-size: 1.5rem;
          color: var(--mc-text);
          margin-top: 3rem;
          margin-bottom: 1rem;
        }
        .legal-content p, .legal-content li {
          line-height: 1.7;
          font-size: 0.95rem;
        }
        .legal-content p + p { margin-top: 0.75rem; }
        .legal-content ul {
          list-style: disc;
          padding-left: 1.25rem;
          margin: 0.5rem 0 1rem;
        }
        .legal-content ul li { margin-bottom: 0.4rem; }
        .legal-content a { color: var(--mc-primary); }
        .legal-content a:hover { text-decoration: underline; }
        .legal-content strong { color: var(--mc-text); font-weight: 600; }
        .legal-content em { color: var(--mc-muted-2); font-style: italic; }
      `}</style>
    </div>
  );
}

// --- MENTIONS LEGALES ---
export function MentionsLegales() {
  return (
    <LegalLayout title="Mentions légales">
      <h2>Éditeur du site</h2>
      <p>
        <strong>Mecene</strong> est édité par Oscar DC Studio, entrepreneur individuel.<br />
        Email de contact : <a href="mailto:contact@mecene.app">contact@mecene.app</a>
      </p>

      <h2>Hébergement</h2>
      <p>
        Le site est hébergé par <strong>Railway Corp.</strong> (San Francisco, USA).<br />
        La base de données est hébergée par <strong>Supabase Inc.</strong>, région EU-West (Paris).
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        L'ensemble du contenu éditorial (textes, logos, interface) est la propriété exclusive de
        Mecene, sauf mention contraire. Les informations sur les dispositifs de subvention proviennent
        de sources publiques et sont fournies à titre indicatif.
      </p>
      <p>
        Mecene ne saurait être tenu responsable d'éventuelles erreurs ou omissions.
        <strong> Toujours vérifier les conditions auprès de l'organisme émetteur avant tout dépôt de dossier.</strong>
      </p>

      <h2>Responsabilité</h2>
      <p>
        Mecene propose un service d'aide à l'identification de subventions culturelles via
        intelligence artificielle. Les résultats ne constituent ni un conseil juridique, ni une garantie
        d'obtention de financement. L'utilisateur reste seul responsable de ses démarches de candidature.
      </p>
    </LegalLayout>
  );
}

// --- CGV ---
export function CGV() {
  return (
    <LegalLayout title="Conditions générales de vente">
      <p><em>Dernière mise à jour : avril 2026</em></p>

      <h2>1. Objet</h2>
      <p>
        Les présentes CGV régissent l'utilisation du service Mecene : moteur de matching entre
        profils de créateurs culturels et dispositifs de subvention publique.
      </p>

      <h2>2. Accès au service</h2>
      <p>
        <strong>Pendant la phase beta</strong> (en cours), l'intégralité du service est gratuite,
        sans carte bancaire et sans abonnement. Aucune donnée de paiement n'est collectée.
      </p>
      <p>
        À l'issue de la beta (V1), un accès premium sera proposé. Les beta-testeurs inscrits
        bénéficieront d'un tarif de lancement dédié.
      </p>

      <h2>3. Utilisation du service</h2>
      <p>L'utilisateur s'engage à :</p>
      <ul>
        <li>fournir des informations exactes lors du diagnostic</li>
        <li>ne pas utiliser le service à des fins automatisées ou de scraping massif</li>
        <li>ne pas tenter de contourner les limites techniques du service</li>
      </ul>

      <h2>4. Limitation de responsabilité</h2>
      <p>
        Mecene est un outil d'aide à la décision. Les matches proposés sont indicatifs : l'utilisateur
        reste seul responsable du dépôt effectif de son dossier, de la véracité des informations
        communiquées à l'organisme émetteur, et du respect des critères d'éligibilité.
      </p>

      <h2>5. Rétractation &amp; remboursement</h2>
      <p>
        La version beta étant gratuite, aucune rétractation n'est applicable. Pour la V1 payante,
        un délai légal de rétractation de 14 jours sera applicable conformément au Code de la
        consommation, sauf exécution immédiate du service demandée par l'utilisateur.
      </p>

      <h2>6. Données personnelles</h2>
      <p>
        Voir notre <a href="/confidentialite">Politique de confidentialité</a>.
      </p>

      <h2>7. Droit applicable</h2>
      <p>
        Droit français. En cas de litige, une tentative de résolution amiable sera toujours
        privilégiée. À défaut, les tribunaux compétents sont ceux de Paris.
      </p>
    </LegalLayout>
  );
}

// --- POLITIQUE DE CONFIDENTIALITÉ ---
export function PolitiqueConfidentialite() {
  return (
    <LegalLayout title="Politique de confidentialité">
      <p><em>Dernière mise à jour : avril 2026</em></p>

      <h2>Responsable du traitement</h2>
      <p>
        Le responsable du traitement est Oscar DC Studio, éditeur de Mecene.<br />
        Contact : <a href="mailto:privacy@mecene.app">privacy@mecene.app</a>
      </p>

      <h2>Ce qu'on collecte</h2>
      <ul>
        <li><strong>Réponses au formulaire</strong> (profil, discipline, projet, budget) nécessaires au matching</li>
        <li><strong>Email</strong> si vous choisissez de recevoir les résultats par email ou de rejoindre la waitlist</li>
        <li><strong>Données techniques minimales</strong> via logs serveur</li>
      </ul>

      <h2>Ce qu'on ne collecte pas</h2>
      <ul>
        <li>Pas de cookies publicitaires</li>
        <li>Pas de trackers tiers (Facebook Pixel, Google Analytics, etc.)</li>
        <li>Pas de carte bancaire pendant la beta</li>
      </ul>

      <h2>Ce qu'on en fait</h2>
      <p>
        Les réponses au formulaire sont envoyées à notre modèle IA (DeepSeek via OpenRouter)
        pour produire votre rapport. Elles sont ensuite stockées anonymement sur Supabase (UE),
        uniquement pour améliorer la qualité du matching.
      </p>
      <p>
        Votre email, s'il est fourni, sert uniquement à vous envoyer les résultats et à vous
        prévenir de la sortie de la V1. Il ne sera jamais revendu ni partagé.
      </p>

      <h2>Sous-traitants</h2>
      <ul>
        <li><strong>Supabase</strong> — base de données (EU-West / Paris)</li>
        <li><strong>Resend</strong> — envoi d'emails</li>
        <li><strong>OpenRouter / DeepSeek</strong> — matching IA (sans identification personnelle)</li>
        <li><strong>PostHog</strong> — analytics (EU, si consentement)</li>
        <li><strong>Sentry</strong> — monitoring d'erreurs (si consentement)</li>
      </ul>

      <h2>Durée de conservation</h2>
      <ul>
        <li>Données du formulaire : 12 mois après la soumission</li>
        <li>Email waitlist : jusqu'à désinscription</li>
        <li>Analytics : 24 mois</li>
      </ul>

      <h2>Vos droits (RGPD)</h2>
      <p>Accès, rectification, portabilité, suppression. Écrivez à <a href="mailto:privacy@mecene.app">privacy@mecene.app</a>. Réponse sous 30 jours.</p>

      <h2>Réclamation</h2>
      <p>
        En cas de réclamation, vous pouvez contacter la CNIL :{" "}
        <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>
      </p>
    </LegalLayout>
  );
}
