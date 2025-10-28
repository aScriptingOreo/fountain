FROM oven/bun:latest

WORKDIR /app

COPY package.json ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

EXPOSE 3000

CMD ["bun", "run", "preview"]