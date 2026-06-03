FROM grafana/grafana:latest

USER root
RUN apk add --no-cache gettext su-exec
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
COPY provisioning/datasources/datasource.yml /etc/grafana/provisioning/datasources/datasource.yml.tmpl
COPY provisioning/dashboards/dashboards.yml /etc/grafana/provisioning/dashboards/dashboards.yml
COPY provisioning/dashboards/*.json /etc/grafana/provisioning/dashboards/
RUN chown -R grafana:root /etc/grafana/provisioning/

ENTRYPOINT ["/entrypoint.sh"]
