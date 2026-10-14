import Link from "next/link";
import { redirect } from "next/navigation";

import SignInForm from "../../signin/SignInForm.jsx";
import { getSession } from "../../../lib/session.js";

export const metadata = {
  title: "Admin sign in",
  description: "Sign in to the Addis Eats staff workspace.",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session?.role === "staff") redirect("/admin");

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p><Link href="/">← Back to Addis Eats</Link></p>
        <p className="admin-login-eyebrow">STAFF WORKSPACE</p>
        <h1>Admin sign in</h1>
        <p>Sign in with your staff account to manage Addis Eats.</p>
        <SignInForm next="/admin" />
      </section>
    </main>
  );
}
