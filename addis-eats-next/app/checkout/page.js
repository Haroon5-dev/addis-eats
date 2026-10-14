import Link from "next/link";
import CheckoutForm from "./CheckoutForm.jsx";

export default function CheckoutPage() {
  return (
    <main className="checkout-page">
      <nav className="checkout-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/menu">Menu</Link>
        <span aria-hidden="true">/</span>
        <Link href="/cart">Your cart</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Checkout</span>
      </nav>
      <header className="checkout-heading">
        <p className="checkout-eyebrow">ADDIS EATS · SECURE CHECKOUT</p>
        <h1>Complete your order</h1>
        <p>Share your delivery details and we’ll take care of the rest.</p>
      </header>
      <CheckoutForm />
    </main>
  );
}
