/**
 * Nova Events — odświeżanie strony po zmianie w arkuszu (Google Apps Script)
 *
 * Po każdej zmianie w arkuszu skrypt powiadamia stronę (POST /api/revalidate), że dane
 * są nieaktualne, więc zmiany widać na stronie po kilkunastu sekundach. Bez zmian strona
 * nie pyta arkusza (poza zapasowym odświeżeniem co godzinę).
 *
 * Instalacja (jednorazowo, w arkuszu z produktami):
 * 1. Rozszerzenia → Apps Script → wklej ten plik w miejsce zawartości Code.gs → Zapisz.
 * 2. Ustawienia projektu (koło zębate) → Właściwości skryptu → dodaj dwie właściwości:
 *      SITE_URL           adres strony, np. https://novaevents.pl (bez „/” na końcu)
 *      REVALIDATE_SECRET  ten sam ciąg co zmienna REVALIDATE_SECRET na Vercelu
 * 3. W edytorze wybierz funkcję „zainstaluj” → Uruchom → zatwierdź uprawnienia.
 * 4. Odśwież kartę arkusza — pojawi się menu „Strona WWW” z ręcznym odświeżeniem.
 *
 * Kod strony: src/app/api/revalidate/route.js, src/lib/getProducts.js
 */

// Zapas na zapisanie zmiany po stronie Google, zanim strona pobierze arkusz od nowa
const OPOZNIENIE_MS = 5000;

function zainstaluj() {
  const arkusz = SpreadsheetApp.getActive();
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'poZmianie')
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('poZmianie').forSpreadsheet(arkusz).onChange().create();
  arkusz.toast('Strona będzie się odświeżać po każdej zmianie w arkuszu.', 'Strona WWW');
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Strona WWW')
    .addItem('Odśwież stronę teraz', 'odswiezRecznie')
    .addToUi();
}

// Wyzwalacz „przy zmianie”: edycja komórek, wklejanie, dodanie lub usunięcie wierszy i kolumn
function poZmianie(e) {
  if (e && e.changeType === 'FORMAT') return; // samo formatowanie nie zmienia danych na stronie
  Utilities.sleep(OPOZNIENIE_MS);
  odswiezStrone();
}

function odswiezRecznie() {
  const wynik = odswiezStrone();
  SpreadsheetApp.getActive().toast(
    wynik.ok ? 'Strona pobierze aktualne dane z arkusza.' : `Nie udało się: ${wynik.komunikat}`,
    'Strona WWW'
  );
}

function odswiezStrone() {
  const wlasciwosci = PropertiesService.getScriptProperties();
  const siteUrl = (wlasciwosci.getProperty('SITE_URL') || '').replace(/\/$/, '');
  const secret = wlasciwosci.getProperty('REVALIDATE_SECRET');
  if (!siteUrl || !secret) {
    return { ok: false, komunikat: 'uzupełnij SITE_URL i REVALIDATE_SECRET we właściwościach skryptu' };
  }

  const res = UrlFetchApp.fetch(`${siteUrl}/api/revalidate`, {
    method: 'post',
    headers: { Authorization: `Bearer ${secret}` },
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() !== 200) {
    console.error(`Odświeżenie strony: HTTP ${res.getResponseCode()} ${res.getContentText()}`);
    return { ok: false, komunikat: `strona odpowiedziała HTTP ${res.getResponseCode()}` };
  }

  // Pierwsza wizyta po odświeżeniu dostaje jeszcze poprzednią wersję i w tle generuje nową —
  // robimy ją sami, żeby klienci od razu widzieli zmiany na stronie głównej
  UrlFetchApp.fetch(`${siteUrl}/`, { muteHttpExceptions: true });
  return { ok: true };
}
