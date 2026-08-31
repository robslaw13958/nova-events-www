import Link from 'next/link';
import { NAV_LINKS } from '@/lib/navLinks';
import s from '@/app/page.module.css';

export default function SiteFooter() {
  return (
    <footer>
      <div className={s.goldLine} style={{ opacity: 0.2 }} />
      <div className={s.footerInner}>
        <div className={s.footerBrand}>
          <span className={s.footerLogo}>Nova Events</span>
          <p className={s.footerTagline}>
            Wyposażenie cateringowe na wynajem i sprzedaż hurtową.<br />
            Obsługujemy eventy, wesela, konferencje i gastronomię.
          </p>
        </div>
        <div className={s.footerContact}>
          <p className={s.footerContactLabel}>Kontakt</p>
          <a href="tel:+48123456789" className={s.footerPhone}>+48 123 456 789</a>
          <a href="mailto:kontakt@novaevents.pl" className={s.footerMail}>kontakt@novaevents.pl</a>
          <p className={s.footerHours}>Pn–Pt, 8:00–17:00</p>
        </div>
        <div className={s.footerContact}>
          <p className={s.footerContactLabel}>Nawigacja</p>
          <nav>
            <ul className={s.footerNav}>
              {NAV_LINKS.map(l => (
                <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
      <div className={s.footerBottom}>
        <span>© {new Date().getFullYear()} Nova Events · Sprzedaż hurtowa i detaliczna</span>
      </div>
    </footer>
  );
}
