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
      <section className="checkout-empty">
        <span className="checkout-empty-icon" aria-hidden="true">▤</span>
        <h2>Your cart is empty</h2>
        <p>Add something delicious from the menu to get started.</p>
        <Link href="/menu" className="checkout-primary-button">Browse the menu</Link>
      </section>
    );
  }

  return (
    <div className="checkout-layout">
      <form action={formAction} className="checkout-form">
        <input type="hidden" name="items" value={JSON.stringify(items)} />

        <section className="checkout-panel checkout-details">
          <div className="checkout-section-heading">
            <span className="checkout-step">1</span>
            <div>
              <h2>Delivery details</h2>
              <p>Where should we bring your order?</p>
            </div>
          </div>

          <div className="checkout-fields">
            <div className="checkout-field">
              <label htmlFor="name">Full name</label>
              <input id="name" name="name" autoComplete="name" placeholder="Your name" required aria-invalid={Boolean(state.fieldErrors?.["customer.name"])} />
              {state.fieldErrors?.["customer.name"] && (
                <p className="form-error" role="alert">{state.fieldErrors["customer.name"]}</p>
              )}
            </div>

            <div className="checkout-field">
              <label htmlFor="telebirr">Telebirr number</label>
              <input
                id="telebirr"
                name="telebirr"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="09XXXXXXXX"
                required
                aria-invalid={Boolean(state.fieldErrors?.["customer.telebirr"])}
              />
              {state.fieldErrors?.["customer.telebirr"] && (
                <p className="form-error" role="alert">{state.fieldErrors["customer.telebirr"]}</p>
              )}
            </div>

            <div className="checkout-field">
              <label htmlFor="area">Delivery area</label>
              <input id="area" name="area" autoComplete="address-level2" placeholder="e.g. Bole, Addis Ababa" required aria-invalid={Boolean(state.fieldErrors?.["customer.area"])} />
              {state.fieldErrors?.["customer.area"] && (
                <p className="form-error" role="alert">{state.fieldErrors["customer.area"]}</p>
              )}
            </div>

            <div className="checkout-field">
              <label htmlFor="notes">Delivery instructions <span>(optional)</span></label>
              <textarea id="notes" name="notes" rows="4" placeholder="Landmark, gate code, or other helpful details" />
            </div>
          </div>

          <p className="checkout-private-note"><span aria-hidden="true">▣</span> Your contact details are only used to coordinate this delivery.</p>
        </section>

        {state.fieldErrors?.items && (
          <p className="form-error checkout-form-error" role="alert">{state.fieldErrors.items}</p>
        )}
        {state.status === "error" && !Object.keys(state.fieldErrors ?? {}).length && (
          <p className="form-error checkout-form-error" role="alert">
            {state.message || "Something went wrong. Please try again."}
          </p>
        )}

        <button className="checkout-submit" type="submit" disabled={pending}>
          {pending ? "Placing your order…" : "Place order"}
          <span aria-hidden="true">→</span>
        </button>
        <p className="checkout-submit-note">You’ll be able to track your order after it’s placed.</p>
      </form>

      <aside className="checkout-summary">
        <div className="checkout-panel checkout-summary-panel">
          <div className="checkout-section-heading">
            <span className="checkout-step" aria-hidden="true">2</span>
            <div>
              <h2>Your order</h2>
              <p>{items.reduce((count, item) => count + item.quantity, 0)} items</p>
            </div>
          </div>

          <ul className="checkout-items">
            {items.map((item) => (
              <li className="checkout-item" key={item.id}>
                <span className="checkout-item-quantity">{item.quantity}×</span>
                <span className="checkout-item-name">{item.name}</span>
                <strong>{formatCurrency(item.price * item.quantity)}</strong>
              </li>
            ))}
          </ul>

          <div className="checkout-cost-row">
            <span>Food total</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
          <div className="checkout-cost-row checkout-delivery-row">
            <span>Delivery</span>
            <span>Confirmed with you</span>
          </div>
          <div className="checkout-grand-total">
            <span>Order total</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
          <p className="checkout-summary-note">Delivery fees, if applicable, will be confirmed before delivery.</p>
          <Link className="checkout-edit-cart" href="/cart">← Edit your cart</Link>
        </div>
      </aside>
    </div>
  );
}
