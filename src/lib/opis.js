/**
 * Opisy produktów z arkusza to wolny tekst z akapitami rozdzielonymi pustą linią, np.:
 *
 *   Krzesło bankietowe granatowe PREMIUM – elegancja i solidne wykonanie   ← tytuł
 *   Krzesło bankietowe z linii PREMIUM, stworzone z myślą o …               ← akapit
 *   Najważniejsze cechy:                                                    ← nagłówek
 *   Waga: 5,6 kg                                                            ← parametr
 *   Stabilna i wytrzymała konstrukcja                                       ← punkt listy
 *
 * Parser rozpoznaje te elementy heurystycznie, żeby strona produktu mogła je pokazać
 * czytelnie zamiast jednego bloku tekstu.
 */

const MAX_NOTE_LENGTH = 160;
const MAX_TITLE_LENGTH = 120;
const MAX_HEADING_LENGTH = 60;
const MAX_ITEM_LENGTH = 100;
const SPEC_RE = /^([^:]{2,30}):\s*(.+)$/;

// Krótka jednolinijkowa uwaga do wariantu (np. „Lekkie zarysowania” przy outlecie),
// a nie pełny opis produktu.
export function isOpisNote(text = '') {
  return !!text && text.length < MAX_NOTE_LENGTH && !text.includes('\n');
}

function splitLines(text) {
  return text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map(line => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function classifyLine(line, index) {
  const endsSentence = /[.!]$/.test(line);
  if (index === 0 && line.length <= MAX_TITLE_LENGTH && !endsSentence) {
    return { type: 'title', text: line };
  }
  if (/[:?]$/.test(line) && line.length <= MAX_HEADING_LENGTH) {
    return { type: 'heading', text: line.replace(/:$/, '') };
  }
  if (line.length <= MAX_ITEM_LENGTH) {
    // „Wymiary: 180 cm dł. × 70 cm szer.” — kropka skrótu nie kończy zdania
    const spec = line.match(SPEC_RE);
    if (spec) return { type: 'item', label: spec[1].trim(), value: spec[2].trim() };
    if (!endsSentence && !line.endsWith('?')) return { type: 'item', text: line };
  }
  return { type: 'p', text: line };
}

/**
 * Zwraca listę bloków: { type: 'title' | 'heading' | 'p', text }
 * oraz { type: 'list', items: [{ text } | { label, value }] } dla kolejnych punktów.
 */
export function parseOpis(text = '') {
  const blocks = [];
  for (const [i, line] of splitLines(text).entries()) {
    const block = classifyLine(line, i);
    if (block.type !== 'item') {
      blocks.push(block);
      continue;
    }
    const item = block.label ? { label: block.label, value: block.value } : { text: block.text };
    const last = blocks[blocks.length - 1];
    if (last?.type === 'list') last.items.push(item);
    else blocks.push({ type: 'list', items: [item] });
  }

  // Pojedyncza krótka linia między akapitami to śródtytuł, a nie jednoelementowa lista
  return blocks.map((block, i) => {
    const isLoneItem = block.type === 'list' && block.items.length === 1 && block.items[0].text;
    if (isLoneItem && blocks[i - 1]?.type === 'p' && blocks[i + 1]?.type === 'p') {
      return { type: 'heading', text: block.items[0].text };
    }
    return block;
  });
}

// Pierwszy akapit opisu skrócony do `max` znaków — na zajawki i meta description.
export function opisExcerpt(text = '', max = 160) {
  const first = parseOpis(text).find(b => b.type === 'p')?.text || '';
  if (first.length <= max) return first;
  const cut = first.slice(0, max);
  const words = cut.slice(0, cut.lastIndexOf(' '));
  if (/[.!?]$/.test(words)) return words;
  return `${words.replace(/[,;:–-]$/, '')}…`;
}
