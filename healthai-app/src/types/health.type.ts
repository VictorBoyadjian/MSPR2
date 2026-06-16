/** Heures de sport pour un jour donné (date au format ISO `YYYY-MM-DD`). */
export type DaySportHours = {
  date: string;
  hours: number;
};

/** Un point de l'historique de poids (date ISO `YYYY-MM-DD` + poids en kg). */
export type WeightPoint = {
  date: string;
  weight: number;
};

/** Statistiques sport calculées côté API à partir des séances passées. */
export type SportStats = {
  /** Semaine en cours, lundi → dimanche (7 entrées). */
  week: DaySportHours[];
  /** Moyenne d'heures de sport par semaine sur l'historique. */
  weekly_average_hours: number;
};
