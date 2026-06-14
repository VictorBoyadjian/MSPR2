const DAY_MS = 24 * 60 * 60 * 1000;

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, amount: number): Date {
  return startOfDay(new Date(date.getTime() + amount * DAY_MS));
}

export function isSameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export function formatDayLabel(date: Date): string {
  const today = new Date();
  if (isSameDay(date, today)) return "Aujourd'hui";
  if (isSameDay(date, addDays(today, -1))) return 'Hier';
  if (isSameDay(date, addDays(today, 1))) return 'Demain';
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}
