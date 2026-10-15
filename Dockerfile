# ─────────────────────────────────────────────────────────────────────
#  JobOrbit Frontend — Multi-stage Dockerfile
#  Target: Render.com (Static Site) OR Web Service
#
#  Pattern:
#   1. Build the Vite app once, with a PLACEHOLDER for VITE_API_URL.
#   2. At container startup, replace the placeholder with the actual
#      runtime env var, then serve via nginx.
#  This decouples the build from the deployment env (no rebuild needed
#  when promoting from staging to production).
# ─────────────────────────────────────────────────────────────────────

# ─── Stage 1: build the Vite app ─────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

# Cache npm install
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Copy source and build (VITE_API_URL is a placeholder — replaced at runtime)
ENV VITE_API_URL="__VITE_API_URL_PLACEHOLDER__"
COPY . ./
RUN npm run build

# ─── Stage 2: nginx runtime ─────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Custom nginx config (SPA routing, gzip, etc.)
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Entrypoint script: substitutes the placeholder at container start
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

# Render's free Static Site plan uses port 10000 by default; Web Services
# inject a PORT env var. nginx listens on 80 inside the container, Render
# maps host:PORT → container:80 automatically.
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
