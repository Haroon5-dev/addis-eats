import Link from "next/link";
import { redirect } from "next/navigation";

import { getDishes } from "../../../lib/menu.js";
import { getSession } from "../../../lib/session.js";
import { formatCurrency } from "../../../utils/formatCurrency.js";
import AdminShell from "../AdminShell.jsx";
import { deleteDishAction } from "../actions.js";
import ConfirmForm from "./ConfirmForm.jsx";

export const dynamic = "force-dynamic";
export const metadata = { title: "Menu management", robots: { index: false, follow: false } };

export default async function AdminMenuPage({ searchParams }) {
  const session = await getSession();
  if (!session || session.role !== "staff") redirect("/forbidden");
  const params = await searchParams;
  const dishes = getDishes();

  return (
    <AdminShell user={session} active="menu">
      <header className="admin-page-header">
        <div>
          <p className="admin-eyebrow">CATALOGUE</p>
          <h1>Menu management</h1>
          <p>Add dishes, update details, and control what customers can order.</p>
        </div>
        <Link href="/admin/menu/new" className="admin-action-button">＋ Add dish</Link>
      </header>
      {params?.error ? <p className="admin-feedback admin-feedback-error" role="alert">{params.error}</p> : null}
      {params?.saved ? <p className="admin-feedback" role="status">Dish saved. The customer menu now reflects the change.</p> : null}
      {params?.deleted ? <p className="admin-feedback" role="status">Dish removed or archived.</p> : null}
      <div className="admin-data-note" role="note">
        <strong>Local catalogue storage</strong>
        <span>Menu edits are stored in an ignored JSON file for this development environment and are reflected on the customer-facing menu. This is not production storage.</span>
      </div>
      {dishes.length === 0 ? (
        <section className="admin-panel admin-empty-state"><h2>No menu items</h2><p>Add a dish to start building the menu.</p></section>
      ) : (
        <div className="admin-panel admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th scope="col">Dish</th><th scope="col">Category</th><th scope="col">Price</th><th scope="col">Availability</th><th scope="col">Actions</th></tr></thead>
            <tbody>
              {dishes.map((dish) => (
                <tr key={dish.id}>
                  <td><strong>{dish.name}</strong></td>
                  <td>{dish.category}</td>
                  <td>{formatCurrency(dish.price)}</td>
                  <td><span className={`admin-status ${dish.available ? "admin-status-delivered" : "admin-status-cancelled"}`}>{dish.available ? "Available" : "Unavailable"}</span></td>
                  <td className="admin-menu-actions">
                    <Link href={`/admin/menu/${dish.id}`}>Edit</Link>
                    <ConfirmForm action={deleteDishAction} message={`Remove ${dish.name} from the customer menu? Items already used in orders will be archived instead.`}>
                      <input type="hidden" name="dishId" value={dish.id} />
                      <button type="submit" className="admin-text-button">{dish.available ? "Remove" : "Delete"}</button>
                    </ConfirmForm>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
