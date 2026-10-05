import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { loadCatalog } from '@/lib/getProducts';
import { fetchImage } from '@/lib/imageCheck';
import s from '../page.module.css';
import st from './status.module.css';

// Strona dla osoby edytującej arkusz: co w danych wymaga poprawy.
// Nie ma jej w menu ani w mapie strony, a wyszukiwarki jej nie indeksują.
export const metadata = {
  title: 'Status katalogu — Nova Events',
  robots: { index: false, follow: false },
};

const HOW_TO_SHARE = 'Na Dysku Google: prawy klik na plik (najlepiej na cały folder ze zdjęciami) → Udostępnij → Ogólny dostęp: „Każda osoba mająca link”.';

const FIXES = {
  noPhoto: 'Wklej link do zdjęcia w kolumnie „Zdjęcie”.',
  photo: HOW_TO_SHARE,
  noOpis: 'Uzupełnij kolumnę „Opis” (wystarczy w jednym wierszu produktu).',
  noPrice: 'Uzupełnij kolumnę „Cena Detal [zł]”.',
  noDostepnosc: 'Uzupełnij kolumnę „Dostępność”.',
};

async function checkPhotos(products) {
  const urls = [...new Set(products.flatMap(p => p.warianty.map(w => w.zdjecie)).filter(Boolean))];
  const results = await Promise.all(urls.map(async url => {
    const image = await fetchImage(url);
    return [url, image.ok ? null : image.problem];
  }));
  return new Map(results);
}

// Jeden wiersz na produkt i problem — warianty z tym samym problemem są wypisane razem
function collectIssues(products, photoProblems) {
  const issues = [];

  for (const p of products) {
    const byProblem = new Map();
    const add = (problem, fix, wariant) => {
      if (!byProblem.has(problem)) byProblem.set(problem, { product: p, problem, fix, warianty: [] });
      if (wariant) byProblem.get(problem).warianty.push(wariant);
    };

    if (!p.opis) add('Brak opisu produktu', FIXES.noOpis);

    for (const w of p.warianty) {
      const label = w.kolor || 'Standard';
      if (!w.zdjecie) add('Brak zdjęcia', FIXES.noPhoto, label);
      else if (photoProblems.get(w.zdjecie)) add(photoProblems.get(w.zdjecie), FIXES.photo, label);
      if (!w.cenaDetalNum) add('Brak ceny detalicznej', FIXES.noPrice, label);
      if (!w.dostepnosc) add('Brak informacji o dostępności', FIXES.noDostepnosc, label);
    }

    issues.push(...byProblem.values());
  }
  return issues;
}

function formatTime(date) {
  return new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Europe/Warsaw',
  }).format(date);
}

export default async function StatusPage() {
  const { products, source, error } = await loadCatalog();
  const photoProblems = await checkPhotos(products);
  const issues = collectIssues(products, photoProblems);

  const variants = products.flatMap(p => p.warianty);
  const photosOk = variants.filter(w => w.zdjecie && !photoProblems.get(w.zdjecie)).length;
  const fromSheet = source === 'sheet';

  return (
    <div className={s.wrapper}>
      <SiteHeader />

      <div className={s.heroStrip}>
        <h1 className={s.heroTitle}>Status katalogu</h1>
      </div>

      <main className={st.content}>
        <p className={st.lead}>
          Stan na {formatTime(new Date())}. Dane z arkusza odświeżają się co około 5 minut —
          po poprawkach w arkuszu lub na Dysku wróć tu za chwilę.
        </p>

        <div className={st.cards}>
          <div className={`${st.card} ${fromSheet ? st.cardOk : st.cardError}`}>
            <p className={st.cardLabel}>Źródło danych</p>
            <p className={st.cardValue}>{fromSheet ? 'Arkusz Google' : 'Dane zapasowe'}</p>
            <p className={st.cardNote}>
              {fromSheet
                ? 'Katalog pokazuje aktualne dane z arkusza.'
                : `Arkusz jest niedostępny (${error}). Sprawdź, czy arkusz jest nadal opublikowany w internecie.`}
            </p>
          </div>
          <div className={st.card}>
            <p className={st.cardLabel}>Produkty</p>
            <p className={st.cardValue}>{products.length}</p>
            <p className={st.cardNote}>{variants.length} wariantów</p>
          </div>
          <div className={`${st.card} ${photosOk === variants.length ? st.cardOk : st.cardWarn}`}>
            <p className={st.cardLabel}>Działające zdjęcia</p>
            <p className={st.cardValue}>{photosOk} / {variants.length}</p>
            <p className={st.cardNote}>wariantów ma poprawne zdjęcie</p>
          </div>
          <div className={`${st.card} ${issues.length ? st.cardWarn : st.cardOk}`}>
            <p className={st.cardLabel}>Do poprawy</p>
            <p className={st.cardValue}>{issues.length}</p>
            <p className={st.cardNote}>{issues.length ? 'szczegóły poniżej' : 'wszystko w porządku'}</p>
          </div>
        </div>

        {issues.length > 0 && (
          <section className={st.section}>
            <h2 className={st.sectionTitle}>Do poprawy</h2>
            <table className={st.table}>
              <thead>
                <tr>
                  <th>Produkt</th>
                  <th>Warianty</th>
                  <th>Problem</th>
                  <th>Jak naprawić</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue, i) => (
                  <tr key={i}>
                    <td data-label="Produkt">
                      <Link href={`/${encodeURIComponent(issue.product.id)}`} className={st.productLink}>
                        {issue.product.name}
                      </Link>
                      {issue.product.linia && <span className={st.dim}> · {issue.product.linia}</span>}
                    </td>
                    <td data-label="Warianty">
                      {issue.warianty.length && issue.warianty.length < issue.product.warianty.length
                        ? issue.warianty.join(', ')
                        : <span className={st.dim}>wszystkie</span>}
                    </td>
                    <td data-label="Problem" className={st.problem}>{issue.problem}</td>
                    <td data-label="Jak naprawić" className={st.fix}>{issue.fix}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
