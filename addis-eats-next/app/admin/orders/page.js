import Link from "next/link";
import { redirect } from "next/navigation";

import { getAllOrders, ORDER_STATUS_TRANSITIONS } from "../../../lib/orders.js";
import { getSession } from "../../../lib/session.js";
import { formatCurrency } from "../../../utils/formatCurrency.js";
import AdminShell from "../AdminShell.jsx";
import { updateAdminOrderStatus } from "../actions.js";
import ConfirmForm from "../menu/ConfirmForm.jsx";

export const dynamic = "force-dynamic";
export const metadata = { title: "Manage orders", robots: { index: false, follow: false } };

const labels = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready for pickup",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function formatDate(value) {
  return new Intl.DateTimeFormat("en-ET", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Addis_Ababa",
  }).format(new Date(value));
}

export default async function AdminOrdersPage({ searchParams }) {
  const session = await getSession();
  if (!session || session.role !== "staff") redirect("/forbidden");
  const params = await searchParams;
  const orders = getAllOrders();

  return (
    <AdminShell user={session} active="orders">
      <header className="admin-page-header">
        <div>
          <p className="admin-eyebrow">OPERATIONS</p>
          <h1>Orders</h1>
          <p>Review customer orders and move each through its fulfillment steps.</p>
        </div>
        <span className="admin-order-count">{orders.length} total</span>
      </header>

      <div className="admin-data-note" role="note">
        <strong>Order data is stored locally</strong>
        <span>Changes are written to an ignored JSON file on this machine. This storage is for local development only, not multi-user or production hosting.</span>
      </div>

      {params?.error ? <p className="admin-feedback admin-feedback-error" role="alert">{params.error}</p> : null}
      {params?.updated ? <p className="admin-feedback" role="status">Order status updated.</p> : null}

      {orders.length === 0 ? (
        <section className="admin-panel admin-empty-state">
          <span aria-hidden="true">▤</span>
          <h2>No orders yet</h2>
          <p>Customer orders will appear here after checkout.</p>
        </section>
      ) : (
        <div className="admin-order-list">
          {orders.map((order) => {
            const nextStatuses = ORDER_STATUS_TRANSITIONS[order.status] ?? [];
            return (
              <article className="admin-panel admin-order-card" key={order.id}>
                <div className="admin-order-card-heading">
                  <div>
                    <span className="admin-eyebrow">ORDER</span>
                    <h2>{order.id}</h2>
                    <p>{formatDate(order.createdAt)}</p>
                  </div>
                  <span className={`admin-status admin-status-${order.status}`}>{labels[order.status] ?? order.status}</span>
                </div>
                <div className="admin-order-card-grid">
                  <div>
                    <h3>Customer</h3>
                    <p>{order.customer.name}</p>
                    <p>{order.customer.telebirr}</p>
                    <p>{order.customer.area}</p>
                    {order.customer.notes ? <p className="admin-customer-note">Note: {order.customer.notes}</p> : null}
                  </div>
                  <div>
                    <h3>Items</h3>
                    <ul className="admin-order-items">
                      {order.items.map((item, index) => (
                        <li key={`${item.id}-${index}`}>{item.quantity} × {item.name} <span>{formatCurrency(item.price * item.quantity)}</span></li>
                      ))}
                    </ul>
                    <strong className="admin-order-total">{formatCurrency(order.total)}</strong>
                  </div>
                </div>
                <div className="admin-order-card-footer">
                  {nextStatuses.length ? (
                    <ConfirmForm action={updateAdminOrderStatus} className="admin-status-form" message="Cancel this order? This action cannot be undone." confirmWhen="cancelled" fieldName="status">
                      <input type="hidden" name="orderId" value={order.id} />
                      <label htmlFor={`status-${order.id}`}>Next status</label>
                      <select id={`status-${order.id}`} name="status" defaultValue={nextStatuses[0]}>
                        {nextStatuses.map((status) => <option value={status} key={status}>{labels[status]}</option>)}
                      </select>
                      <button type="submit" className="admin-action-button">Update order</button>
                    </ConfirmForm>
                  ) : <p className="admin-terminal-status">This order is {labels[order.status]?.toLowerCase() ?? order.status}.</p>}
                  <details className="admin-timeline">
                    <summary>Status history</summary>
                    <ol>
                      {(order.statusHistory ?? [{ status: order.status, changedAt: order.createdAt, changedBy: "system" }]).map((event, index) => (
                        <li key={`${event.changedAt}-${index}`}>
                          <strong>{labels[event.status] ?? event.status}</strong>
                          <span>{formatDate(event.changedAt)} · {event.changedBy}</span>
                        </li>
                      ))}
                    </ol>
                  </details>
                </div>
              </article>
            );
          })}
        </div>
      )}
      <p className="admin-back-link"><Link href="/admin">← Back to overview</Link></p>
    </AdminShell>
  );
}
