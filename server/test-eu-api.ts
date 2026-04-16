// Script pour tester la structure de l'API EU Funding
async function testEUAPI() {
  const apiUrl = "https://api.tech.ec.europa.eu/search-api/prod/rest/search";
  
  const queryBody = {
    bool: {
      must: [
        { terms: { type: ["1", "2"] } },
        { term: { programmePeriod: "2021 - 2027" } },
        { terms: { frameworkProgramme: ["43108390"] } },
      ],
    },
  };

  const formData = new FormData();
  formData.append("query", new Blob([JSON.stringify(queryBody)], { type: "application/json" }));
  formData.append("language", new Blob([JSON.stringify(["en", "fr"])], { type: "application/json" }));

  const response = await fetch(
    `${apiUrl}?apiKey=SEDIA&text=culture&pageSize=2&pageNumber=1`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();
  
  console.log("=== STRUCTURE COMPLÈTE DU PREMIER RÉSULTAT ===\n");
  console.log(JSON.stringify(data.results[0], null, 2));
  
  console.log("\n\n=== CHAMPS DISPONIBLES ===\n");
  console.log(Object.keys(data.results[0]).join(", "));
}

testEUAPI();
