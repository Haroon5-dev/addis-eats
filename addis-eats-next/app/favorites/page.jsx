"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useFavoritesStore, { rehydrateFavorites } from "./favoritesStore.js";
import AddToCartButton from "../cart/AddToCartButton.jsx";
import FavoriteButton from "./FavoriteButton.jsx";
import { formatCurrency } from "../../utils/formatCurrency.js";

export default function FavoritesPage() {
  const items = useFavoritesStore((state) => state.items);
  const [hydrated, setHydrated] = useState(false);

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
    <main className="favorites-page">
      <p className="cart-eyebrow">ADDIS EATS</p>
      <h1>Your saved dishes</h1>
      {!hydrated ? (
        <p aria-live="polite">Loading your saved dishes…</p>
      ) : items.length ? (
        <div className="dish-grid">
          {items.map((dish) => (
            <article className="dish" key={dish.id}>
              <Image
                className="dish-image"
                src={dish.image}
                alt={`${dish.name} served at Addis Eats`}
                width={800}
                height={600}
                sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
              />
              <div className="dish-content">
                <h2>{dish.name}</h2>
                <p>{dish.description}</p>
                <p className="dish-price">{formatCurrency(dish.price)}</p>
                <div className="dish-actions">
                  <Link className="details-link" href={`/menu/${dish.id}`}>
                    View details
                  </Link>
                  <AddToCartButton dish={dish} />
                  <FavoriteButton dish={dish} />
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="empty-state">
          <h2>No favorites yet</h2>
          <p>Save dishes from the menu and they will be waiting here.</p>
          <Link href="/menu">Browse the menu</Link>
        </section>
      )}
    </main>
  );
}
