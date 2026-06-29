#!/bin/sh
set -e

# Persist all Grafana state (grafana.db, plugins, ...) on the Railway volume
# mounted at /data instead of the ephemeral default /var/lib/grafana.
export GF_PATHS_DATA="/data"
export GF_PATHS_PLUGINS="/data/plugins"

export GF_SERVER_HTTP_PORT="${PORT:-1506}"
export GF_SECURITY_ADMIN_USER="${GF_SECURITY_ADMIN_USER:-test}"
export GF_SECURITY_ADMIN_PASSWORD="${GF_SECURITY_ADMIN_PASSWORD:-testtest}"
export GF_SECURITY_ADMIN_EMAIL="${GF_SECURITY_ADMIN_EMAIL:-test@test.com}"

mkdir -p /data

# First boot: the volume is empty, seed it with the image's baked-in data
# (dashboards, datasources and plugins). On later boots the volume already
# has grafana.db so runtime changes are preserved.
if [ ! -f /data/grafana.db ]; then
  echo "[entrypoint] /data/grafana.db missing -> seeding volume from /seed"
  cp -a /seed/. /data/
fi

# The mounted volume is owned by root; make sure the grafana user can write.
chown -R 472:0 /data

# Drop privileges back to the grafana user and start the server.
# -p keeps the exported GF_* environment, -s sets a shell (grafana has none).
exec su -p -s /bin/sh grafana -c 'exec /run.sh'
