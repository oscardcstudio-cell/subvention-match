import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";
import { safeExternalUrl } from "@/lib/safe-url";

/**
 * Lien externe sûr: n'accepte que des URLs http(s).
 *
 * Les URLs viennent de sources externes (scrapers ADAMI/CNM, APIs, import EU).
 * Un `<a href={url}>` avec un url tordu (`javascript:...`, `data:...`) exécute
 * du JS si on clique. React N'échappe PAS les href.
 *
 * Ce composant:
 *   - valide le protocole (http/https uniquement)
 *   - si l'URL est invalide, rend l'enfant sans lien actif (span désactivé)
 *     pour que la mise en page ne saute pas
 */
type Props = {
  href: string | null | undefined;
  children: ReactNode;
  /** Classe appliquée quand l'URL est invalide (fallback span). */
  disabledClassName?: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

export const SafeExternalLink = forwardRef<HTMLAnchorElement, Props>(
  function SafeExternalLink(
    { href, children, disabledClassName, target = "_blank", rel, ...rest },
    ref,
  ) {
    const safe = safeExternalUrl(href);
    if (!safe) {
      // Le type mismatch (span vs anchor) est intentionnel — on veut que l'UI
      // indique "pas de lien" mais garde le layout. Les props anchor inutiles
      // sont droppées.
      return (
        <span className={disabledClassName} aria-disabled="true" title="Lien invalide">
          {children}
        </span>
      );
    }
    return (
      <a
        ref={ref}
        href={safe}
        target={target}
        rel={rel ?? "noopener noreferrer"}
        {...rest}
      >
        {children}
      </a>
    );
  },
);
