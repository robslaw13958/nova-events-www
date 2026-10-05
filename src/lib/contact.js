// Dane kontaktowe w jednym miejscu — używane w stopce, na stronie Kontakt i w koszyku.
// TODO: uzupełnić prawdziwymi danymi (obecne wartości to przykłady).
export const CONTACT = {
  email: 'kontakt@novaevents.pl',
  phone: '+48 788 547 012',
  // Numer do WhatsAppa; pusty string ukrywa przycisk WhatsApp w koszyku
  whatsapp: '+48 788 547 012',
  hours: 'Pn–Pt, 8:00–20:00',
};

export function phoneHref(phone = CONTACT.phone) {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

export function mailtoHref({ subject, body } = {}, email = CONTACT.email) {
  const params = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${email}${params.length ? `?${params.join('&')}` : ''}`;
}

// wa.me wymaga numeru w formacie międzynarodowym, same cyfry bez „+”
export function whatsappHref(text, phone = CONTACT.whatsapp) {
  const digits = phone.replace(/\D/g, '');
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}
