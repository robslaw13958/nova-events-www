'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CartIcon } from '@/components/Cart';
import { useTheme } from '@/lib/themeStore';
import { NAV_LINKS } from '@/lib/navLinks';
import s from '@/app/page.module.css';

export default function SiteHeader() {
  const { theme, initTheme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  useEffect(() => {
    const handler = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <header className={s.header}>
        <div className={s.headerInner}>
          <Link href="/" className={s.logo}>
            <span className={s.logoName}>Nova Events</span>
            <span className={s.logoTag}>Wyposażenie Cateringowe</span>
          </Link>
          <div className={s.headerRight}>
            <nav className={s.desktopNav}>
              <ul className={s.navLinks}>
                {NAV_LINKS.map(l => (
                  <li key={l.href}>
                    <Link href={l.href} aria-current={pathname === l.href ? 'page' : undefined}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <CartIcon />
            <button className={s.themeToggle} onClick={toggleTheme} aria-label="Zmień motyw" />
            <button
              className={`${s.hamburger} ${menuOpen ? s.hamburgerOpen : ''}`}
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Menu"
              aria-expanded={menuOpen}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
        <div className={s.goldLine} />
      </header>

      <div
        className={`${s.mobileMenuOverlay} ${menuOpen ? s.mobileMenuOverlayOpen : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      <nav className={`${s.mobileMenu} ${menuOpen ? s.mobileMenuOpen : ''}`}>
        <div className={s.mobileMenuHeader}>
          <span className={s.mobileMenuLogo}>Nova Events</span>
          <button className={s.mobileMenuClose} onClick={() => setMenuOpen(false)}>✕</button>
        </div>
        <ul className={s.mobileNavLinks}>
          {NAV_LINKS.map(l => (
            <li key={l.href}>
              <Link href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</Link>
            </li>
          ))}
        </ul>
        <div className={s.mobileMenuFooter}>
          <button className={s.mobileThemeBtn} onClick={toggleTheme}>
            {theme === 'dark' ? '☀ Jasny motyw' : '☾ Ciemny motyw'}
          </button>
        </div>
      </nav>
    </>
  );
}
