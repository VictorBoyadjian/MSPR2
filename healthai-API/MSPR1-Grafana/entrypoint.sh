#!/bin/sh
export GF_SERVER_HTTP_PORT="${GF_SERVER_HTTP_PORT:-1506}"
export GF_SECURITY_ADMIN_USER="${GF_SECURITY_ADMIN_USER:-admin}"
export GF_SECURITY_ADMIN_PASSWORD="${GF_SECURITY_ADMIN_PASSWORD:-admin}"
export GF_SECURITY_ADMIN_EMAIL="${GF_SECURITY_ADMIN_EMAIL:-admin@healthai.local}"

# Substitute env variables in datasource provisioning template
envsubst '${POSTGRES_HOST} ${POSTGRES_PORT} ${POSTGRES_DB} ${POSTGRES_USER} ${POSTGRES_PASSWORD}' \
  < /etc/grafana/provisioning/datasources/datasource.yml.tmpl \
  > /etc/grafana/provisioning/datasources/datasource.yml

# Drop to grafana user and start
exec su-exec grafana /run.sh
