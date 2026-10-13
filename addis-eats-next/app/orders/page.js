import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "../../lib/session.js";
import { getOrdersForOwner } from "../../lib/orders.js";
import ReorderButton from "./ReorderButton.jsx";
import { formatCurrency } from "../../utils/formatCurrency.js";
import dishes from "../../public/dishes.json";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Your orders",
  description: "View and reorder your Addis Eats orders.",
  robots: { index: false, follow: false },
};

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) redirect("/signin?next=%2Forders");

  const orders = getOrdersForOwner(session.userId);

  return (
    <main className="orders-page">
      <p className="cart-eyebrow">ADDIS EATS</p>
      <h1>Your orders</h1>
      <p>Track recent orders or add a previous meal to your cart.</p>
      {orders.length === 0 ? (
        <section className="empty-state">
          <h2>No orders yet</h2>
          <p>Your completed checkouts will appear here.</p>
          <Link href="/menu">Browse the menu</Link>
        </section>
      ) : (
        <div className="order-history-list">
          {orders.map((order) => (
            <article className="order-history-card" key={order.id}>
              <div>
                <p>
                  Order <strong>{order.id}</strong>
                </p>
                <p>
                  {new Date(order.createdAt).toLocaleString()} ·{" "}
                  {order.status}
                </p>
                <p>{formatCurrency(order.total)}</p>
                <Link href={`/orders/${encodeURIComponent(order.id)}`}>
                  Track order
                </Link>
              </div>
              <ReorderButton
                items={order.items.map((item) => ({
                  ...item,
                  image: dishes.find((dish) => dish.id === item.id)?.image,
                }))}
              />
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
