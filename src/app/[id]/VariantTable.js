import { dostepnoscStatus } from '@/lib/dostepnosc';
import s from './product.module.css';

export const DOSTEPNOSC_DOT = {
  dostepne:    s.dotDostepne,
  ostatnie:    s.dotOstatnie,
  wkrotce:     s.dotWkrotce,
  niedostepne: s.dotNiedostepne,
};

export function DostepnoscDot({ value }) {
  return <span className={`${s.dot} ${DOSTEPNOSC_DOT[dostepnoscStatus(value)]}`} />;
}

// Porównanie wszystkich wariantów w jednym miejscu; wybór wariantu przełącza panel zakupu
export default function VariantTable({ warianty, activeIndex, onSelect }) {
  return (
    <table className={s.variantTable}>
      <thead>
        <tr>
          <th>Wariant</th>
          <th>Cena detal</th>
          <th>Cena hurt</th>
          <th>Dostępność</th>
          <th><span className={s.srOnly}>Akcja</span></th>
        </tr>
      </thead>
      <tbody>
        {warianty.map((w, i) => {
          const active = i === activeIndex;
          return (
            <tr key={i} className={active ? s.variantRowActive : undefined}>
              <td data-label="Wariant">
                <span className={s.variantName}>
                  <span className={s.swatchDot} style={{ background: w.hex }} />
                  {w.kolor || 'Standard'}
                  {w.outlet && <span className={s.outletTag}>Outlet</span>}
                </span>
              </td>
              <td data-label="Cena detal" className={s.variantPrice}>{w.cenaDetal || '—'} zł</td>
              <td data-label="Cena hurt" className={s.variantPrice}>{w.cenaHurt || '—'} zł</td>
              <td data-label="Dostępność">
                {w.dostepnosc ? (
                  <span className={s.dostepnosc}>
                    <DostepnoscDot value={w.dostepnosc} />
                    {w.dostepnosc}
                  </span>
                ) : '—'}
              </td>
              <td className={s.variantAction}>
                <button
                  className={active ? s.variantSelectBtnActive : s.variantSelectBtn}
                  onClick={() => onSelect(i)}
                  aria-pressed={active}
                >
                  {active ? 'Wybrany' : 'Wybierz'}
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
