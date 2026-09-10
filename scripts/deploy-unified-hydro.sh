#!/usr/bin/env bash
set -euo pipefail
phase="$1"
release_id="$2"
[[ "$release_id" =~ ^[0-9]{8}-[0-9]{6}$ ]] || exit 2
base=/nlplabProj/scene-library
release="$base/releases/$release_id"
preflight="$base/preflight-$release_id"
unit="scene-library-preflight-$release_id"

case "$phase" in
  install)
    test ! -e "$release"
    mkdir "$release"
    tar -xzf "/tmp/scene-library-release-$release_id.tar.gz" -C "$release"
    chown -R cockpit:cockpit "$release"
    cd "$release"
    runuser -u cockpit -- npm ci --include=dev --cache "$base/shared/npm-cache" --no-audit --no-fund
    mkdir -p "$preflight/data" "$preflight/model-cache"
    # Isolated preflight needs only the four pilot assets, not the whole model library.
    for scene in sim-visual-hydro-turbine sim-visual-wastewater-pump sim-visual-bridge-crane sim-visual-haul-truck; do
      manifest="$base/shared/model-cache/$scene.json"
      test -f "$manifest"
      binary=$(/usr/bin/node -e 'const p=require(process.argv[1]);if(!/^[A-Za-z0-9_.-]+$/.test(p.binaryFile))process.exit(1);process.stdout.write(p.binaryFile)' "$manifest")
      cp -p "$manifest" "$preflight/model-cache/"
      cp -p "$base/shared/model-cache/$binary" "$preflight/model-cache/"
    done
    chown -R cockpit:cockpit "$preflight"
    systemd-run --unit="$unit" --uid=cockpit --gid=cockpit --working-directory="$release" --property=EnvironmentFile=/etc/scene-library-next.env /usr/bin/env PORT=3103 SCENE_DATA_DIRECTORY="$preflight/data" MODEL_CACHE_DIRECTORY="$preflight/model-cache" APP_VERSION="$release_id" RELEASE_VERSION="$release_id" /usr/bin/node "$release/node_modules/tsx/dist/cli.mjs" "$release/server.ts"
    ;;
  check)
    curl -fsS http://127.0.0.1:3103/api/health
    for scene in sim-visual-hydro-turbine sim-visual-wastewater-pump sim-visual-bridge-crane sim-visual-haul-truck; do
      curl -fsS "http://127.0.0.1:3103/api/model-showcase/$scene/bootstrap" -o "$preflight/$scene-bootstrap.json"
      curl -fsS "http://127.0.0.1:3103/api/model-showcase/$scene/model" -o "$preflight/$scene.fbx"
    done
    curl -fsS http://127.0.0.1:3103/api/model-showcase/sim-visual-hydro-turbine/data/forecast/summary
    ;;
  switch)
    old=$(readlink -f "$base/current")
    test "$old" != "$release"
    test -d "$old"
    test -f "$release/dist-standalone/index.html"
    curl -fsS http://127.0.0.1:3103/api/health | /usr/bin/node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{if(JSON.parse(s).version!==process.argv[1])process.exit(1)})' "$release_id"
    backup="/etc/scene-library-next.env.before-$release_id"
    test ! -e "$backup"
    cp -p /etc/scene-library-next.env "$backup"
    find "$base/shared/data/model-showcase" -path '*/current/state.json' -type f -exec sha256sum {} + | sort > "$preflight/state-before.sha256"
    rollback() {
      ln -sfn "$old" "$base/current"
      cp -p "$backup" /etc/scene-library-next.env
      systemctl restart scene-library.service
      echo 'ROLLED_BACK'
    }
    trap rollback ERR
    ln -sfn "$old" "$base/previous"
    ln -sfn "$release" "$base/current"
    sed -i -E "s/^APP_VERSION=.*/APP_VERSION=$release_id/;s/^RELEASE_VERSION=.*/RELEASE_VERSION=$release_id/" /etc/scene-library-next.env
    systemctl restart scene-library.service
    for attempt in $(seq 1 20); do
      if curl -fsS http://127.0.0.1:3102/api/health -o "$preflight/live-health.json"; then break; fi
      sleep 1
    done
    /usr/bin/node -e 'const j=require(process.argv[1]);if(j.version!==process.argv[2])process.exit(1)' "$preflight/live-health.json" "$release_id"
    test "$(readlink -f "$base/www/cockpit")" = "$release/dist-standalone"
    test "$(readlink -f "$base/www/microapps/scene-library")" = "$release/dist-microapp"
    curl -fsS http://127.0.0.1:3102/api/model-showcase/sim-visual-hydro-turbine/data/forecast/summary
    find "$base/shared/data/model-showcase" -path '*/current/state.json' -type f -exec sha256sum {} + | sort > "$preflight/state-after.sha256"
    diff "$preflight/state-before.sha256" "$preflight/state-after.sha256"
    trap - ERR
    systemctl stop "$unit"
    echo "PUBLISHED=$release_id PREVIOUS=$old DATA_UNCHANGED"
    ;;
  *) exit 2 ;;
esac
