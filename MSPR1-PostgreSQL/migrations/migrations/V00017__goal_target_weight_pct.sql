/* Coefficient de poids cible par goal (multiplie le poids actuel) + poids cible utilisateur. */

ALTER TABLE goals ADD COLUMN target_weight_pct FLOAT;
ALTER TABLE users ADD COLUMN target_weight     FLOAT;

UPDATE goals SET target_weight_pct = 1.00 WHERE name = 'maintien_bien_etre';
UPDATE goals SET target_weight_pct = 1.00 WHERE name = 'amelioration_cardio';
UPDATE goals SET target_weight_pct = 0.95 WHERE name = 'perte_poids_debutant';
UPDATE goals SET target_weight_pct = 0.90 WHERE name = 'perte_poids_confirme';
UPDATE goals SET target_weight_pct = 1.05 WHERE name = 'prise_masse_debutant';
UPDATE goals SET target_weight_pct = 1.10 WHERE name = 'prise_masse_confirme';
