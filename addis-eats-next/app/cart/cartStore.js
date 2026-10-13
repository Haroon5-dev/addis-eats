import { create } from "zustand";
import { persist } from "zustand/middleware";

const cartStore = create(
  persist(
    (set) => ({
      items: [],

      addItem: (dish, quantity = 1) =>
        set((state) => {
          const amount = Math.max(1, Math.floor(Number(quantity) || 1));
          const existingItem = state.items.find(
            (item) => item.id === dish.id
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === dish.id
                  ? {
                      ...item,
                      quantity: item.quantity + amount,
                    }
                  : item
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                ...dish,
                quantity: amount,
              },
            ],
          };
        }),

      decreaseItem: (id) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.id === id
                ? {
                    ...item,
                    quantity: item.quantity - 1,
                  }
                : item
            )
            .filter((item) => item.quantity > 0),
        })),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter(
            (item) => item.id !== id
          ),
        })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "addis-eats-cart",
      skipHydration: true,
    }
  )
);

export default cartStore;