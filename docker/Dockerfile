FROM oven/bun:1 AS builder
WORKDIR /home/consultant
COPY package.json ./
RUN bun install
COPY . .

RUN bun run build

FROM node:25.9.0-slim AS production

RUN useradd -ms /bin/bash consultant
WORKDIR /home/consultant

COPY --chown=consultant:consultant --from=builder /home/consultant/storage ./
COPY --chown=consultant:consultant --from=builder /home/consultant/.next/standalone ./
COPY --chown=consultant:consultant --from=builder /home/consultant/.next/static ./.next/static
COPY --chown=consultant:consultant --from=builder /home/consultant/public ./public

USER consultant

ENTRYPOINT ["node"]
CMD ["server.js"]