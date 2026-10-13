import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getOrder } from "../../../lib/orders.js";
import { getSession } from "../../../lib/session.js";
import OrderStatusPoller from "./OrderStatusPoller.jsx";

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect(`/signin?next=${encodeURIComponent(`/orders/${id}`)}`);
  const order = getOrder(id);
  if (!order) notFound();

  
  if (order.ownerId !== session.userId) notFound();

  const initialOrder = {
    id: order.id,
    status: order.status,
    total: order.total,
    items: order.items,
    createdAt: order.createdAt,
    cancelledAt: order.cancelledAt ?? null,
  };

  return (
    <main className="order-page">
      <p><Link href="/menu">← Back to menu</Link></p>
      <h1>Track your order</h1>
      <p className="order-id">Order ID: <strong>{order.id}</strong></p>
      <OrderStatusPoller orderId={id} initialOrder={initialOrder} />
    </main>
  );
}
