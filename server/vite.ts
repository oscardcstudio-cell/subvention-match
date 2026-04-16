import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { type Server } from "http";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

/**
 * Sets up Vite in dev middleware mode. Lazy-imports `./vite-dev` so that the
 * production bundle never pulls `vite` / `vite.config` / dev plugins (all
 * devDependencies). The indirection through a computed specifier prevents
 * esbuild from statically hoisting those imports.
 */
export async function setupVite(app: Express, server: Server) {
  const specifier = "./vite-dev";
  const mod = await import(/* @vite-ignore */ specifier);
  return mod.setupVite(app, server);
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
