// lib/cartStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const HURT_PROG = 20;

// Zwraca cenę jednostkową dla danej pozycji w koszyku
export function cenaItem(item) {
  return item.ilosc >= HURT_PROG ? item.cenaHurtNum : item.cenaDetalNum;
}

export const useCart = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart:   () => set({ isOpen: true }),
      closeCart:  () => set({ isOpen: false }),
      toggleCart: () => set(state => ({ isOpen: !state.isOpen })),

      addItem: (product, wariantIndex, ilosc) => {
        const w = product.warianty[wariantIndex];
        const key = `${product.id}__${w.kolor}`;

        set(state => {
          const existing = state.items.find(i => i.key === key);
          if (existing) {
            return {
              items: state.items.map(i =>
                i.key === key ? { ...i, ilosc: i.ilosc + ilosc } : i
              ),
              isOpen: true,
            };
          }
          return {
            items: [...state.items, {
              key,
              name:         product.name,
              typ:          product.typ,
              linia:        product.linia,
              kolor:        w.kolor,
              hex:          w.hex,
              zdjecie:      w.zdjecie,
              cenaDetal:    w.cenaDetal,
              cenaHurt:     w.cenaHurt,
              cenaDetalNum: w.cenaDetalNum,
              cenaHurtNum:  w.cenaHurtNum,
              ilosc,
            }],
            isOpen: true,
          };
        });
      },

      removeItem: (key) => set(state => ({
        items: state.items.filter(i => i.key !== key),
      })),

      updateQuantity: (key, ilosc) => {
        if (ilosc <= 0) { get().removeItem(key); return; }
        set(state => ({
          items: state.items.map(i => i.key === key ? { ...i, ilosc } : i),
        }));
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);