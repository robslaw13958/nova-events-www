# Stan projektu — Nova Events (katalog cateringowy)

_Ostatnia aktualizacja: 2026-08-31_

## 1. Opis aplikacji

Nova Events to jednostronicowy (właściwie dwuwidokowy) katalog produktowy B2B/B2C dla
wypożyczalni/sprzedawcy wyposażenia cateringowego (stoły, krzesła, ławki itp.). Aplikacja
prezentuje produkty z wariantami kolorystycznymi, cenami detalicznymi i hurtowymi, umożliwia
filtrowanie/wyszukiwanie oraz budowanie koszyka zapytania ofertowego. Dane produktowe pochodzą
z opublikowanego arkusza Google Sheets (eksport CSV), bez własnego backendu ani bazy danych.

**Stack:** Next.js 16 (App Router, React 19), Zustand (stan globalny), czysty CSS Modules,
`papaparse` do parsowania CSV, brak TypeScript, brak testów.

## 2. Struktura i mechanizmy

| Element | Plik | Opis |
|---|---|---|
| Strona główna (katalog) | `src/app/page.js` + `CatalogClient.js` | Server Component pobiera dane, przekazuje do Client Component z filtrami, sortowaniem, lightboxem, modalem koszyka |
| Strona produktu | `src/app/[id]/page.js` (Server) + `ProductPageClient.js` + `VariantGrid.js` | Server Component pobiera i wyszukuje produkt server-side, `notFound()` przy braku, `generateMetadata`/`generateStaticParams`; `loading.js` pokazuje skeleton podczas fetchowania |
| Koszyk | `src/components/Cart.js` + `src/lib/cartStore.js` | Zustand + `persist` (localStorage), próg cenowy hurt/detal (`HURT_PROG = 20 szt.`) |
| Motyw jasny/ciemny | `src/lib/themeStore.js` | Zustand + localStorage + inline skrypt anty-FOUC w `layout.js` |
| Źródło danych | `src/lib/getProducts.js` | Fetch CSV z Google Sheets, parser `papaparse`, grupowanie wierszy → produkty z wariantami, dane zastępcze (fallback) na wypadek błędu |
| Wspólne komponenty | `src/components/Lightbox.js`, `src/lib/dostepnosc.js`, `src/lib/format.js` | Lightbox/ZoomIcon, klasyfikacja statusu dostępności i formatowanie cen — wydzielone, używane w katalogu i na stronie produktu |
| Filtry katalogu | `src/lib/autoFilters.js` | **W pełni automatyczne** — filtry powstają z dowolnej kolumny arkusza (poza ID/Nazwa/Zdjęcie/cenami), bez presetów w kodzie; patrz sekcja 4 |
| Skeletony | `src/components/Skeleton.js` | Skeleton ładowania, teraz spięty z App Routerowym `loading.js` dla strony produktu |
| SEO | `src/app/sitemap.js`, `src/app/robots.js` | Sitemapa (katalog + wszystkie produkty) i robots.txt |

## 3. Co działa dobrze

- Server/Client Component rozdzielone tam, gdzie to ma sens — dane pobierane i cache'owane
  po stronie serwera (`revalidate: 300`) zarówno dla katalogu, jak i strony produktu.
- Sensowny model danych: grupowanie wierszy arkusza w produkty z wariantami kolorystycznymi.
- Obsługa awaryjna (fallback produkty), gdy arkusz jest niedostępny — apka się nie wywala.
- Koszyk z progiem cen hurt/detal, trwały (localStorage) przez `zustand/persist`.
- Anty-FOUC dla motywu (inline script w `<head>` przed hydratacją).
- Responsywność (osobne akcje mobile/desktop na kartach produktów), dostępność podstawowa (aria-label, obsługa Escape w modalach/lightboxie).
- Brak sekretów w repo, `.env*` poprawnie w `.gitignore`.
- `npm run lint` przechodzi czysto.

## 4. Naprawione w tym przejściu

1. **Usunięto błędne `'use server'`** z `src/app/page.js` — Server Component nie wymaga
   żadnej dyrektywy, dyrektywa ta jest zarezerwowana dla Server Actions.
2. **Strona produktu przeniesiona na serwer.** `src/app/[id]/page.js` jest teraz `async`
   Server Component: pobiera dane przez `getProducts()` (korzysta z tego samego cache'a co
   katalog), woła `notFound()` gdy produkt nie istnieje (własny `not-found.js`), ma
   `generateMetadata` (tytuł/opis per produkt) i `generateStaticParams` (prerenderowanie).
   Logika kliencka (motyw, modal koszyka) przeniesiona do `ProductPageClient.js`. Podczas
   fetchowania danych Next automatycznie pokazuje `loading.js`, który renderuje istniejący
   `ProductSkeletonPage`.
3. **Sprawny, przetestowany parser CSV.** Ręczny parser zastąpiony biblioteką `papaparse`
   — poprawnie obsługuje wielowierszowe pola, cudzysłowy, `\r\n`.
