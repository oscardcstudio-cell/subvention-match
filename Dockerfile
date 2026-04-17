# ---- Builder ----
FROM node:20-bookworm-slim AS builder
WORKDIR /app

# We do NOT need Chromium at build time; only at runtime.
# Skip puppeteer's bundled Chrome download to keep the builder small.
ENV PUPPETEER_SKIP_DOWNLOAD=true

COPY package.json package-lock.json ./
# npm install au lieu de npm ci — le lockfile local est genere par npm 11 (Node 24)
# mais l'image Docker utilise npm 10 (Node 20). npm ci refuse les lockfiles cross-version.
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run build

# Drop dev dependencies before we copy node_modules to the runtime image.
RUN npm prune --omit=dev

# ---- Runtime ----
FROM node:20-bookworm-slim AS runtime
WORKDIR /app

# Chromium + fonts + the shared libs puppeteer needs on Debian.
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-liberation \
    fonts-noto-color-emoji \
    ca-certificates \
    dumb-init \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libnss3 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production \
    PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Railway provides $PORT at runtime; the server reads process.env.PORT.
EXPOSE 5000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
