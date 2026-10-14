import { redirect } from "next/navigation";

import { getAllOrders, ORDER_STATUS_TRANSITIONS } from "../../../lib/orders.js";
import { getSession } from "../../../lib/session.js";
import { formatCurrency } from "../../../utils/formatCurrency.js";
import AdminShell from "../../admin/AdminShell.jsx";
import { updateAdminOrderStatus } from "../../admin/actions.js";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kitchen order queue", robots: { index: false, follow: false } };

const labels = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready for pickup",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default async function KitchenPage({ searchParams }) {
  const session = await getSession();
  if (!session || !["staff", "kitchen"].includes(session.role)) redirect("/forbidden");

  const params = await searchParams;
  const orders = (await getAllOrders()).filter((order) => ["pending", "confirmed", "preparing", "ready"].includes(order.status));
  const kitchenRole = session.role === "kitchen";

  return (
    <AdminShell user={session} active="kitchen">
      <header className="admin-page-header">
        <div>
          <p className="admin-eyebrow">ORDER FULFILLMENT</p>
          <h1>Kitchen queue</h1>
          <p>Prepare accepted orders and mark them ready for pickup.</p>
        </div>
        <span className="admin-order-count">{orders.length} active</span>
      </header>
      {params?.error ? <p className="admin-feedback admin-feedback-error" role="alert">{params.error}</p> : null}
      {params?.updated ? <p className="admin-feedback" role="status">Order status updated.</p> : null}
      {orders.length === 0 ? (
        <section className="admin-panel admin-empty-state">
          <span aria-hidden="true">✓</span>
          <h2>Kitchen is clear</h2>
          <p>New orders will appear here as they are accepted.</p>
        </section>
      ) : (
        <div className="admin-order-list">
          {orders.map((order) => {
            const transitions = (ORDER_STATUS_TRANSITIONS[order.status] ?? [])
              .filter((status) => kitchenRole ? ["preparing", "ready"].includes(status) : ["confirmed", "preparing", "ready"].includes(status));
            return (
              <article className="admin-panel admin-order-card" key={order.id}>
                <div className="admin-order-card-heading">
                  <div>
                    <span className="admin-eyebrow">ORDER · {new Date(order.createdAt).toLocaleTimeString("en-ET", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Addis_Ababa" })}</span>
                    <h2>{order.id}</h2>
                    <p>{order.customer.name} · {order.customer.area}</p>
                  </div>
                  <span className={`admin-status admin-status-${order.status}`}>{labels[order.status]}</span>
                </div>
                <div className="admin-order-card-grid">
                  <div>
                    <h3>Items to prepare</h3>
                    <ul className="admin-order-items">
                      {order.items.map((item, index) => <li key={`${item.id}-${index}`}>{item.quantity} × {item.name}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h3>Customer notes</h3>
                    <p>{order.customer.notes || "No special instructions."}</p>
                    <p><strong>Order total:</strong> {formatCurrency(order.total)}</p>
                  </div>
                </div>
                <div className="admin-order-card-footer">
                  {transitions.length ? (
                    <form action={updateAdminOrderStatus} className="admin-status-form">
                      <input type="hidden" name="orderId" value={order.id} />
                      <label htmlFor={`kitchen-status-${order.id}`}>Update status</label>
                      <select id={`kitchen-status-${order.id}`} name="status" defaultValue={transitions[0]}>
                        {transitions.map((status) => <option key={status} value={status}>{labels[status]}</option>)}
                      </select>
                      <button type="submit" className="admin-action-button">Save status</button>
                    </form>
                  ) : <p className="admin-terminal-status">{order.status === "pending" ? "Waiting for staff confirmation." : "Waiting for delivery pickup."}</p>}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}
