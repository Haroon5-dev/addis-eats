import Link from "next/link";
import CheckoutForm from "./CheckoutForm.jsx";

export default function CheckoutPage() {
  return (
    <main className="checkout-page">
      <h1>Checkout</h1>
      <p>Review your order and enter your delivery details.</p>

      <p>
        <Link href="/cart">Back to Cart</Link>
      </p>

      <CheckoutForm />
    </main>
  );
}
