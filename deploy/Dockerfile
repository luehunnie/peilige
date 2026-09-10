# Peilige V1 — independent static production image.
# Pure static site: official lightweight Caddy image, no build step,
# no Node runtime, no backend.
FROM caddy:2-alpine

# Site config (domain-neutral :80, gzip/zstd, /healthz, cache policy)
COPY deploy/Caddyfile /etc/caddy/Caddyfile

# Runtime files only. docs/, PRD, Playwright evidence and VCS metadata are
# kept out of the image by this COPY allowlist plus the repo .dockerignore.
COPY index.html /srv/index.html
COPY css/ /srv/css/
COPY js/ /srv/js/
COPY assets/ /srv/assets/
