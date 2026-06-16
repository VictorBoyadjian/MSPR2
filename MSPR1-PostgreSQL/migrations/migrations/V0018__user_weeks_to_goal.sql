/* Délai (semaines) pour atteindre le poids cible — requis par le moteur calorique. */

ALTER TABLE users ADD COLUMN weeks_to_goal INT DEFAULT 12;
