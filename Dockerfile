# Development image for the Next.js app (hot reload).
FROM node:24.21.0-bookworm

# openssl is needed by the Prisma CLI (schema/migration engine) on slim images.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=development
WORKDIR /app

# Install dependencies first so the layer is cached. `npm ci` runs the
# `postinstall` script (`prisma generate`), so the schema/config must be present.
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma7.config.ts ./
RUN npm ci

# Copy the rest of the sources (see .dockerignore).
COPY . .

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["npm", "run", "dev"]
