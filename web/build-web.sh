#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PUBLIC="$ROOT/web/public"
rm -rf "$PUBLIC"
mkdir -p "$PUBLIC"

# Single canonical runtime: no legacy backup HTML and no patch/force layers.
cp "$ROOT/app/src/main/assets/index.html" "$PUBLIC/index.html"
cp "$ROOT/app/src/main/assets/final-ui.js" "$PUBLIC/final-ui.js"
cp "$ROOT/app/src/main/assets/final-ui-links.js" "$PUBLIC/final-ui-links.js"
cp "$ROOT/app/src/main/assets/skill-saga-common.js" "$PUBLIC/skill-saga-common.js"
cp "$ROOT/app/src/main/assets/learner-content-routing.js" "$PUBLIC/learner-content-routing.js"
cp "$ROOT/app/src/main/assets/feature-config.js" "$PUBLIC/feature-config.js"
cp "$ROOT/app/src/main/assets/quiz-access-config.js" "$PUBLIC/quiz-access-config.js"

for f in \
  admin-console-core.js \
  admin-console-v3.js \
  admin-console-foundation-control.js \
  admin-console-content.js \
  admin-console-quiz.js \
  admin-console-competition-control.js \
  admin-console-operations.js \
  admin-console-community.js \
  admin-console-publishing-v2.js; do
  cp "$ROOT/app/src/main/assets/$f" "$PUBLIC/$f"
done

if [ -f "$ROOT/app/src/main/assets/logo.png" ]; then
  cp "$ROOT/app/src/main/assets/logo.png" "$PUBLIC/logo.png"
fi

echo "Clean Skill Saga web build ready: $PUBLIC"
