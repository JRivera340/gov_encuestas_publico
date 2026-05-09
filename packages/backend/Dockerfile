FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias de compilación
RUN apk add --no-cache python3 make g++

# Copiar archivos de raíz para manejar el monorepo
COPY package.json package-lock.json ./
COPY packages/backend/package.json ./packages/backend/

# Instalar dependencias usando npm workspaces
RUN npm install

# Copiar TODO el código para que el contexto sea correcto
COPY . .

# Construir el backend
RUN npm run build --workspace=packages/backend

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist
COPY --from=builder /app/packages/backend/package.json ./packages/backend/package.json

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "run", "start:prod", "--workspace=packages/backend"]
