'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useCart, HURT_PROG, cenaItem } from '@/lib/cartStore';
import { formatPrice } from '@/lib/format';
import { CONTACT, mailtoHref, phoneHref, whatsappHref } from '@/lib/contact';
import { ZAPYTANIE_TEMAT, buildZapytanie, zapytanieMailBody, copyToClipboard } from '@/lib/zapytanie';
import s from './cart.module.css';

/* ─── Cart Icon (dla headera) ────────────────────────────────────────────── */
export function CartIcon() {
  const { items, toggleCart } = useCart();
  const totalItems = items.reduce((sum, i) => sum + i.ilosc, 0);

  return (
    <button className={s.cartIconBtn} onClick={toggleCart} aria-label="Koszyk">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
      {totalItems > 0 && (
        <span className={s.cartIconBadge}>{totalItems > 99 ? '99+' : totalItems}</span>
      )}
    </button>
  );
}

/* ─── Shared helpers ─────────────────────────────────────────────────────── */
function ColorDot({ hex }) {
  return <span className={s.colorDot} style={{ background: hex }} />;
}

function QtyBtn({ onClick, children, small }) {
  return (
    <button className={small ? s.qtyBtnSm : s.qtyBtn} onClick={onClick}>
      {children}
    </button>
  );
}

/* ─── Add to Cart Modal ──────────────────────────────────────────────────── */
export function AddToCartModal({ product, wariantIndex, onClose }) {
  const [ilosc, setIlosc] = useState(1);
  const addItem = useCart(state => state.addItem);
  const wariant = product.warianty[wariantIndex];

  const isHurt  = ilosc >= HURT_PROG;
  const cena    = isHurt ? wariant.cenaHurtNum : wariant.cenaDetalNum;
  const suma    = formatPrice(cena * ilosc);

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const confirm = useCallback(() => {
    addItem(product, wariantIndex, ilosc);
    onClose();
  }, [addItem, product, wariantIndex, ilosc, onClose]);

  const setQty = val => setIlosc(Math.max(1, Math.round(parseInt(val) || 1)));

  return (
    <div className={s.modalOverlay} onClick={onClose}>
      <div className={s.modal} onClick={e => e.stopPropagation()}>

        <button className={s.modalClose} onClick={onClose} aria-label="Zamknij">✕</button>

        {/* Produkt */}
        <div className={s.modalTop}>
          {wariant.zdjecie && (
            <div className={s.modalImgWrap}>
              <Image src={wariant.zdjecie} alt={product.name} fill
                style={{ objectFit: 'contain' }} sizes="90px" />
            </div>
          )}
          <div className={s.modalMeta}>
            <p className={s.modalCategory}>
              {product.linia ? `${product.linia} · ${product.typ}` : product.typ}
            </p>
            <h2 className={s.modalName}>{product.name}</h2>
            <div className={s.modalColorRow}>
              <ColorDot hex={wariant.hex} />
              <span className={s.modalColorName}>{wariant.kolor}</span>
            </div>
          </div>
        </div>

        <div className={s.divider} />

        {/* Ilość */}
        <div className={s.modalSection}>
          <p className={s.sectionLabel}>Ilość</p>
          <div className={s.qtyRow}>
            <QtyBtn onClick={() => setQty(ilosc - 1)}>−</QtyBtn>
            <input
              className={s.qtyInput}
              type="number"
              min="1"
              value={ilosc}
              onChange={e => setQty(e.target.value)}
            />
            <QtyBtn onClick={() => setQty(ilosc + 1)}>+</QtyBtn>
          </div>
        </div>

        {/* Cennik */}
        <div className={s.pricingBox}>
          <div className={`${s.pricingRow} ${!isHurt ? s.pricingRowActive : ''}`}>
            <div>
              <span className={s.pricingLabel}>Cena detaliczna</span>
              <span className={s.pricingMeta}> — poniżej {HURT_PROG} szt.</span>
            </div>
            <span className={s.pricingValue}>{wariant.cenaDetal} zł</span>
          </div>
          <div className={`${s.pricingRow} ${isHurt ? s.pricingRowActive : ''}`}>
            <div>
              <span className={s.pricingLabel}>Cena hurtowa</span>
              <span className={s.pricingMeta}> — od {HURT_PROG} szt.</span>
            </div>
            <span className={s.pricingValue}>{wariant.cenaHurt} zł</span>
          </div>
        </div>

        {/* Suma */}
        <div className={s.modalTotal}>
          <span className={s.modalTotalLabel}>
            {ilosc} × {isHurt ? wariant.cenaHurt : wariant.cenaDetal} zł
          </span>
          <span className={s.modalTotalValue}>{suma} zł</span>
        </div>

        {/* Akcje */}
        <div className={s.modalActions}>
          <button className={s.btnCancel} onClick={onClose}>Anuluj</button>
          <button className={s.btnConfirm} onClick={confirm}>Dodaj do koszyka</button>
        </div>

      </div>
    </div>
  );
}

