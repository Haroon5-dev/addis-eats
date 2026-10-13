import Link from "next/link";
import { redirect } from "next/navigation";
import SignInForm from "./SignInForm.jsx";
import { getSession } from "../../lib/session.js";

function safeNext(value) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\") ? value : "/menu";
}

export default async function SignInPage({ searchParams }) {
  const params = await searchParams;
  const next = safeNext(params?.next);
  const session = await getSession();
  if (session) redirect(next);
  return <main className="auth-page"><section className="auth-card"><p><Link href="/menu">← Back to menu</Link></p><h1>Sign in to Addis Eats</h1><p>Sign in to continue to checkout and securely view your orders.</p><SignInForm next={next} /></section></main>;
}
