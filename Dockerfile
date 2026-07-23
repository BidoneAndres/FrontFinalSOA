# --- Etapa 1: Construcción (Builder) ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos dependencias e instalamos
COPY package*.json ./
RUN npm install

# Copiamos el resto del código y construimos la app
COPY . .
# Ejecutamos solo la compilación de Vite, saltando el type-check
RUN npm run build-only 
# (Si usas Vite/Vue/React, esto generará la carpeta dist/)

# --- Etapa 2: Servidor de Producción ---
FROM nginx:alpine

# Reemplazamos la configuración por defecto para soportar rutas de SPA
COPY nginx-spa.conf /etc/nginx/conf.d/default.conf

# Copiamos SOLO la carpeta dist/ generada en la etapa anterior 
# a la carpeta pública por defecto del Nginx interno
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponemos el puerto 80 del Nginx interno
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
