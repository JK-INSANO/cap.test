# ----  Dependencias ----
FROM node:22-alpine AS deps
# Prisma requiere openssl y libc6-compat en entornos Alpine
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copiamos los archivos de dependencias y el esquema de Prisma
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Instalación limpia
RUN npm ci
# Generamos el cliente de Prisma para que esté disponible en la compilación
RUN npx prisma generate

# ---- Compilación (Build) ----
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Deshabilitamos telemetría de Next.js
ENV NEXT_TELEMETRY_DISABLED=1

# Compilamos la aplicación
RUN npm run build

# ----  Producción (Runner) ----
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache openssl

# Copiamos solo lo necesario desde la etapa de construcción
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
ENV PORT=3000

# Comando para iniciar la aplicación en producción
CMD ["npm", "start"]