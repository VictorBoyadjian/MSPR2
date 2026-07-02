FROM prom/blackbox-exporter:latest

COPY blackbox.yml /etc/blackbox_exporter/config.yml

# Railway private networking est IPv6-only -> binder sur [::]
# pour que Prometheus puisse scraper blackbox en interne.
CMD [ "--config.file=/etc/blackbox_exporter/config.yml", \
      "--web.listen-address=[::]:9115" ]
