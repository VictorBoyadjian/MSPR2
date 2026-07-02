FROM prom/prometheus:latest

COPY prometheus.yml /etc/prometheus/prometheus.yml

# Railway private networking est IPv6-only -> il faut binder sur [::]
# sinon le service n'est pas joignable en interne (Grafana ne le voit pas).
CMD [ "--config.file=/etc/prometheus/prometheus.yml", \
      "--storage.tsdb.path=/prometheus", \
      "--storage.tsdb.retention.time=30d", \
      "--web.listen-address=[::]:9090", \
      "--web.enable-lifecycle" ]
