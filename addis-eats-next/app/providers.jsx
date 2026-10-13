"use client";

import { createContext } from "react";

// Client boundary for app-wide cart state. Keeping it here prevents the
// root layout from becoming a Client Component.
export const CartProviderContext = createContext(null);

export default function Providers({ children }) {
  return (
    <CartProviderContext.Provider value={{ storageKey: "addis-eats-cart" }}>
      {children}
    </CartProviderContext.Provider>
  );
}
