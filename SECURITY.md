# Politique de sécurité

## Signaler une faille

Si tu penses avoir trouvé une faille de sécurité dans SubventionMatch, **ne pas
l'ouvrir en issue publique** sur GitHub.

Envoie plutôt un email à : **contact@subventionmatch.fr**

Avec autant de détails que possible :
- Type de faille (injection, auth, exposition de données, etc.)
- Fichiers / endpoints concernés
- Étapes pour reproduire
- Impact potentiel

Je te répondrai sous quelques jours et te tiendrai informé·e du correctif. Si tu le
souhaites, tu seras crédité·e dans le changelog du fix.

## Périmètre

Sont dans le périmètre :
- Le code de ce dépôt
- L'instance déployée sur https://subvention-match-production.up.railway.app

Ne sont **pas** dans le périmètre :
- Les services tiers utilisés (Supabase, Stripe, Resend, OpenRouter) → signale-leur directement
- Les dépendances npm → utilise [GitHub security advisories](https://github.com/advisories) pour le package concerné
