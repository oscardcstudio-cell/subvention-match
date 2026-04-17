// Charge les variables .env puis lance le serveur via tsx
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";

// Parse .env simple
try {
  const envContent = readFileSync(".env", "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.substring(0, eq).trim();
    let value = trimmed.substring(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
} catch (e) {
  console.warn("No .env loaded:", e.message);
}

process.env.NODE_ENV = process.env.NODE_ENV || "development";
process.env.PORT = process.env.PORT || "5000";

const child = spawn("npx", ["tsx", "server/index.ts"], {
  stdio: "inherit",
  env: process.env,
  shell: true,
});

child.on("exit", (code) => process.exit(code || 0));
