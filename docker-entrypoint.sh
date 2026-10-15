#!/bin/sh
# ─────────────────────────────────────────────────────────────────────
#  JobOrbit Frontend — Runtime env var injection
#
#  Vite bakes VITE_* env vars at BUILD time, but Render injects env vars
#  at RUNTIME. This script bridges the gap:
#    1. At build time, we set VITE_API_URL="__VITE_API_URL_PLACEHOLDER__"
#    2. At runtime, this script replaces the placeholder with the actual
#       $VITE_API_URL env var (set by Render) across all built JS files.
#    3. Then execs nginx.
# ─────────────────────────────────────────────────────────────────────

set -eu

API_URL="${VITE_API_URL:-http://localhost:5087/api}"
INDEX_HTML="/usr/share/nginx/html/index.html"
ASSETS_DIR="/usr/share/nginx/html/assets"

echo "→ Injecting VITE_API_URL=${API_URL} into built assets..."

# Replace the placeholder in index.html (Vite inlines the env into a script tag)
if [ -f "$INDEX_HTML" ]; then
    sed -i "s|__VITE_API_URL_PLACEHOLDER__|${API_URL}|g" "$INDEX_HTML"
fi

# Replace in all JS bundles
if [ -d "$ASSETS_DIR" ]; then
    find "$ASSETS_DIR" -type f -name '*.js' -exec \
        sed -i "s|__VITE_API_URL_PLACEHOLDER__|${API_URL}|g" {} \;
fi

echo "✓ Runtime env injection complete."
exec "$@"
