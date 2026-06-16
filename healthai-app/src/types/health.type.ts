/** Heures de sport pour un jour donné (date au format ISO `YYYY-MM-DD`). */
export type DaySportHours = {
  date: string;
  hours: number;
};

/** Statistiques sport calculées côté API à partir des séances passées. */
export type SportStats = {
  /** Semaine en cours, lundi → dimanche (7 entrées). */
  week: DaySportHours[];
  /** Moyenne d'heures de sport par semaine sur l'historique. */
  weekly_average_hours: number;
};
