# Peilige V1 — independent static production image.
# Pure static site: official lightweight Caddy image, no build step,
# no Node runtime, no backend.
#
# Caddy tag is pinned to an exact minor/patch release (verified to exist on
# Docker Hub, digest-identical to the former caddy:2-alpine at pin time);
# Dependabot (.github/dependabot.yml) keeps it current.
FROM caddy:2.11.4-alpine

# Dedicated unprivileged runtime user (uid/gid 10001). The image is pure
# static: nothing needs root, and Caddy listens on :8080 (deploy/Caddyfile)
# so binding needs no NET_BIND_SERVICE capability either. /config and /data
# are Caddy's only writable runtime dirs (XDG_CONFIG_HOME / XDG_DATA_HOME
# are preset by the base image).
#
# The base image sets the file capability cap_net_bind_service=ep on the
# Caddy binary (for :80 binding). Strip it: unnecessary for :8080, and a
# file-capability binary cannot even be exec'd under no-new-privileges.
RUN addgroup -g 10001 -S peilige \
 && adduser -u 10001 -G peilige -S -D -H peilige \
 && mkdir -p /config /data \
 && chown -R peilige:peilige /config /data \
 && setcap -r /usr/bin/caddy

USER 10001:10001

# Site config (domain-neutral :8080, gzip/zstd, /healthz, cache policy,
# security response headers)
COPY deploy/Caddyfile /etc/caddy/Caddyfile

# Runtime files only — copied as root, world-readable, so the runtime user
# cannot modify them. docs/, PRD, Playwright evidence and VCS metadata are
# kept out of the image by this COPY allowlist plus the repo .dockerignore.
COPY index.html /srv/index.html
COPY css/ /srv/css/
COPY js/ /srv/js/
COPY assets/ /srv/assets/
