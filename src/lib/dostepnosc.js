// Klasyfikuje tekst dostępności z arkusza na jeden z czterech stanów.
// Kolejność sprawdzeń ma znaczenie: „Niedostępne” i „Wkrótce dostępne” też zawierają „dostępn”.
export function dostepnoscStatus(d = '') {
  const lower = d.toLowerCase();
  if (lower.includes('niedostęp')) return 'niedostepne';
  if (lower.includes('wkrótce')) return 'wkrotce';
  if (lower.includes('ostatni')) return 'ostatnie';
  if (lower.includes('magazyn') || lower.includes('dostępn')) return 'dostepne';
  return 'wkrotce';
}
