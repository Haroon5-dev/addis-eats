"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const useFavoritesStore = create(
  persist(
    (set) => ({
      items: [],
      toggleFavorite: (dish) =>
        set((state) => ({
          items: state.items.some((item) => item.id === dish.id)
            ? state.items.filter((item) => item.id !== dish.id)
            : [...state.items, dish],
        })),
      removeFavorite: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
    }),
    { name: "addis-eats-favorites", skipHydration: true }
  )
);

let hydrationPromise;

export function rehydrateFavorites() {
  if (!hydrationPromise) {
    hydrationPromise = Promise.resolve(useFavoritesStore.persist.rehydrate());
  }
  return hydrationPromise;
}

export default useFavoritesStore;
