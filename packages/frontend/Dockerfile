FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de raíz
COPY package.json package-lock.json ./
COPY packages/frontend/package.json ./packages/frontend/

# Instalar dependencias
RUN npm install

# Copiar todo el código para contexto de monorepo
COPY . .

# Argumento para la URL de la API
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Construir el frontend
RUN npm run build --workspace=packages/frontend

# Etapa de Nginx
FROM nginx:alpine

COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html

# Configuración básica de Nginx para SPA
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
