import { redirect } from "next/navigation";

import { getSession } from "../../../../lib/session.js";
import AdminShell from "../../AdminShell.jsx";
import DishForm from "../DishForm.jsx";

export const metadata = { title: "Add a dish", robots: { index: false, follow: false } };

export default async function NewDishPage() {
  const session = await getSession();
  if (!session || session.role !== "staff") redirect("/forbidden");
  return (
    <AdminShell user={session} active="menu">
      <header className="admin-page-header"><div><p className="admin-eyebrow">CATALOGUE</p><h1>Add a dish</h1><p>Create an item for the Addis Eats customer menu.</p></div></header>
      <section className="admin-panel admin-dish-panel"><DishForm /></section>
    </AdminShell>
  );
}
