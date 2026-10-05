import { HURT_PROG, cenaItem } from './cartStore';
import { formatPrice } from './format';

export const ZAPYTANIE_TEMAT = 'Zapytanie ofertowe — Nova Events';

// Niektóre programy pocztowe (np. Outlook na Windows) ucinają lub odrzucają
// linki mailto dłuższe niż ok. 2000 znaków.
const MAX_MAILTO_LENGTH = 1800;

function itemLines(item, i) {
  const isHurt = item.ilosc >= HURT_PROG;
  const cena = cenaItem(item);
  const nazwa = item.linia ? `${item.name} · ${item.linia}` : item.name;
  const wariant = [item.kolor, item.outlet && 'outlet'].filter(Boolean).join(', ');

  return [
    `${i + 1}. ${nazwa}`,
    wariant && `   Wariant: ${wariant}`,
    `   Ilość: ${item.ilosc} szt. × ${formatPrice(cena)} zł (${isHurt ? 'cena hurtowa' : 'cena detaliczna'}) = ${formatPrice(cena * item.ilosc)} zł`,
  ].filter(Boolean);
}

// Treść zapytania — ta sama dla e-maila, WhatsAppa i schowka.
// `\r\n` zgodnie z RFC 6068 (mailto), inne kanały przyjmują je bez problemu.
export function buildZapytanie(items, catalogUrl) {
  const total = items.reduce((sum, i) => sum + cenaItem(i) * i.ilosc, 0);

  return [
    'Dzień dobry,',
    '',
    'proszę o przygotowanie oferty na poniższe produkty:',
    '',
    ...items.flatMap((item, i) => [...itemLines(item, i), '']),
    `Szacunkowa wartość: ${formatPrice(total)} zł`,
    catalogUrl ? `Ceny orientacyjne wg katalogu: ${catalogUrl}` : null,
    '',
    'Termin, miejsce dostawy i uwagi:',
    '',
    '',
    'Pozdrawiam',
  ].filter(line => line !== null).join('\r\n');
}

// Przy bardzo długim koszyku pełna lista nie zmieści się w linku mailto —
// wtedy treść wiadomości prosi o wklejenie listy ze schowka.
export function zapytanieMailBody(text) {
  if (encodeURIComponent(text).length <= MAX_MAILTO_LENGTH) return text;
  return [
    'Dzień dobry,',
    '',
    'proszę o przygotowanie oferty na produkty z poniższej listy.',
    '',
    '[Lista produktów została skopiowana do schowka — proszę wkleić ją tutaj (Ctrl+V)]',
    '',
    'Pozdrawiam',
  ].join('\r\n');
}

// Schowek z zapasowym sposobem: navigator.clipboard działa tylko na HTTPS i localhost,
// a stronę testujemy też przez adres w sieci lokalnej (http://192.168.…).
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // przechodzimy do sposobu zapasowego
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  document.body.removeChild(textarea);
  return ok;
}
