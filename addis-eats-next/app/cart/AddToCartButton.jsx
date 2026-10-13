"use client";

import { useState } from "react";
import useCartStore from "./cartStore.js";

export default function AddToCartButton({ dish }) {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);

  function addToCart() {
    addItem(dish);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <button className="add-to-cart-button" type="button" onClick={addToCart}>
      {added ? "Added to cart" : "Add to cart"}
    </button>
  );
}
