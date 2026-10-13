"use client";

import { useState } from "react";
import useCartStore from "../cart/cartStore.js";

export default function ReorderButton({ items }) {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);

  function reorder() {
    items.forEach((item) => {
      addItem(
        {
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
        },
        item.quantity
      );
    });
    setAdded(true);
  }

  return (
    <button type="button" className="add-to-cart-button" onClick={reorder}>
      {added ? "Items added to cart" : "Reorder"}
    </button>
  );
}
