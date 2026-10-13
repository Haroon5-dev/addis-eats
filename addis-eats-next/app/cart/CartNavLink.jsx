"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useCartStore from "./cartStore.js";

export default function CartNavLink() {
  const items = useCartStore((state) => state.items);
  const [hydrated, setHydrated] = useState(false);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    let active = true;
    Promise.resolve(useCartStore.persist.rehydrate()).then(() => {
      if (active) setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <Link href="/cart" aria-label={hydrated ? `Cart, ${count} items` : "Cart"}>
      Cart{hydrated && count > 0 ? ` (${count})` : ""}
    </Link>
  );
}
