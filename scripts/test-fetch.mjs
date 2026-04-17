const urls = [
  "https://www.google.com",
  "https://aides-territoires.beta.gouv.fr",
  "https://www.culture.gouv.fr",
];
for (const url of urls) {
  try {
    const r = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(8000) });
    console.log(`${r.status} ${url}`);
  } catch (e) {
    console.log(`ERR ${url} → ${e.message}`);
  }
}
