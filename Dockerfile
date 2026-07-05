# HOTFIX 2026-07-05 — Deploy pre-built dist/ without rebuilding
# Bypasses Nixpacks/esbuild issue that dropped routes on Railway rebuilds
FROM node:20-alpine

WORKDIR /app

# Copier package files pour installer uniquement les deps runtime
COPY package.json package-lock.json ./

# Installer les dépendances de production (ignore scripts pour éviter rebuild)
RUN npm ci --production --ignore-scripts --prefer-offline || npm install --production --ignore-scripts

# Copier le code applicatif (dist déjà pré-compilé committé dans le repo)
COPY dist ./dist
COPY server ./server
COPY shared ./shared
COPY public ./public
COPY *.html ./
COPY *.db* ./

# Démarrer depuis le dist committé — AUCUN rebuild
CMD ["node", "dist/index.cjs"]

EXPOSE 5000
ENV NODE_ENV=production
