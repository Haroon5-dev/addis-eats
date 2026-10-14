import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getOrder, ORDER_STATUS_TRANSITIONS } from "../../../../lib/orders.js";
import { getSession } from "../../../../lib/session.js";
import { formatCurrency } from "../../../../utils/formatCurrency.js";
import AdminShell from "../../AdminShell.jsx";
import { updateAdminOrderStatus } from "../../actions.js";
import ConfirmForm from "../../menu/ConfirmForm.jsx";

export const dynamic = "force-dynamic";
export const metadata = { title: "Order details", robots: { index: false, follow: false } };

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

export default async function AdminOrderDetailsPage({ params, searchParams }) {
  const session = await getSession();
  if (!session || session.role !== "staff") redirect("/forbidden");

  const { id } = await params;
  const query = await searchParams;
  const order = getOrder(id);
  if (!order) notFound();

  const nextStatuses = ORDER_STATUS_TRANSITIONS[order.status] ?? [];
  return (
    <AdminShell user={session} active="orders">
      <p className="admin-back-link"><Link href="/admin">← Back to dashboard</Link> <span aria-hidden="true">/</span> <Link href="/admin/orders">Orders</Link></p>
      <header className="admin-page-header admin-detail-heading">
        <div>
          <p className="admin-eyebrow">ORDER DETAILS</p>
          <h1>{order.id}</h1>
          <p>Placed {formatDate(order.createdAt)}</p>
        </div>
        <span className={`admin-status admin-status-${order.status}`}>{labels[order.status] ?? order.status}</span>
      </header>
      {query?.error ? <p className="admin-feedback admin-feedback-error" role="alert">{query.error}</p> : null}
      {query?.updated ? <p className="admin-feedback" role="status">Order status updated.</p> : null}

      <div className="admin-detail-grid">
        <section className="admin-panel admin-detail-panel">
          <h2>Customer and delivery</h2>
          <dl className="admin-detail-list">
            <div><dt>Name</dt><dd>{order.customer.name}</dd></div>
            <div><dt>Telebirr number</dt><dd>{order.customer.telebirr}</dd></div>
            <div><dt>Delivery area</dt><dd>{order.customer.area}</dd></div>
            <div><dt>Instructions</dt><dd>{order.customer.notes || "No instructions provided."}</dd></div>
          </dl>
        </section>

        <section className="admin-panel admin-detail-panel">
          <h2>Order items</h2>
          <ul className="admin-order-items">
            {order.items.map((item, index) => (
              <li key={`${item.id}-${index}`}>
                <span>{item.quantity} × {item.name}</span>
                <strong>{formatCurrency(item.price * item.quantity)}</strong>
              </li>
            ))}
          </ul>
          <div className="admin-detail-total"><span>Order total</span><strong>{formatCurrency(order.total)}</strong></div>
          <p className="admin-detail-disclaimer">Payment is not verified by this demo.</p>
        </section>
      </div>

      <section className="admin-panel admin-detail-panel admin-detail-workflow">
        <div className="admin-panel-heading">
          <div><h2>Fulfillment status</h2><p>Transitions are validated on the server.</p></div>
        </div>
        {nextStatuses.length ? (
          <ConfirmForm action={updateAdminOrderStatus} className="admin-status-form" message="Cancel this order? This action cannot be undone." confirmWhen="cancelled" fieldName="status">
            <input type="hidden" name="orderId" value={order.id} />
            <input type="hidden" name="returnTo" value="detail" />
            <label htmlFor="detail-status">Next status</label>
            <select id="detail-status" name="status" defaultValue={nextStatuses[0]}>
              {nextStatuses.map((status) => <option key={status} value={status}>{labels[status]}</option>)}
            </select>
            <button type="submit" className="admin-action-button">Update status</button>
          </ConfirmForm>
        ) : <p className="admin-terminal-status">This order is {labels[order.status]?.toLowerCase() ?? order.status}; no further status changes are available.</p>}
      </section>

      <section className="admin-panel admin-detail-panel admin-detail-workflow">
        <div className="admin-panel-heading"><div><h2>Status history</h2><p>Recorded status changes and the account that made them.</p></div></div>
        <ol className="admin-detail-timeline">
          {(order.statusHistory ?? [{ status: order.status, changedAt: order.createdAt, changedBy: "system" }]).map((event, index) => (
            <li key={`${event.changedAt}-${index}`}>
              <span className="admin-timeline-dot" aria-hidden="true" />
              <div><strong>{labels[event.status] ?? event.status}</strong><span>{formatDate(event.changedAt)} · {event.changedBy}</span></div>
            </li>
          ))}
        </ol>
      </section>
    </AdminShell>
  );
}
