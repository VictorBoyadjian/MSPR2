FROM postgres:16

ENV PGDATA=/var/lib/postgresql/data/pgdata

# Accept remote connections
RUN echo "host all all 0.0.0.0/0 scram-sha-256" >> /usr/share/postgresql/pg_hba.conf.sample

# Copy the migration files and the init script that runs them one by one
COPY migrations/migrations /migrations
COPY restore.sh /docker-entrypoint-initdb.d/00_restore.sh
RUN sed -i 's/\r$//' /docker-entrypoint-initdb.d/00_restore.sh \
    && chmod +x /docker-entrypoint-initdb.d/00_restore.sh

EXPOSE 5432

CMD ["postgres", "-c", "listen_addresses=*"]