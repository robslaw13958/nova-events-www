import { timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { CATALOG_TAG } from '@/lib/getProducts';

// Wołany przez skrypt w arkuszu Google po każdej zmianie (scripts/arkusz/odswiezanie-strony.gs).
// Oznacza dane katalogu jako nieaktualne — każda strona pobierze arkusz od nowa przy
// najbliższej wizycie (ta wizyta dostaje jeszcze poprzednią wersję, kolejne już nową).
// Wymaga zmiennej REVALIDATE_SECRET na Vercelu; skrypt wysyła ją jako „Authorization: Bearer …”.

function hasValidToken(request, secret) {
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const a = Buffer.from(token);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return Response.json({ revalidated: false, error: 'Brak REVALIDATE_SECRET na serwerze' }, { status: 500 });
  }
  if (!hasValidToken(request, secret)) {
    return Response.json({ revalidated: false, error: 'Nieprawidłowy token' }, { status: 401 });
  }

  revalidateTag(CATALOG_TAG, 'max');
  return Response.json({ revalidated: true, now: Date.now() });
}
