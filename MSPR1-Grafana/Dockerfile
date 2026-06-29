FROM grafana/grafana:latest

USER root
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER grafana
ENTRYPOINT ["/entrypoint.sh"]
