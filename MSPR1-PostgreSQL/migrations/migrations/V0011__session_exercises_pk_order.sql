/* Autoriser le même exercice plusieurs fois dans une séance :
   on ajoute "order" à la clé primaire du pivot. */
ALTER TABLE session_exercises DROP CONSTRAINT session_exercises_pkey;
ALTER TABLE session_exercises ADD PRIMARY KEY (exercise_id, sport_session_id, "order");
