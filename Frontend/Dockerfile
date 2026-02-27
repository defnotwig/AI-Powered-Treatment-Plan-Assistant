FROM oven/bun:alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN bun install --frozen-lockfile || bun install

COPY . .
RUN bun run build

FROM caddy:alpine AS runtime
COPY --from=builder /app/dist /usr/share/caddy

EXPOSE 80
CMD ["caddy", "file-server", "--root", "/usr/share/caddy", "--listen", ":80"]
