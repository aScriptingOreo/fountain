# Wrangler integration (Cloudflare Pages) — bun-first

This project uses `@sveltejs/adapter-static` to build a static site, deployed to Cloudflare Pages via Wrangler.

What was added
- `wrangler.jsonc` — Pages config with `pages_build_output_dir: "build"`.
- `wrangler.toml` — basic config with build command.
- `package.json` script: `deploy:wrangler` runs `wrangler pages deploy build --project-name fountain --branch main`.

Quick steps (fish shell, bun)

1) Authenticate wrangler with Cloudflare

   wrangler login

   # verify account
   wrangler whoami

2) Build and deploy

   bun run build
   bun run deploy:wrangler

Notes
- Build outputs to `build` directory.
- If you prefer Workers, switch to `@sveltejs/adapter-cloudflare`.