/* ─── Cart Item Row ──────────────────────────────────────────────────────── */
function CartItemRow({ item }) {
  const removeItem     = useCart(state => state.removeItem);
  const updateQuantity = useCart(state => state.updateQuantity);

  const isHurt   = item.ilosc >= HURT_PROG;
  const cena     = cenaItem(item);
  const subtotal = formatPrice(cena * item.ilosc);
  const cenaLabel = isHurt ? item.cenaHurt : item.cenaDetal;

  return (
    <div className={s.cartItemRow}>
      {item.zdjecie ? (
        <div className={s.cartItemImg}>
          <Image src={item.zdjecie} alt={item.name} fill
            style={{ objectFit: 'contain' }} sizes="64px" />
        </div>
      ) : (
        <div className={s.cartItemImgEmpty} />
      )}

      <div className={s.cartItemBody}>
        <div className={s.cartItemHead}>
          <div>
            <p className={s.cartItemName}>{item.name}</p>
            <div className={s.cartItemColorRow}>
              <ColorDot hex={item.hex} />
              <span className={s.cartItemColorName}>{item.kolor}</span>
              {item.outlet && <span className={s.hurtTag}>outlet</span>}
              {isHurt && <span className={s.hurtTag}>hurt</span>}
            </div>
          </div>
          <button className={s.cartItemRemove}
            onClick={() => removeItem(item.key)} aria-label="Usuń">✕</button>
        </div>

        <div className={s.cartItemFoot}>
          <div className={s.qtyControls}>
            <QtyBtn small onClick={() => updateQuantity(item.key, item.ilosc - 1)}>−</QtyBtn>
            <span className={s.qtyVal}>{item.ilosc}</span>
            <QtyBtn small onClick={() => updateQuantity(item.key, item.ilosc + 1)}>+</QtyBtn>
          </div>
          <div className={s.cartItemPrices}>
            <span className={s.cartItemSubtotal}>{subtotal} zł</span>
            <span className={s.cartItemUnit}>{cenaLabel} zł / szt.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Wysyłka zapytania (mailto + schowek + WhatsApp + telefon) ─────────── */
// Bez backendu: klient wysyła zapytanie własnym programem pocztowym.
// Przy kliknięciu „e-mail” treść trafia też do schowka — gdy na komputerze nie ma
// skonfigurowanego programu pocztowego, klient może ją wkleić w dowolną pocztę.
function InquiryActions({ items }) {
  const [status, setStatus] = useState(null); // 'mail' | 'copied' | 'copyFailed'
  const resetTimer = useRef(null);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const text = () => buildZapytanie(items, window.location.origin);

  const showStatus = (next, ms) => {
    setStatus(next);
    clearTimeout(resetTimer.current);
    if (ms) resetTimer.current = setTimeout(() => setStatus(null), ms);
  };

  const sendMail = async () => {
    const body = text();
    await copyToClipboard(body);
    showStatus('mail');
    window.location.href = mailtoHref({ subject: ZAPYTANIE_TEMAT, body: zapytanieMailBody(body) });
  };

  const copy = async () => {
    const ok = await copyToClipboard(text());
    showStatus(ok ? 'copied' : 'copyFailed', 4000);
  };

  return (
    <div className={s.inquiry}>
      <button className={s.cartCta} onClick={sendMail}>
        Wyślij zapytanie e-mailem
      </button>

      {status === 'mail' && (
        <p className={s.inquiryHint} role="status">
          Treść zapytania jest też w schowku. Jeśli program pocztowy się nie otworzył,
          wklej ją w wiadomość na adres <strong>{CONTACT.email}</strong>.
        </p>
      )}

      <div className={s.inquiryAlt}>
        <button className={s.inquiryBtn} onClick={copy}>
          {status === 'copied' ? 'Skopiowano ✓' : status === 'copyFailed' ? 'Nie udało się skopiować' : 'Kopiuj zapytanie'}
        </button>
        {CONTACT.whatsapp && (
          <a
            className={s.inquiryBtn}
            href={whatsappHref(buildZapytanie(items))}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
        )}
        <a className={s.inquiryBtn} href={phoneHref()}>
          Zadzwoń
        </a>
      </div>

      <p className={s.inquiryNote}>
        Zapytanie jest niezobowiązujące — odpowiemy z potwierdzeniem dostępności i ceny.
      </p>
    </div>
  );
}

/* ─── Cart Drawer ────────────────────────────────────────────────────────── */
export function CartDrawer() {
  const { items, isOpen, closeCart } = useCart();

  const totalQty = items.reduce((sum, i) => sum + i.ilosc, 0);
  const totalVal = items.reduce((sum, i) => sum + cenaItem(i) * i.ilosc, 0);
  const totalStr = formatPrice(totalVal);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = e => { if (e.key === 'Escape') closeCart(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, closeCart]);

  return (
    <>
      <div
        className={`${s.cartOverlay} ${isOpen ? s.cartOverlayOpen : ''}`}
        onClick={closeCart}
      />
      <aside className={`${s.cartDrawer} ${isOpen ? s.cartDrawerOpen : ''}`}>

        <div className={s.cartHead}>
          <div className={s.cartHeadLeft}>
            <h2 className={s.cartTitle}>Koszyk</h2>
            {totalQty > 0 && <span className={s.cartQtyBadge}>{totalQty} szt.</span>}
          </div>
          <button className={s.cartClose} onClick={closeCart} aria-label="Zamknij">✕</button>
        </div>
        <div className={s.drawerGoldLine} />

        {items.length === 0 ? (
          <div className={s.cartEmpty}>
            <p className={s.cartEmptyIcon}>🛒</p>
            <p className={s.cartEmptyText}>Koszyk jest pusty</p>
            <p className={s.cartEmptySub}>Dodaj produkty z katalogu</p>
          </div>
        ) : (
          <>
            <div className={s.cartItems}>
              {items.map(item => <CartItemRow key={item.key} item={item} />)}
            </div>

            <div className={s.cartFoot}>
              <p className={s.cartNote}>
                Cena hurtowa naliczana od {HURT_PROG} szt. danego produktu
              </p>
              <div className={s.cartTotalRow}>
                <span className={s.cartTotalLabel}>Suma</span>
                <span className={s.cartTotalValue}>
                  {totalStr} <span className={s.cartTotalCurrency}>zł</span>
                </span>
              </div>
              <InquiryActions items={items} />
            </div>
          </>
        )}

      </aside>
    </>
  );
}