4. **Usunięto duplikację kodu.** `Lightbox`/`ZoomIcon` wydzielone do
   `src/components/Lightbox.js`, klasyfikacja statusu dostępności do
   `src/lib/dostepnosc.js` — używane wspólnie przez `CatalogClient.js` i `VariantGrid.js`.
   Przy okazji usunięto martwą (nieużywaną) funkcję `dostepnoscDot` i nieużywany import
   `Image`, które zostały w starym `[id]/page.js`.
5. **Usunięto `console.log` logujący całą listę produktów/filtrów** przy każdym renderze
   strony głównej.
6. **Dodano `sitemap.js` i `robots.js`** (App Router file-based API) — sitemapa obejmuje
   stronę główną i wszystkie produkty. Wymaga ustawienia `NEXT_PUBLIC_SITE_URL` w środowisku
   produkcyjnym (patrz sekcja 6).
7. **Usunięto nieużywane domyślne SVG-i** z `create-next-app` (`next.svg`, `vercel.svg`,
   `globe.svg`, `window.svg`, `file.svg`).
8. **Ujednolicono formatowanie kwot** (`src/lib/format.js`, `Intl.NumberFormat('pl-PL')`) —
   sumy w koszyku poprawnie pokażą separator tysięcy przy większych zamówieniach.
9. **Naprawiono literówkę wielkości liter w danych fallback** (`getProducts.js`) —
   `sztaplowanie` → `Sztaplowanie`, zgodnie z kluczem czytanym w `groupProducts`. Wcześniej
   wszystkie produkty zastępcze (używane, gdy arkusz jest niedostępny) miały
   `sztaplowanie: 0` niezależnie od realnej wartości.
10. **Usunięto błędną zależność `"node": "^24.16.0"`** z `dependencies` w `package.json`
    (pakiet npm `node` to binarka Node.js — nie powinien być zależnością aplikacji, nie był
    nawet zainstalowany ani nigdzie importowany). Wymaganą wersję Node przeniesiono do
    właściwego pola `engines`.
11. **Naprawiono nawigację `<a href="/">` → `next/link`** w przeniesionym kodzie strony
    produktu (blokowało to client-side routing i było zgłaszane przez regułę ESLint
    `@next/next/no-html-link-for-pages`).
12. **Przycisk „Wyślij zapytanie” w koszyku wyłączony z komunikatem „wkrótce”** — zgodnie z
    decyzją, że pełne podłączenie (mailto/WhatsApp/API) zrobimy w osobnym kroku; przycisk już
    nie sprawia wrażenia działającego na darmo.

**Weryfikacja:** `npm run lint` przechodzi bez błędów i ostrzeżeń. **Nie udało się** uruchomić
`npm run build`/`npm run dev` w tym środowisku — zainstalowany lokalnie Node.js 18.19.1 jest
starszy niż wymagany przez Next.js 16 (`>=20.9.0`) i przez samo `package.json` (`^24.16.0`).
To ograniczenie środowiska, niezwiązane z wprowadzonymi zmianami — **zalecana ręczna
weryfikacja builda/działania aplikacji na maszynie z właściwą wersją Node** przed wdrożeniem.

## 4a. Filtry katalogu — w pełni automatyczne (nowa architektura)

Na życzenie zmieniono filtry katalogu z ręcznie zakodowanych presetów (Typ/Linia/Składanie/
Sztaplowanie/Outlet) na silnik, który sam wykrywa, co ma być filtrem, na podstawie kolumn
arkusza — bez zmian w kodzie przy nowej kolumnie.

**Jak to działa** (`src/lib/autoFilters.js` + `collectFields` w `getProducts.js`):
1. Każdy produkt zbiera surowe wartości WSZYSTKICH kolumn arkusza (poza `ID`, `Produkt`,
   `Nazwa`, `Zdjęcie` i cenami — te mają już dedykowaną obsługę: nazwa/wyszukiwarka, zdjęcie,
   sortowanie po cenie) do `product.fields[nazwaKolumny]`. Dotyczy to zarówno kolumn na
   poziomie produktu (Linia, Typ...), jak i wariantu (Kolor, Outlet, Dostępność) — zgodnie z
   decyzją, produkt "pasuje", jeśli którykolwiek jego wariant spełnia warunek.
2. Kolumna staje się **checkboxem**, jeśli wszystkie jej wartości to `TRUE`/`FALSE`.
3. Kolumna staje się **filtrem wielokrotnego wyboru** (pills), jeśli ma 2–12 unikalnych
   wartości, z czego **przynajmniej jedna powtarza się u więcej niż jednego produktu**.
   Ten warunek powtarzalności (a nie tylko limit liczby wartości) jest kluczowy: chroni przed
   tym, żeby np. pole `Opis` w małym katalogu (gdzie każdy produkt ma unikalny opis) przypadkiem
   stało się filtrem — sprawdzone symulacją na przykładowych danych.
