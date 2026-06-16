/**
 * L'API renvoie parfois un timestamp UTC sans fuseau ("YYYY-MM-DD HH:mm:ss").
 * Sans marqueur, `new Date()` l'interprète en heure locale → décalage. On le
 * marque explicitement comme UTC. Les chaînes déjà datées (Z ou ±hh:mm) restent intactes.
 */
export function apiDateToIso(value: string): string {
  if (!value) return value;
  if (/[zZ]$|[+-]\d{2}:?\d{2}$/.test(value)) return value;
  return value.replace(' ', 'T') + 'Z';
}

const toDate = (date: string | Date): Date =>
  typeof date === 'string' ? new Date(apiDateToIso(date)) : date;

export function formatDate(date: string | Date): string {
  const d = toDate(date);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(date: string | Date): string {
  const d = toDate(date);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(date: string | Date): string {
  const d = toDate(date);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}
