FROM grafana/grafana:latest

USER root

# Seed data (dashboards, datasources, plugins) baked into the image.
# Copied into the /data volume on first boot by entrypoint.sh.
COPY data /seed

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh && chown -R grafana:root /seed

# Run as root so the entrypoint can fix permissions on the mounted /data volume,
# then it drops back to the grafana user before launching the server.
USER root
ENTRYPOINT ["/entrypoint.sh"]
