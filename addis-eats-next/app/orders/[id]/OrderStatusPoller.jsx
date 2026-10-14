"use client";

import useSWR from "swr";
import fetcher from "../../../lib/fetcher.js";
import { formatCurrency } from "../../../utils/formatCurrency.js";

const POLL_INTERVAL = 5000;
const TERMINAL_STATUSES = new Set(["delivered", "cancelled"]);
const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready for pickup",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function OrderStatusPoller({ orderId, initialOrder }) {
  const { data, error, isValidating } = useSWR(`/api/orders/${encodeURIComponent(orderId)}`, fetcher, {
    fallbackData: { order: initialOrder },
    refreshInterval: (latest) => TERMINAL_STATUSES.has(latest?.order?.status) ? 0 : POLL_INTERVAL,
    revalidateOnFocus: true,
    dedupingInterval: 1000,
    keepPreviousData: true,
  });
  const order = data?.order ?? initialOrder;

  return (
    <section className="order-status-card" aria-live="polite">
      <p className="order-status-label">Current status</p>
      <p className={`order-status order-status-${order.status}`}><span aria-hidden="true">●</span> {STATUS_LABELS[order.status] ?? order.status}</p>
      <p>Total: <strong>{formatCurrency(order.total)}</strong></p>
      <p>Placed: {new Date(order.createdAt).toLocaleString()}</p>
      {order.cancelledAt && <p>Cancelled: {new Date(order.cancelledAt).toLocaleString()}</p>}
      <h2>Items</h2>
      <ul>{order.items.map((item) => <li key={item.id}>{item.name} × {item.quantity} — {formatCurrency(Number(item.price) * Number(item.quantity))}</li>)}</ul>
      {error && <p className="form-error" role="alert">Status could not be refreshed. Showing the last available status.</p>}
      <p className="search-status">{TERMINAL_STATUSES.has(order.status) ? "This order is complete; automatic updates have stopped." : isValidating ? "Checking for updates…" : "Updates automatically every 5 seconds while your order is active."}</p>
    </section>
  );
}
