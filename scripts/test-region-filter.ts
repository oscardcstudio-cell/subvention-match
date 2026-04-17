import { detectRegionFromOrg, isRegionCompatible } from "../server/region-filter.js";

let pass = 0, fail = 0;
function check(cond: boolean, msg: string) {
  if (cond) { pass++; console.log(`✅ ${msg}`); }
  else { fail++; console.log(`❌ ${msg}`); }
}

// detectRegionFromOrg
check(detectRegionFromOrg("Conseil départemental des Landes") === "nouvelle-aquitaine", "Landes → Nouvelle-Aquitaine");
check(detectRegionFromOrg("Conseil régional de Bretagne") === "bretagne", "Bretagne → bretagne");
check(detectRegionFromOrg("Conseil départemental de Seine-et-Marne") === "île-de-france", "Seine-et-Marne → IDF");
check(detectRegionFromOrg("Ministère de la Culture") === null, "Ministère → null (national)");
check(detectRegionFromOrg("CNM") === null, "CNM → null");
check(detectRegionFromOrg("Commission Européenne - Creative Europe") === null, "UE → null");
check(detectRegionFromOrg("DRAC Occitanie") === "occitanie", "DRAC Occitanie → occitanie");

// isRegionCompatible
check(isRegionCompatible("Conseil départemental des Landes", "Bretagne") === false, "Landes pour user Bretagne → false");
check(isRegionCompatible("Conseil régional de Bretagne", "Bretagne") === true, "Bretagne pour user Bretagne → true");
check(isRegionCompatible("CNM", "Bretagne") === true, "CNM (national) pour user Bretagne → true");
check(isRegionCompatible("Ministère de la Culture", "Île-de-France") === true, "Ministère → always true");
check(isRegionCompatible("Conseil départemental de Seine-et-Marne", "Île-de-France") === true, "Seine-et-Marne pour user IDF → true");
check(isRegionCompatible("Conseil régional Occitanie", "Île-de-France") === false, "Occitanie pour user IDF → false");
check(isRegionCompatible(null, "Bretagne") === true, "org null → true (ne pas filtrer)");
check(isRegionCompatible("Org random", null) === true, "user region null → true");

console.log(`\n${pass} passés, ${fail} échoués`);
process.exit(fail > 0 ? 1 : 0);
