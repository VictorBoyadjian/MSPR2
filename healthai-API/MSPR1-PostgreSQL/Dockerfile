FROM postgres:16

# S'assurer que PostgreSQL accepte les connexions distantes
RUN echo "host all all 0.0.0.0/0 scram-sha-256" >> /usr/share/postgresql/pg_hba.conf.sample

# Exposer le port PostgreSQL pour Railway
EXPOSE 5432

# Démarrer PostgreSQL en écoutant sur toutes les interfaces
CMD ["postgres", "-c", "listen_addresses=*"]