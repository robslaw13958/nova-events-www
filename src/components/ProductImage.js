'use client';

import { useState } from 'react';
import Image from 'next/image';

// Czy zdjęcie pod danym adresem nie dało się wczytać (np. plik na Drive bez publicznego
// dostępu). Zapamiętuje adres, więc po zmianie wariantu na inne zdjęcie stan się resetuje.
export function useImageError(src) {
  const [failedSrc, setFailedSrc] = useState(null);
  return [!src || failedSrc === src, () => setFailedSrc(src)];
}

// next/image, który zamiast ikony zepsutej grafiki pokazuje `fallback`
export default function ProductImage({ src, alt, fallback = null, ...props }) {
  const [failed, onError] = useImageError(src);
  if (failed) return fallback;
  return <Image src={src} alt={alt} onError={onError} {...props} />;
}
