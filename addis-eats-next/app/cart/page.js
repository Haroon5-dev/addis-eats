"use client";

import Image from "next/image";
import Link from "next/link";
import useCartStore from "./cartStore.js";
import { formatCurrency } from "../../utils/formatCurrency.js";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const decreaseItem = useCartStore((state) => state.decreaseItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <main className="cart-page">
      <div className="cart-heading">
        <span className="cart-eyebrow">ADDIS EATS</span>
        <h1>Your Shopping Cart</h1>
        <p>Review your favorites before checking out.</p>
      </div>

      <div className="cart-navigation">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/menu">Menu</Link>
        <span>/</span>
        <span>Your Cart</span>
      </div>

      {items.length === 0 ? (
        <section className="cart-empty">
          <div className="cart-empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>
            Looks like you haven't added any delicious dishes yet.
          </p>
          <Link href="/menu" className="cart-primary-button">
            Explore the Menu
          </Link>
        </section>
      ) : (
        <div className="cart-layout">
          <section className="cart-items-panel">
            <div className="cart-items-heading">
              <h2>Order Items</h2>
              <span>
                {items.reduce((sum, item) => sum + item.quantity, 0)} items
              </span>
            </div>

            <div className="cart-items-list">
              {items.map((item) => (
                <article className="cart-item" key={item.id}>
                  {item.image ? (
                    <Image
                      className="cart-item-image"
                      src={item.image}
                      alt={item.name}
                      width={180}
                      height={140}
                      sizes="(max-width: 700px) 88px, 112px"
                    />
                  ) : (
                    <div className="cart-item-placeholder">🍽️</div>
                  )}

                  <div className="cart-item-details">
                    <h3>{item.name}</h3>
                    <p className="cart-item-price">
                      {formatCurrency(item.price)}
                    </p>

                    <button
                      type="button"
                      className="cart-remove-button"
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="cart-item-controls">
                    <div className="cart-quantity-control">
                      <button
                        type="button"
                        aria-label={`Decrease ${item.name} quantity`}
                        onClick={() => decreaseItem(item.id)}
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        aria-label={`Increase ${item.name} quantity`}
                        onClick={() => addItem(item)}
                      >
                        +
                      </button>
                    </div>

                    <strong className="cart-line-total">
                      {formatCurrency(item.price * item.quantity)}
                    </strong>
                  </div>
                </article>
              ))}
            </div>

            <div className="cart-bottom-actions">
              <Link href="/menu" className="cart-continue-link">
                ← Continue Shopping
              </Link>

              <button
                type="button"
                className="cart-clear-button"
                onClick={clearCart}
              >
                Clear Cart
              </button>
            </div>
          </section>

          <aside className="cart-summary">
            <h2>Order Summary</h2>

            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span>{formatCurrency(total)}</span>
            </div>

            <div className="cart-summary-row">
              <span>Delivery fee</span>
              <span>Calculated at checkout</span>
            </div>

            <div className="cart-summary-total">
              <span>Food total</span>
              <strong>{formatCurrency(total)}</strong>
            </div>

            <p className="cart-summary-note">
              Delivery charges, if applicable, will be confirmed during checkout.
            </p>

            <Link
              href="/checkout"
              className="cart-primary-button cart-checkout-button"
            >
              Proceed to Checkout →
            </Link>

            <Link href="/menu" className="cart-back-link">
              Add more dishes
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}