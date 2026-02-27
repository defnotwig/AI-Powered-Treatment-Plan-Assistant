FROM oven/bun:alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN bun install --frozen-lockfile || bun install

COPY tsconfig.json ./
COPY src ./src
RUN bun run build && \
    bun install --production && \
    mkdir -p logs

FROM gcr.io/distroless/nodejs22-debian12:nonroot AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/logs ./logs
COPY --from=builder /app/package.json ./package.json

EXPOSE 5000
CMD ["dist/server.js"]
