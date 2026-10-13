import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "../../../lib/session.js";
export const dynamic = "force-dynamic";
export default async function KitchenPage() {
  const session = await getSession();
  if (!session) redirect("/signin?next=%2Fstaff%2Fkitchen");
  if (!["staff", "kitchen"].includes(session.role)) redirect("/forbidden");
  return <main className="auth-page"><section className="auth-card"><h1>Kitchen dashboard</h1><p>Signed in as {session.email}</p><p>This staff-only route is protected by a server-side role check.</p><p><Link href="/menu">Back to menu</Link></p><form action="/signout" method="post"><button type="submit">Sign out</button></form></section></main>;
}
