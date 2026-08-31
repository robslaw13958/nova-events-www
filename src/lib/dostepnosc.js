// Klasyfikuje tekst dostępności z arkusza na jeden z trzech stanów.
export function dostepnoscStatus(d = '') {
  const lower = d.toLowerCase();
  if (lower.includes('magazyn') || lower.includes('dostępn')) return 'dostepne';
  if (lower.includes('ostatni')) return 'ostatnie';
  return 'wkrotce';
}
