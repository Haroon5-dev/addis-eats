import Link from "next/link";
import { redirect } from "next/navigation";

import { getDashboardAnalytics } from "../../lib/admin-analytics.js";
import { getDishes } from "../../lib/menu.js";
import { getAllOrders } from "../../lib/orders.js";
import { getSession } from "../../lib/session.js";
import AdminShell from "./AdminShell.jsx";
import OrderTable from "./OrderTable.jsx";
import RevenueChart from "./RevenueChart.jsx";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin dashboard",
  description: "Addis Eats staff operations overview.",
  robots: { index: false, follow: false },
};

export default async function AdminPage({ searchParams }) {
  const session = await getSession();
  if (!session || session.role !== "staff") redirect("/forbidden");

  const params = await searchParams;
  const previewState = process.env.NODE_ENV === "development" && typeof params?.preview === "string"
    ? params.preview
    : "";
  if (previewState === "error") throw new Error("Development preview: admin dashboard error state.");
  if (previewState === "loading") await new Promise((resolve) => setTimeout(resolve, 1200));

  const orders = previewState === "empty" ? [] : await getAllOrders();
  const dishes = getDishes();
  const pendingOrders = orders.filter((order) => ["pending", "confirmed", "preparing", "ready", "out_for_delivery"].includes(order.status)).length;
  const cancelledOrders = orders.filter((order) => order.status === "cancelled").length;
  const categories = new Set(dishes.map((dish) => dish.category));
  const analytics = getDashboardAnalytics(orders);

  return (
    <AdminShell user={session} active="overview">
      <header className="admin-page-header">
        <div>
          <p className="admin-eyebrow">ADDIS EATS / WORKSPACE</p>
          <h1>Overview</h1>
          <p>Here’s what’s happening with your store.</p>
        </div>
        <Link className="admin-menu-button" href="/menu">View customer menu <span aria-hidden="true">↗</span></Link>
      </header>

      <div className="admin-data-note" role="note">
        <strong>Order storage</strong>
        <span>Orders use the configured shared database in production and local JSON during development. Order totals are not verified payment revenue; payment records and financial reporting are not configured.</span>
      </div>

      {process.env.NODE_ENV === "development" ? (
        <details className="admin-preview-controls">
          <summary>Preview loading, empty, and error states</summary>
          <nav aria-label="Dashboard state previews">
            <Link href="/admin?preview=loading">Loading skeleton</Link>
            <Link href="/admin?preview=empty">Empty dashboard</Link>
            <Link href="/admin?preview=error">Error screen</Link>
          </nav>
        </details>
      ) : null}

      <section className="admin-stats" aria-label="Store summary">
        <article className="admin-stat-card">
          <span className="admin-stat-icon" aria-hidden="true">▤</span>
          <p>Total orders</p>
          <strong>{orders.length}</strong>
          <small>All orders currently available</small>
        </article>
        <article className="admin-stat-card admin-stat-attention">
          <span className="admin-stat-icon" aria-hidden="true">◷</span>
          <p>Active orders</p>
          <strong>{pendingOrders}</strong>
          <small>Require fulfillment</small>
        </article>
        <article className="admin-stat-card">
          <span className="admin-stat-icon" aria-hidden="true">✓</span>
          <p>Cancelled orders</p>
          <strong>{cancelledOrders}</strong>
          <small>Orders marked cancelled</small>
        </article>
        <article className="admin-stat-card">
          <span className="admin-stat-icon" aria-hidden="true">☷</span>
          <p>Menu items</p>
          <strong>{dishes.length}</strong>
          <small>{categories.size} menu categories</small>
        </article>
      </section>

      <RevenueChart analytics={analytics} />

      <section className="admin-panel admin-orders-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>Orders</h2>
            <p>Sorted and paginated · order value is not verified payment revenue</p>
          </div>
          <Link className="admin-order-count" href="/admin/orders">Manage orders →</Link>
        </div>
        <OrderTable orders={orders} pageParam={params?.page} sortParam={params?.sort} />
      </section>
    </AdminShell>
  );
}
