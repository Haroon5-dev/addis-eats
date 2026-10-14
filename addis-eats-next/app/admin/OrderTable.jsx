import Link from "next/link";

import { getPagedOrders } from "../../lib/admin-analytics.js";
import { formatCurrency } from "../../utils/formatCurrency.js";

const statusLabels = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready for pickup",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function sortHref(sort, page) {
  const params = new URLSearchParams();
  if (sort !== "newest") params.set("sort", sort);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/admin?${query}` : "/admin";
}

function SortHeading({ label, active, ascending, nextSort }) {
  const directionLabel = active ? (ascending ? "ascending" : "descending") : "not sorted";
  return (
    <th scope="col" aria-sort={active ? (ascending ? "ascending" : "descending") : "none"}>
      <Link className="admin-sort-link" href={sortHref(nextSort, 1)} aria-label={`Sort by ${label}; currently ${directionLabel}`}>
        {label}{active ? <span aria-hidden="true">{ascending ? " ↑" : " ↓"}</span> : null}
      </Link>
    </th>
  );
}

export default function OrderTable({ orders, pageParam, sortParam }) {
  const result = getPagedOrders(orders, sortParam, pageParam);
  const newest = result.sort === "newest";
  const oldest = result.sort === "oldest";
  const totalHigh = result.sort === "total-high";
  const totalLow = result.sort === "total-low";

  return (
    <>
      {result.total === 0 ? (
        <div className="admin-empty-state">
          <span aria-hidden="true">▤</span>
          <h3>No orders yet</h3>
          <p>New customer orders will appear here after checkout.</p>
        </div>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table admin-paged-order-table">
              <caption className="admin-sr-only">Customer orders. Use column headings to sort and pagination links to browse results.</caption>
              <thead>
                <tr>
                  <th scope="col">Order</th>
                  <th scope="col">Customer</th>
                  <th scope="col">Area</th>
                  <th scope="col">Items</th>
                  <SortHeading label="Order value" active={totalHigh || totalLow} ascending={totalLow} nextSort={totalHigh ? "total-low" : "total-high"} />
                  <th scope="col">Status</th>
                  <SortHeading label="Placed (Addis Ababa)" active={newest || oldest} ascending={oldest} nextSort={newest ? "oldest" : "newest"} />
                </tr>
              </thead>
              <tbody>
                {result.orders.map((order) => (
                  <tr key={order.id}>
                    <td><Link className="admin-order-id" href={`/admin/orders/${encodeURIComponent(order.id)}`}>{order.id}</Link></td>
                    <td>{order.customer.name}</td>
                    <td>{order.customer.area}</td>
                    <td>{order.items.reduce((count, item) => count + item.quantity, 0)}</td>
                    <td>{formatCurrency(order.total)}</td>
                    <td><span className={`admin-status admin-status-${order.status}`}>{statusLabels[order.status] ?? order.status}</span></td>
                    <td>{new Intl.DateTimeFormat("en-ET", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Addis_Ababa" }).format(new Date(order.createdAt))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <nav className="admin-pagination" aria-label="Order table pages">
            <span className="admin-pagination-summary">
              Showing {(result.page - 1) * result.pageSize + 1}–{Math.min(result.page * result.pageSize, result.total)} of {result.total}
            </span>
            <div>
              {result.page > 1 ? <Link href={sortHref(result.sort, result.page - 1)} rel="prev">Previous</Link> : <span aria-disabled="true">Previous</span>}
              <span className="admin-pagination-current" aria-current="page">Page {result.page} of {result.totalPages}</span>
              {result.page < result.totalPages ? <Link href={sortHref(result.sort, result.page + 1)} rel="next">Next</Link> : <span aria-disabled="true">Next</span>}
            </div>
          </nav>
        </>
      )}
    </>
  );
}
