FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de raíz para manejar el monorepo
COPY package.json package-lock.json ./
COPY packages/backend/package.json ./packages/backend/

# Instalar dependencias usando npm workspaces
RUN npm install

# Copiar código del backend
COPY packages/backend ./packages/backend

# Construir el backend
RUN npm run build --workspace=packages/backend

FROM node:20-alpine

WORKDIR /app

# Copiar solo lo necesario para ejecución
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist
COPY --from=builder /app/packages/backend/package.json ./packages/backend/package.json

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "run", "start:prod", "--workspace=packages/backend"]
