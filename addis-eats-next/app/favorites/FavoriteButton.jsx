"use client";

import { useEffect, useState } from "react";
import useFavoritesStore, { rehydrateFavorites } from "./favoritesStore.js";

export default function FavoriteButton({ dish }) {
  const items = useFavoritesStore((state) => state.items);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const [hydrated, setHydrated] = useState(false);
  const isFavorite = items.some((item) => item.id === dish.id);

  useEffect(() => {
    let active = true;
    rehydrateFavorites().then(() => {
      if (active) setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <button
      className="favorite-button"
      type="button"
      aria-pressed={hydrated && isFavorite}
      aria-label={
        hydrated && isFavorite
          ? `Remove ${dish.name} from favorites`
          : `Add ${dish.name} to favorites`
      }
      onClick={() => toggleFavorite(dish)}
    >
      <span aria-hidden="true">{hydrated && isFavorite ? "♥" : "♡"}</span>
      <span>{hydrated && isFavorite ? "Saved" : "Save"}</span>
    </button>
  );
}
