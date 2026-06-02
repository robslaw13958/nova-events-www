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
        {/* Back link */}
        <div className={s.skeleton} style={{ width: '140px', height: '12px', marginBottom: '40px' }} />

        {/* Hero section */}
        <div className={s.heroSection}>
          <div className={s.skeleton} style={{ width: '100px', height: '10px', marginBottom: '12px' }} />
          <div className={s.skeleton} style={{ width: '60%', height: '44px', marginBottom: '8px' }} />
          <div className={s.skeleton} style={{ width: '40%', height: '14px', marginBottom: '24px' }} />
        </div>

        {/* Variants section */}
        <div className={s.variantsSection}>
          <div className={s.skeleton} style={{ width: '120px', height: '18px', marginBottom: '20px' }} />
          <div className={s.variantGrid}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={s.variantCardSkeleton}>
                <div className={s.skeleton} style={{ width: '100%', height: '200px', marginBottom: '12px' }} />
                <div className={s.skeleton} style={{ width: '80px', height: '14px', marginBottom: '8px' }} />
                <div className={s.skeleton} style={{ width: '100%', height: '12px', marginBottom: '6px' }} />
                <div className={s.skeleton} style={{ width: '100%', height: '12px', marginBottom: '12px' }} />
                <div className={s.skeleton} style={{ width: '100%', height: '36px' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Details section */}
        <div className={s.detailsSection}>
          <div className={s.skeleton} style={{ width: '120px', height: '18px', marginBottom: '20px' }} />
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className={s.detailRow}>
              <div className={s.skeleton} style={{ width: '150px', height: '13px' }} />
              <div className={s.skeleton} style={{ width: '200px', height: '13px' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
