# Foodie backend — production image (Render / Railway / Fly / Docker)
FROM node:20-slim

WORKDIR /app

# Install deps (incl. dev deps for the build)
COPY package.json package-lock.json ./
RUN npm ci

# Prisma client + build
COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src
RUN npx prisma generate && npm run build

# Runtime env
ENV NODE_ENV=production
ENV PORT=4000
ENV DATABASE_URL="file:/app/prisma/prod.db"

EXPOSE 4000

# Migrate + seed (seed uses upserts, safe to re-run) + start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/prisma/seed.js && node dist/src/server.js"]
