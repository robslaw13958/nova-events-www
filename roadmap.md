# Roadmapa — Nova Events

Kontekst: strona to przede wszystkim **katalog wysyłany klientom jako link**, a nie sklep
nastawiony na ruch z wyszukiwarki. Treścią zarządza się w Google Sheets + Google Drive
i ma tak zostać, bo to najprostszy interfejs dla osoby, która ją edytuje.
Sprzedaż traktujemy standardowo, wynajem jest ustalany indywidualnie.

## Zrobione

- [x] **Zapytanie ofertowe bez backendu** (2026-10-05): e-mail przez `mailto` z gotową treścią,
      jednocześnie kopia w schowku, do tego przyciski „Kopiuj zapytanie”, WhatsApp i telefon.
      Dane kontaktowe w jednym pliku: `src/lib/contact.js`.

## Do zrobienia w pierwszej kolejności

### Uzupełnić dane kontaktowe
- [x] Telefon, numer WhatsApp i godziny w `src/lib/contact.js`.
- [ ] Prawdziwy adres e-mail w `src/lib/contact.js` (obecnie przykładowy `kontakt@novaevents.pl`).

### Filtry zapisywane w adresie strony
- [x] Zapis filtrów i sortowania w adresie, np. `/?Linia=PREMIUM&Typ=krzesło`.
  - Po powrocie z karty produktu filtry się nie resetują.
  - Można wysłać klientowi link do gotowego zestawienia („tylko krzesła PREMIUM”).

### Podgląd linku i SEO
- [x] Obrazki i opisy Open Graph dla stron produktów, żeby link wysłany na WhatsAppie
      lub Messengerze pokazywał zdjęcie, nazwę i cenę. Dla tego katalogu to ważniejsze niż SEO.
- [x] Dane strukturalne `Product` (JSON-LD): cena i dostępność w wynikach Google.
- [ ] **(poza kodem)** Gdy strona dostanie własną domenę: ustawić `NEXT_PUBLIC_SITE_URL`
      na Vercelu (np. `https://novaevents.pl`). Do tego czasu adres jest brany automatycznie
      z adresu produkcyjnego projektu na Vercelu (`src/lib/siteUrl.js`).
- [ ] Po wdrożeniu sprawdzić podgląd linku w https://developers.facebook.com/tools/debug/
      (ten sam mechanizm co WhatsApp i Messenger).

### Zdjęcia z Google Drive: uodpornić, nie zmieniać
- [ ] **(poza kodem)** Udostępnić cały folder ze zdjęciami jako „Każda osoba mająca link”.
      Nowe pliki dziedziczą to ustawienie. Teraz zdjęcie „Stół bankietowy” nie jest publiczne.
- [ ] `images.minimumCacheTTL` około 7 dni (domyślnie 4 h): rzadsze pobieranie z Drive,
      szybsze ładowanie. Uwaga: nadpisanie pliku nową wersją pokaże się z opóźnieniem.
      Wgranie nowego pliku działa od razu, bo ma nowy link.
- [ ] Zastępczy obrazek, gdy zdjęcie się nie załaduje (zamiast ikony zepsutej grafiki).
- [ ] Ukryta strona `/status` dla osoby edytującej arkusz: produkty bez zdjęcia
      lub z niedostępnym zdjęciem, oraz informacja, czy strona działa na danych zapasowych.

## Na później (razem ze zmianami w arkuszu)

### Porządek w arkuszu
- [ ] Kolumna `Kategoria` (np. Meble / Atrakcje) i zakładki nad katalogiem. Byk rodeo,
      Eliminator i Piana party nie mają dziś `Typ` ani `Linia`.
- [ ] Kolumna `Slug` dla czytelnych adresów (`/krzeslo-bankietowe-premium` zamiast
      `/Krzesło bankietowe_PREMIUM_krzesło_18_`).
- [ ] Rozróżnić nazwy podobnych produktów: „Krzesło bankietowe” i „Krzesło bankietowe Premium”
      (np. „rama srebrna” / „rama złota”).
- [ ] Jeden format wymiarów (dziś obok siebie „44cm szer x 93cm wys” i „46 cm gł. × 45 cm szer.”).
- [ ] Czytelniejsze etykiety filtra `Sztaplowanie` (dziś wartości 0 / 10 / 18).
- [ ] Opcjonalnie konwencje w opisach (np. punkty listy zaczynane od „- ”), żeby parser
      w `src/lib/opis.js` nie musiał zgadywać struktury.

### Testy
- [ ] Vitest: parser opisów (`src/lib/opis.js`) na prawdziwych opisach z arkusza,
      parsowanie cen i grupowanie wariantów (`getProducts.js`), progi cenowe koszyka
      i treść zapytania (`cartStore.js`, `zapytanie.js`).

### Gdy zapytań będzie dużo
- [ ] Formularz wysyłany z serwera (Route Handler na Vercelu + np. Resend) zamiast `mailto`.
      Wymaga: konta w usłudze mailowej, wpisów DNS domeny (SPF/DKIM), klucza API
      w zmiennych środowiskowych, ochrony przed spamem i klauzuli RODO.

### Do decyzji biznesowej
- [ ] Wynajem: jeśli stanie się ważny, potrzebne będą ceny za dobę, wybór terminu
      i dostępność w terminie. Stopka wspomina o wynajmie, a strona obsługuje tylko sprzedaż.
