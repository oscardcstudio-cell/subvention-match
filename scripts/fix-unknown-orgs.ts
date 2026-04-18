/**
 * Corrige l'organisme via IA pour les grants avec organization = "Non spécifié".
 * Source du signal : URL + description + titre.
 *
 * Usage: npx tsx scripts/fix-unknown-orgs.ts [--apply]
 */
import { db } from "../server/db";
import { grants } from "../shared/schema";
import { eq, sql } from "drizzle-orm";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;

async function callAI(prompt: string): Promise<string> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://subventionmatch.com",
      "X-Title": "SubventionMatch",
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-chat",
      messages: [
        { role: "system", content: "Tu es un expert en subventions françaises. Réponds factuellement et brièvement." },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 100,
    }),
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.choices[0]?.message?.content?.trim() ?? "";
}

async function main() {
  const apply = process.argv.includes("--apply");
  const rows = await db.execute(sql`
    SELECT id, title, description, url FROM grants
    WHERE status='active' AND organization IN ('Non spécifié', 'Inconnu', '')
  `);
  console.log(`${rows.rows.length} grants sans organisme`);

  let fixed = 0, failed = 0;
  for (const g of rows.rows as any[]) {
    const prompt = `Identifie l'ORGANISME QUI FINANCE cette aide en France.

TITRE : ${g.title}
DESCRIPTION : ${(g.description || "").replace(/<[^>]*>/g, "").substring(0, 800)}
URL : ${g.url}

CONSIGNES :
- Réponds UNIQUEMENT avec le nom officiel court de l'organisme (ex: "Conseil départemental de la Meuse", "LEADER Adour Chalosse Tursan", "DRAC Occitanie", "ADEME").
- Pas de phrase, pas de markdown, pas de retour à la ligne.
- Si l'URL contient un slug style "LEADER" ou un code de GAL, renvoie le GAL concerné.
- Si impossible, réponds "INCONNU".`;

    try {
      const org = await callAI(prompt);
      const clean = org.replace(/[\n*_]/g, " ").replace(/\s+/g, " ").trim().replace(/^["']|["']$/g, "");
      if (!clean || clean === "INCONNU" || clean.length < 5 || clean.length > 120) {
        console.log(`❌ ${g.title.substring(0, 50)} → "${clean}"`);
        failed++;
      } else {
        console.log(`✅ ${g.title.substring(0, 50)} → ${clean}`);
        if (apply) {
          await db.update(grants).set({ organization: clean, updatedAt: new Date() }).where(eq(grants.id, g.id));
        }
        fixed++;
      }
    } catch (e: any) {
      console.log(`❌ ${g.title.substring(0, 50)}: ${e.message.substring(0, 80)}`);
      failed++;
    }
    await new Promise((r) => setTimeout(r, 1200));
  }
  console.log(`\n${fixed} corrigées, ${failed} échecs ${apply ? "" : "(--apply pour écrire)"}`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
