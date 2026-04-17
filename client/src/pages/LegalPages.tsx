import { useLocation } from "wouter";

function LegalLayout({ title, children }: { title: string; children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 md:px-8 py-4 sm:py-6 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <a href="/" onClick={(e) => { e.preventDefault(); setLocation("/"); }}>
            <span className="text-lg sm:text-xl font-light tracking-tight text-black">
              Subvention<span className="font-bold">Match</span>
            </span>
          </a>
        </div>
      </header>
      <main className="pt-24 pb-16 px-4 sm:px-6 md:px-8">
        <div className="max-w-3xl mx-auto prose prose-gray prose-sm">
          <h1 className="text-3xl font-bold tracking-tight mb-8">{title}</h1>
          {children}
        </div>
      </main>
      <footer className="border-t border-gray-200 py-6 px-4 text-center text-xs text-gray-400">
        <a href="/mentions-legales" className="hover:underline mx-2">Mentions legales</a>
        <a href="/cgv" className="hover:underline mx-2">CGV</a>
        <a href="/confidentialite" className="hover:underline mx-2">Politique de confidentialite</a>
      </footer>
    </div>
  );
}

// --- MENTIONS LEGALES ---
export function MentionsLegales() {
  return (
    <LegalLayout title="Mentions legales">
      <h2>Editeur du site</h2>
      <p>
        SubventionMatch est edite par Oscar DC Studio.<br />
        Statut : Micro-entreprise<br />
        Email de contact : <a href="mailto:contact@subventionmatch.fr">contact@subventionmatch.fr</a>
      </p>

      <h2>Hebergement</h2>
      <p>
        Le site est heberge par <strong>Railway Corp.</strong>, 548 Market St, San Francisco, CA 94104, USA.<br />
        La base de donnees est hebergee par <strong>Supabase Inc.</strong>, region EU-West (Paris).
      </p>

      <h2>Propriete intellectuelle</h2>
      <p>
        L'ensemble du contenu du site (textes, graphismes, logiciels, mise en page) est la propriete
        exclusive de SubventionMatch, sauf mention contraire. Toute reproduction, meme partielle, est
        soumise a autorisation prealable.
      </p>
      <p>
        Les informations relatives aux subventions proviennent de sources publiques et sont fournies
        a titre indicatif. SubventionMatch ne saurait etre tenu responsable d'eventuelles erreurs ou
        omissions.
      </p>

      <h2>Responsabilite</h2>
      <p>
        SubventionMatch propose un service d'aide a l'identification de subventions culturelles via
        intelligence artificielle. Les resultats ne constituent ni un conseil juridique, ni une garantie
        d'obtention de financement. L'utilisateur reste seul responsable de ses demarches de candidature.
      </p>
    </LegalLayout>
  );
}

