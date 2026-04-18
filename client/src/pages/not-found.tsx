import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
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
            <Link href="/"><a className="hover:text-white transition">Accueil</a></Link>
            <Link href="/form"><a className="hover:text-white transition">Démarrer</a></Link>
          </nav>
        </div>
      </header>

      <section className="min-h-[calc(100vh-200px)] flex items-center">
        <div className="max-w-6xl mx-auto px-6 md:px-8 w-full grid grid-cols-12 gap-8 items-center py-20">
          <div className="col-span-12 md:col-span-7">
            <div className="mc-mono text-xs uppercase tracking-widest mb-10" style={{ color: "var(--mc-primary)" }}>/ Erreur 404</div>
            <h1 className="mc-display text-[128px] md:text-[200px]" style={{ lineHeight: 0.82 }}>
              404<span style={{ color: "var(--mc-primary)" }}>.</span>
            </h1>
            <h2 className="mc-display text-3xl md:text-4xl mt-6">
              CETTE PAGE<br />A DISPARU DU RADAR.
            </h2>
            <p className="mt-6 max-w-md leading-relaxed" style={{ color: "var(--mc-muted)" }}>
              Pas de panique. Soit le lien est cassé, soit la page a été déplacée, soit on a
              supprimé quelque chose qui ne servait pas. Les subventions, elles, sont toujours là.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/">
                <a
                  data-testid="button-home-404"
                  className="mc-btn-primary inline-flex items-center gap-2 px-5 py-3 rounded-full mc-mono text-xs uppercase tracking-widest"
                  style={{ textDecoration: "none" }}
                >
                  Retour à l'accueil <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </Link>
              <Link href="/form">
                <a
                  className="mc-btn-ghost inline-flex items-center gap-2 px-5 py-3 rounded-full mc-mono text-xs uppercase tracking-widest"
                  style={{ textDecoration: "none" }}
                >
                  Lancer un diagnostic
                </a>
              </Link>
            </div>
          </div>

          <div className="col-span-12 md:col-span-5">
            <div className="mc-card p-6">
              <div className="mc-mono text-xs uppercase tracking-widest mb-4" style={{ color: "var(--mc-muted)" }}>
                Peut-être cherchiez-vous
              </div>
              <ul className="mc-divide-border">
                {[
                  { href: "/", label: "La page d'accueil" },
                  { href: "/form", label: "Le formulaire de matching" },
                  { href: "/stats", label: "Les statistiques de la base" },
                  { href: "/data-quality", label: "La qualité des données" },
                  { href: "/mentions-legales", label: "Les mentions légales" },
                ].map((l) => (
                  <li key={l.href} className="py-3">
                    <Link href={l.href}>
                      <a
                        className="flex items-center justify-between group transition"
                        style={{ textDecoration: "none", color: "var(--mc-text)" }}
                      >
                        <span>{l.label}</span>
                        <ArrowRight className="w-3.5 h-3.5" style={{ color: "var(--mc-muted)" }} />
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <footer className="mc-section-rule">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 mc-mono text-xs uppercase tracking-widest flex flex-wrap justify-between gap-4" style={{ color: "var(--mc-muted)" }}>
          <span>© 2026 Mecene</span>
          <span>Si le lien vient d'un email de notre part, signalez-nous l'erreur via le feedback.</span>
        </div>
      </footer>
    </div>
  );
}
