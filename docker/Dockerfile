FROM oven/bun:1 AS builder
WORKDIR /home/consultant

COPY package.json bun.lock* ./
COPY . .
RUN bun install --offline
RUN bun run build
FROM node:25.9.0-slim AS production
RUN useradd -ms /bin/bash consultant
WORKDIR /home/consultant

COPY --chown=consultant:consultant --from=builder /home/consultant/storage ./storage
COPY --chown=consultant:consultant --from=builder /home/consultant/.next/standalone ./
COPY --chown=consultant:consultant --from=builder /home/consultant/.next/static ./.next/static
COPY --chown=consultant:consultant --from=builder /home/consultant/public ./public

USER consultant
ENTRYPOINT ["node"]
CMD ["server.js"]