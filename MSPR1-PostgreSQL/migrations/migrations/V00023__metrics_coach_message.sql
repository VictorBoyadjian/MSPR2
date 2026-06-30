/* Message quotidien du coach IA (généré par Mistral), stocké dans la métrique
   du jour de l'utilisateur. Un message par jour (même ligne que recorded_at). */
ALTER TABLE metrics ADD COLUMN coach_message TEXT;
