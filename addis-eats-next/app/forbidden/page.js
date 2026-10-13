import Link from "next/link";
export default function ForbiddenPage() { return <main className="auth-page"><section className="auth-card"><h1>Access denied</h1><p>Your account does not have permission to open this page.</p><p><Link href="/menu">Return to menu</Link></p></section></main>; }
