import { notFound, redirect } from "next/navigation";

import { getDish } from "../../../../lib/menu.js";
import { getSession } from "../../../../lib/session.js";
import AdminShell from "../../AdminShell.jsx";
import DishForm from "../DishForm.jsx";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit dish", robots: { index: false, follow: false } };

export default async function EditDishPage({ params }) {
  const session = await getSession();
  if (!session || session.role !== "staff") redirect("/forbidden");
  const { id } = await params;
  const dish = getDish(id);
  if (!dish) notFound();

  return (
    <AdminShell user={session} active="menu">
      <header className="admin-page-header"><div><p className="admin-eyebrow">CATALOGUE</p><h1>Edit {dish.name}</h1><p>Update details shown on the customer-facing menu.</p></div></header>
      <section className="admin-panel admin-dish-panel"><DishForm dish={dish} /></section>
    </AdminShell>
  );
}
