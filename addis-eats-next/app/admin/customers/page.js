import { redirect } from "next/navigation";

import { getAllOrders } from "../../../lib/orders.js";
import { getSession } from "../../../lib/session.js";
import { formatCurrency } from "../../../utils/formatCurrency.js";
import AdminShell from "../AdminShell.jsx";

export const dynamic = "force-dynamic";
export const metadata = { title: "Customers", robots: { index: false, follow: false } };

function getCustomerSummaries(orders) {
  const customers = new Map();
  for (const order of orders) {
    const id = order.ownerId;
    if (!id) continue;
    const existing = customers.get(id) ?? {
      id,
      name: order.customer.name,
      phone: order.customer.telebirr,
      area: order.customer.area,
      orders: 0,
      spent: 0,
      lastOrder: order.createdAt,
    };
    existing.orders += 1;
    if (order.status !== "cancelled") existing.spent += order.total;
    if (order.createdAt > existing.lastOrder) existing.lastOrder = order.createdAt;
    customers.set(id, existing);
  }
  return [...customers.values()].sort((a, b) => b.lastOrder.localeCompare(a.lastOrder));
}

export default async function AdminCustomersPage() {
  const session = await getSession();
  if (!session || session.role !== "staff") redirect("/forbidden");
  const customers = getCustomerSummaries(getAllOrders());

  return (
    <AdminShell user={session} active="customers">
      <header className="admin-page-header">
        <div>
          <p className="admin-eyebrow">CUSTOMER RELATIONSHIPS</p>
          <h1>Customers</h1>
          <p>Contact and order summaries from customers who have placed an order.</p>
        </div>
        <span className="admin-order-count">{customers.length} customers</span>
      </header>
      <div className="admin-data-note" role="note">
        <strong>Order-derived customer list</strong>
        <span>This project has no registered customer database. These summaries are inferred from saved orders; cancelled orders are excluded from the spending total.</span>
      </div>
      {customers.length === 0 ? (
        <section className="admin-panel admin-empty-state">
          <span aria-hidden="true">♙</span>
          <h2>No customers yet</h2>
          <p>Customer summaries appear after the first order is placed.</p>
        </section>
      ) : (
        <div className="admin-panel admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th scope="col">Customer</th><th scope="col">Telebirr</th><th scope="col">Delivery area</th><th scope="col">Orders</th><th scope="col">Order value*</th><th scope="col">Last order</th></tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td><strong>{customer.name}</strong></td>
                  <td>{customer.phone}</td>
                  <td>{customer.area}</td>
                  <td>{customer.orders}</td>
                  <td>{formatCurrency(customer.spent)}</td>
                  <td>{new Intl.DateTimeFormat("en-ET", { dateStyle: "medium", timeZone: "Africa/Addis_Ababa" }).format(new Date(customer.lastOrder))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="admin-table-footnote">* Total value of non-cancelled orders. This is not verified payment revenue.</p>
    </AdminShell>
  );
}
