"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { placeOrder } from "../actions.js";
import useCartStore from "../cart/cartStore.js";
import { formatCurrency } from "../../utils/formatCurrency.js";

const initialState = {
  status: "idle",
  fieldErrors: {},
};

export default function CheckoutForm() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const [state, formAction, pending] = useActionState(placeOrder, initialState);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  useEffect(() => {
    if (state.status === "success") {
      clearCart();
      router.refresh();
    }
  }, [state.status, clearCart, router]);

  if (state.status === "success") {
    return (
      <section className="checkout-success">
        <h2>Order placed successfully</h2>
        <p>Order ID: {state.orderId}</p>
        <p>Total: {formatCurrency(state.total)}</p>
        <p><Link href={`/orders/${encodeURIComponent(state.orderId)}`}>Track your order status</Link></p>
        <button type="button" onClick={() => router.push("/menu")}>
          Back to Menu
        </button>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="empty-state">
        <p>Your cart is empty.</p>
        <button type="button" onClick={() => router.push("/menu")}>
          Browse Menu
        </button>
      </section>
    );
  }

  return (
    <form action={formAction} className="checkout-form">
      <input type="hidden" name="items" value={JSON.stringify(items)} />

      <h2>Delivery details</h2>

      <label htmlFor="name">Name</label>
      <input id="name" name="name" autoComplete="name" required />
      {state.fieldErrors?.["customer.name"] && (
        <p className="form-error">{state.fieldErrors["customer.name"]}</p>
      )}

      <label htmlFor="telebirr">Telebirr number</label>
      <input
        id="telebirr"
        name="telebirr"
        inputMode="numeric"
        placeholder="09XXXXXXXX"
        required
      />
      {state.fieldErrors?.["customer.telebirr"] && (
        <p className="form-error">{state.fieldErrors["customer.telebirr"]}</p>
      )}

      <label htmlFor="area">Area</label>
      <input id="area" name="area" required />
      {state.fieldErrors?.["customer.area"] && (
        <p className="form-error">{state.fieldErrors["customer.area"]}</p>
      )}

      <label htmlFor="notes">Notes (optional)</label>
      <textarea id="notes" name="notes" rows="3" />

      <div className="checkout-total">
        <strong>Total: {formatCurrency(total)}</strong>
      </div>

      {state.fieldErrors?.items && (
        <p className="form-error">{state.fieldErrors.items}</p>
      )}

      <button type="submit" disabled={pending}>
        {pending ? "Placing order..." : "Place Order"}
      </button>

      {state.status === "error" && !Object.keys(state.fieldErrors ?? {}).length && (
        <p className="form-error">Something went wrong. Please try again.</p>
      )}
    </form>
  );
}
