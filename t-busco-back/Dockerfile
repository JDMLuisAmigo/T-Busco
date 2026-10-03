# Imagen de PRODUCCIÓN (distinta de Dockerfile.dev, que es solo para tu
# máquina). Railway construye esta automáticamente porque se llama
# "Dockerfile" a secas, en la raíz del proyecto.
#
# Dos etapas: la primera compila TypeScript a JavaScript; la segunda arma
# una imagen final mucho más liviana, sin las herramientas de compilación.

# ---------- Etapa 1: compilar ----------
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---------- Etapa 2: imagen final ----------
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

# Railway monta aquí un Volume persistente (ver GUIA-DESPLIEGUE.md).
# Sin el Volume, esta carpeta existe igual, pero se borra en cada
# despliegue nuevo: los diplomas/certificados ya subidos se perderían.
RUN mkdir -p uploads/cv

EXPOSE 3001
CMD ["node", "dist/main.js"]
