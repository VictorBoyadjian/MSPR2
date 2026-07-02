#!/bin/sh
set -e

# Le Railway Volume monté sur /prometheus appartient à root, alors que
# l'image prom/prometheus tourne en 'nobody'. Sans ce chown, Prometheus
# ne peut pas écrire sa TSDB -> "opening storage failed: permission denied"
# -> crash loop (URL en 404 + "no data" dans Grafana).
mkdir -p /prometheus
chown -R nobody:nobody /prometheus || true

# Railway private networking est IPv6-only -> bind sur [::].
exec /bin/prometheus \
  --config.file=/etc/prometheus/prometheus.yml \
  --storage.tsdb.path=/prometheus \
  --storage.tsdb.retention.time=30d \
  --web.listen-address=[::]:9090 \
  --web.enable-lifecycle
