import Link from 'next/link';
import s from './product.module.css';

export default function NotFound() {
  return (
    <div className={s.wrapper}>
      <main className={s.main}>
        <div style={{ padding: '96px 0', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-dim)', marginBottom: 24 }}>
            Nie znaleziono produktu
          </p>
          <Link href="/" className={s.backLink}>← Wróć do katalogu</Link>
        </div>
      </main>
    </div>
  );
}
