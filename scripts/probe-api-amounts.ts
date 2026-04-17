/**
 * Sonde l'API Aides Territoires pour voir quels champs montant sont remplis
 * Nécessite AIDES_ET_TERRITOIRES_API_KEY dans .env
 */
const API_BASE = "https://aides-territoires.beta.gouv.fr/api";

async function getToken(): Promise<string> {
  const apiToken = process.env.AIDES_ET_TERRITOIRES_API_KEY;
  if (!apiToken) throw new Error("AIDES_ET_TERRITOIRES_API_KEY manquante");
  const resp = await fetch(`${API_BASE}/connexion/`, {
    method: "POST",
    headers: { "X-AUTH-TOKEN": apiToken, "Content-Type": "application/json" },
  });
  if (!resp.ok) throw new Error(`Auth failed: ${resp.status}`);
  const data: any = await resp.json();
  return data.token;
}

async function probe() {
  let token: string;
  try {
    token = await getToken();
    console.log("Auth OK\n");
  } catch (e: any) {
    // Fallback sans auth (endpoint public)
    console.log("Pas de token API, essai en mode public...\n");
    token = "";
  }

  const headers: any = { Accept: "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // Page 1 : culture
  for (const query of ["culture patrimoine", "artiste création"]) {
    const params = new URLSearchParams({ text: query, page_size: "50", page: "1" });
    const resp = await fetch(`${API_BASE}/aids/?${params}`, { headers });
    if (!resp.ok) { console.log(`Erreur ${resp.status} pour query "${query}"`); continue; }
    const data: any = await resp.json();

    let withRate = 0, withComment = 0, withLoan = 0, withRecoverable = 0, total = 0;
    const commentSamples: string[] = [];

    for (const aide of (data.results || [])) {
      total++;
      if (aide.subvention_rate_lower_bound || aide.subvention_rate_upper_bound) withRate++;
      if (aide.subvention_comment) {
        withComment++;
        if (commentSamples.length < 5) {
          commentSamples.push(`  "${(aide.name || "").substring(0, 40)}" → "${(aide.subvention_comment || "").replace(/<[^>]*>/g, "").substring(0, 150)}"`);
        }
      }
      if (aide.loan_amount) withLoan++;
      if (aide.recoverable_advance_amount) withRecoverable++;
    }

    console.log(`Query "${query}": ${data.count} total, ${total} sur cette page`);
    console.log(`  subvention_rate: ${withRate}`);
    console.log(`  subvention_comment: ${withComment}`);
    console.log(`  loan_amount: ${withLoan}`);
    console.log(`  recoverable_advance_amount: ${withRecoverable}`);
    if (commentSamples.length > 0) {
      console.log("  Exemples comment:");
      commentSamples.forEach((s) => console.log(s));
    }
    console.log();
  }
}

probe().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