// --- CONDITIONS GENERALES DE VENTE ---
export function CGV() {
  return (
    <LegalLayout title="Conditions generales de vente">
      <p><em>Dernieres mise a jour : avril 2026</em></p>

      <h2>1. Objet</h2>
      <p>
        Les presentes CGV regissent la vente du service SubventionMatch, qui consiste en un
        rapport personnalise de subventions culturelles identifiees par intelligence artificielle,
        delivre sous forme de document PDF envoye par email.
      </p>

      <h2>2. Prix</h2>
      <p>
        Le prix du rapport est de <strong>8 euros TTC</strong> (ou le tarif affiche au moment de l'achat).
        Le paiement est effectue en une seule fois via Stripe. Aucun abonnement n'est souscrit.
      </p>

      <h2>3. Livraison</h2>
      <p>
        Le rapport PDF est genere automatiquement et envoye par email a l'adresse fournie dans le formulaire,
        dans les minutes suivant la confirmation du paiement.
      </p>

      <h2>4. Droit de retractation</h2>
      <p>
        Conformement a l'article L221-28 du Code de la consommation, le droit de retractation ne
        s'applique pas aux contenus numeriques fournis immediatement apres l'achat. En completant
        le paiement, l'utilisateur accepte la livraison immediate du rapport et renonce expressement
        a son droit de retractation.
      </p>

      <h2>5. Limitation de responsabilite</h2>
      <p>
        SubventionMatch s'engage a fournir un service de qualite mais ne garantit pas l'exactitude
        ni l'exhaustivite des informations fournies. Les resultats sont generes par intelligence
        artificielle a partir de donnees publiques. Ils ne constituent pas un conseil professionnel.
      </p>

      <h2>6. Donnees personnelles</h2>
      <p>
        Voir notre <a href="/confidentialite">Politique de confidentialite</a>.
      </p>

      <h2>7. Droit applicable</h2>
      <p>
        Les presentes CGV sont soumises au droit francais. En cas de litige, les tribunaux
        francais seront seuls competents.
      </p>
    </LegalLayout>
  );
}

// --- POLITIQUE DE CONFIDENTIALITE ---
export function PolitiqueConfidentialite() {
  return (
    <LegalLayout title="Politique de confidentialite">
      <p><em>Dernieres mise a jour : avril 2026</em></p>

      <h2>1. Responsable du traitement</h2>
      <p>
        Le responsable du traitement est Oscar DC Studio, editeur de SubventionMatch.<br />
        Contact : <a href="mailto:contact@subventionmatch.fr">contact@subventionmatch.fr</a>
      </p>

      <h2>2. Donnees collectees</h2>
      <p>Nous collectons uniquement les donnees necessaires au fonctionnement du service :</p>
      <ul>
        <li><strong>Adresse email</strong> : pour envoyer le rapport de subventions</li>
        <li><strong>Reponses au formulaire</strong> (statut, domaine artistique, region, description du projet) :
          pour identifier les subventions pertinentes via notre algorithme IA</li>
        <li><strong>Donnees de paiement</strong> : traitees exclusivement par Stripe. Nous ne stockons
          aucun numero de carte bancaire.</li>
      </ul>

      <h2>3. Finalites du traitement</h2>
      <ul>
        <li>Fourniture du service de matching (identification de subventions)</li>
        <li>Generation et envoi du rapport PDF</li>
        <li>Amelioration de la qualite du matching IA (donnees anonymisees)</li>
        <li>Statistiques d'utilisation (via PostHog, instance EU)</li>
      </ul>

      <h2>4. Base legale</h2>
      <p>
        Le traitement repose sur l'<strong>execution du contrat</strong> (fourniture du service) et
        le <strong>consentement</strong> (analytics).
      </p>

      <h2>5. Duree de conservation</h2>
      <ul>
        <li>Donnees du formulaire et resultats : <strong>12 mois</strong> apres la soumission</li>
        <li>Donnees de paiement chez Stripe : selon les obligations legales de Stripe</li>
        <li>Donnees analytics : <strong>24 mois</strong></li>
      </ul>

      <h2>6. Partage des donnees</h2>
      <p>Vos donnees sont partagees uniquement avec nos sous-traitants techniques :</p>
      <ul>
        <li><strong>Supabase</strong> (base de donnees, region EU Paris)</li>
        <li><strong>Stripe</strong> (paiement)</li>
        <li><strong>Resend</strong> (envoi d'emails)</li>
        <li><strong>OpenRouter / DeepSeek</strong> (matching IA — seules les donnees du formulaire
          sont transmises, sans identification personnelle)</li>
        <li><strong>PostHog</strong> (analytics, instance EU — si consentement donne)</li>
        <li><strong>Sentry</strong> (monitoring d'erreurs — si consentement donne)</li>
      </ul>
      <p>Aucune donnee n'est vendue a des tiers.</p>

      <h2>7. Vos droits (RGPD)</h2>
      <p>Conformement au RGPD, vous disposez des droits suivants :</p>
      <ul>
        <li><strong>Acces</strong> : obtenir une copie de vos donnees</li>
        <li><strong>Rectification</strong> : corriger des donnees inexactes</li>
        <li><strong>Effacement</strong> : demander la suppression de vos donnees</li>
        <li><strong>Opposition</strong> : refuser le traitement a des fins de statistiques</li>
        <li><strong>Portabilite</strong> : recevoir vos donnees dans un format lisible par machine</li>
      </ul>
      <p>
        Pour exercer ces droits, contactez-nous a{" "}
        <a href="mailto:contact@subventionmatch.fr">contact@subventionmatch.fr</a>.
        Nous nous engageons a repondre sous 30 jours.
      </p>

      <h2>8. Cookies</h2>
      <p>
        SubventionMatch utilise des cookies strictement necessaires au fonctionnement du site.
        Les cookies d'analytics (PostHog) et de monitoring (Sentry) ne sont actives qu'avec
        votre consentement explicite via la banniere cookies.
      </p>

      <h2>9. Reclamation</h2>
      <p>
        En cas de reclamation, vous pouvez contacter la CNIL :{" "}
        <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>
      </p>
    </LegalLayout>
  );
}
