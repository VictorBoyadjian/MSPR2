/* Ajout d'une colonne label (FR) sur goals, allergies et handicaps
   pour l'affichage côté frontend. */

ALTER TABLE goals     ADD COLUMN label VARCHAR(255);
ALTER TABLE allergies ADD COLUMN label VARCHAR(255);
ALTER TABLE handicaps ADD COLUMN label VARCHAR(255);

/* Goals */
UPDATE goals SET label = 'Prise de masse (confirmé)' WHERE name = 'prise_masse_confirme';
UPDATE goals SET label = 'Prise de masse (débutant)' WHERE name = 'prise_masse_debutant';
UPDATE goals SET label = 'Perte de poids (confirmé)' WHERE name = 'perte_poids_confirme';
UPDATE goals SET label = 'Perte de poids (débutant)' WHERE name = 'perte_poids_debutant';
UPDATE goals SET label = 'Amélioration du cardio'    WHERE name = 'amelioration_cardio';
UPDATE goals SET label = 'Maintien et bien-être'     WHERE name = 'maintien_bien_etre';

/* Allergies */
UPDATE allergies SET label = 'Gluten'         WHERE name = 'gluten';
UPDATE allergies SET label = 'Lactose'        WHERE name = 'lactose';
UPDATE allergies SET label = 'Œufs'           WHERE name = 'oeufs';
UPDATE allergies SET label = 'Fruits à coque' WHERE name = 'fruits_a_coque';
UPDATE allergies SET label = 'Arachides'      WHERE name = 'arachides';
UPDATE allergies SET label = 'Soja'           WHERE name = 'soja';
UPDATE allergies SET label = 'Poisson'        WHERE name = 'poisson';
UPDATE allergies SET label = 'Crustacés'      WHERE name = 'crustaces';

/* Handicaps */
UPDATE handicaps SET label = 'Bras droit'   WHERE name = 'bras_droit';
UPDATE handicaps SET label = 'Bras gauche'  WHERE name = 'bras_gauche';
UPDATE handicaps SET label = 'Bras'         WHERE name = 'bras';
UPDATE handicaps SET label = 'Jambe droite' WHERE name = 'jambe_droite';
UPDATE handicaps SET label = 'Jambe gauche' WHERE name = 'jambe_gauche';
UPDATE handicaps SET label = 'Jambes'       WHERE name = 'jambes';
UPDATE handicaps SET label = 'Dos'          WHERE name = 'dos';
UPDATE handicaps SET label = 'Épaules'      WHERE name = 'epaules';
UPDATE handicaps SET label = 'Abdominaux'   WHERE name = 'abdominaux';
UPDATE handicaps SET label = 'Pied'         WHERE name = 'pied';
UPDATE handicaps SET label = 'Nuque'        WHERE name = 'nuque';
