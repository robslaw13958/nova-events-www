'use client';

import { useEffect } from 'react';
import Image from 'next/image';

export function ZoomIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

export function Lightbox({ src, alt, onClose, styles }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className={styles.lightbox} onClick={onClose}>
      <button className={styles.lightboxClose} onClick={onClose} aria-label="Zamknij">✕</button>
      <div className={styles.lightboxImgWrap} onClick={e => e.stopPropagation()}>
        <Image src={src} alt={alt || ''} fill className={styles.lightboxImg} sizes="100vw" />
      </div>
    </div>
  );
}