3a. Kolumny opisowe `Opis` i `Wymiary` są wykluczone z filtrów na stałe (`EXCLUDED_FIELDS`
   w `autoFilters.js`), a kolumna, której którakolwiek wartość ma > 24 znaki, nie zostanie
   filtrem — długie pigułki (np. 10 wariantów wymiarów) rozsadzały panel filtrów.
4. W pozostałych przypadkach (wolny tekst, zbyt duża różnorodność, brak powtórzeń) kolumna jest
   pomijana jako filtr — nadal jest jednak przeszukiwana przez pole wyszukiwania (`Szukaj`
   teraz przeszukuje nazwę + wartości wszystkich zebranych pól, nie tylko `Typ`/`Linia` jak
   wcześniej).
5. Etykiety filtrów to wprost nazwy kolumn z arkusza (bez tłumaczeń w kodzie) — zgodnie z
   ustaleniem "zero konfiguracji".

**Efekt uboczny — dwa kolejne naprawione bugi**, znalezione przy tej okazji:
- **Filtr „Outlet” nigdy nie działał.** Stary kod sprawdzał `p.outlet` na obiekcie produktu,
  a `outlet` istniał tylko na poziomie wariantu (`wariant.outlet`) — checkbox więc zawsze
  ukrywał wszystkie produkty. Nowy silnik czyta wartość poprawnie z wariantów.
- **Sortowanie „Cena ↑/↓” nic nie robiło.** Kod sortował po `a.cenaHurtNum`/`b.cenaHurtNum`
  bezpośrednio na obiekcie produktu, a to pole istnieje tylko na wariantach
  (`wariant.cenaHurtNum`) — porównanie dawało zawsze `NaN` i kolejność się nie zmieniała.
  Naprawione: sortowanie po najniższej cenie hurtowej spośród wariantów produktu.

**Świadomy kompromis automatyzacji:** kolumna liczbowa o niskiej liczbie unikalnych wartości
(np. `Sztaplowanie`: 0/10/18) pokazuje się jako lista literalnych wartości do wyboru, a nie
inteligentny filtr typu "tylko sztaplowalne" — silnik nie wie, że `0` znaczy "nie". To świadoma
decyzja (pełna automatyka > ręcznie dobrana semantyka pojedynczej kolumny).

## 5. Świadomie odłożone (decyzje z tej sesji)

- **Koszyk wciąż nie wysyła zapytania nigdzie** — przycisk jest tylko wyłączony z opisem
  „wkrótce”. Docelowy mechanizm (mailto / WhatsApp / API + e-mail) do ustalenia i wdrożenia
  osobno.
- **Martwe linki nawigacyjne** („Katalog”, „Zamówienia hurtowe”, „O nas”, „Kontakt” →
  `href="#"`) pozostawione bez zmian — czekają na docelowe podstrony.
- **Brak testów jednostkowych i migracji do TypeScript** — świadomie poza zakresem tego
  przejścia (duży nakład pracy). Patrz rekomendacje niżej.

## 6. Co jeszcze warto poprawić / dodać

1. **Dokończyć cel biznesowy koszyka** — podłączyć „Wyślij zapytanie” pod realny mechanizm:
   API route wysyłające e-mail (np. Resend/Nodemailer), `mailto:` z gotową treścią, lub
   WhatsApp link — inaczej cała funkcja koszyka pozostaje fasadą.
2. **Ustawić `NEXT_PUBLIC_SITE_URL`** w środowisku produkcyjnym (używane przez nowe
   `sitemap.js`/`robots.js`; obecnie fallback to placeholder `https://novaevents.pl`).
3. **Strony dla linków nawigacyjnych** („O nas”, „Kontakt”, „Zamówienia hurtowe”) albo ich
   usunięcie, jeśli nie są planowane w najbliższym czasie.
4. **Testy jednostkowe** dla logiki w `getProducts.js` (grupowanie, parsowanie cen) i
   `cartStore.js` (próg hurt/detal) — Vitest + Testing Library.
5. **Walidacja schematu danych z arkusza** (np. Zod) — nawet z `papaparse` literówka w
   nazwie kolumny w Google Sheets nadal cicho wyzeruje pole zamiast dać czytelny błąd/alert.
6. **Panel administracyjny lub healthcheck** informujący, gdy aplikacja działa na danych
   fallback (arkusz niedostępny) — obecnie nikt się o tym nie dowie poza logiem serwera.
7. **Rozważyć TypeScript** przy kolejnej większej zmianie w warstwie danych — największa
   dźwignia przeciw literówkom w nazwach pól z arkusza (patrz pkt 5).
8. **Rozbić `page.module.css`** (~1400 linii) na mniejsze moduły (header, filtry, karta
   produktu, footer) dla łatwiejszej nawigacji — czysto kosmetyczne, niski priorytet.
9. **Paginacja/lazy loading** katalogu, gdy liczba produktów w arkuszu znacząco wzrośnie —
   obecnie cała lista pobierana i renderowana naraz.
