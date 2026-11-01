# --- Сборка (standalone: ноль лишнего в образе) ---
# Debian slim вместо alpine: better-sqlite3 (нативный модуль) на musl в alpine
# не имеет готовых бинарников и требует полной цепочки сборки. glibc-prebuilt
# качается из коробки, инструменты компиляции — страховка на любой arch.
FROM node:22-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- Рантайм: минимальный образ, fits 1 CPU / 1 GB RAM ---
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN groupadd --system app && useradd --system --gid app app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
# каталог БД монтируется как volume
RUN mkdir -p /app/data && chown -R app:app /app
USER app
EXPOSE 3000
CMD ["node", "server.js"]
