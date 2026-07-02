FROM prom/prometheus:latest

# root pour que l'entrypoint puisse chown le volume Railway (monté root),
# puis Prometheus démarre (il tourne en root, ce qui lui permet d'écrire
# la TSDB sur le volume).
USER root

COPY prometheus.yml /etc/prometheus/prometheus.yml
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
