'use client';

import s from './skeleton.module.css';

export function SkeletonText({ width = '100%', height = '16px' }) {
  return <div className={s.skeleton} style={{ width, height }} />;
}

export function SkeletonBox({ width = '100%', height = '100px' }) {
  return <div className={s.skeleton} style={{ width, height }} />;
}

export function ProductSkeletonPage() {
  return (
    <div className={s.pageWrapper}>
      {/* Header */}
      <div className={s.header}>
        <div className={s.skeleton} style={{ width: '120px', height: '24px' }} />
      </div>

      {/* Main content */}
      <div className={s.mainContent}>
        {/* Breadcrumb */}
        <div className={s.skeleton} style={{ width: '180px', height: '10px', marginBottom: '28px' }} />

        {/* Galeria + panel zakupu */}
        <div className={s.topSection}>
          <div>
            <div className={s.skeleton} style={{ width: '100%', aspectRatio: '4 / 3', marginBottom: '12px' }} />
            <div className={s.thumbRow}>
              {[1, 2, 3].map(i => (
                <div key={i} className={s.skeleton} style={{ width: '76px', height: '57px' }} />
              ))}
            </div>
          </div>
          <div className={s.buyBox}>
            <div className={s.skeleton} style={{ width: '120px', height: '10px' }} />
            <div className={s.skeleton} style={{ width: '80%', height: '44px' }} />
            <div className={s.skeleton} style={{ width: '60%', height: '22px' }} />
            <div className={s.skeleton} style={{ width: '100%', height: '60px' }} />
            <div className={s.skeleton} style={{ width: '70%', height: '32px' }} />
            <div className={s.skeleton} style={{ width: '100%', height: '110px' }} />
            <div className={s.skeleton} style={{ width: '100%', height: '48px' }} />
          </div>
        </div>

        {/* Opis */}
        <div className={s.detailsSection}>
          <div className={s.skeleton} style={{ width: '120px', height: '22px', marginBottom: '24px' }} />
          {[100, 95, 90, 60].map((w, i) => (
            <div key={i} className={s.skeleton} style={{ width: `${w}%`, maxWidth: '720px', height: '13px', marginBottom: '10px' }} />
          ))}
        </div>
      </div>
    </div>
  );
}
