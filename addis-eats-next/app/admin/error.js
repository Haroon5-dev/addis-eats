"use client";

import Link from "next/link";

export default function AdminError({ reset }) {
  return (
    <main className="admin-error-page" role="alert">
      <p className="admin-eyebrow">ADMIN WORKSPACE</p>
      <h1>We couldn’t load this dashboard</h1>
      <p>Please try again. If the problem continues, check the local order and menu data files.</p>
      <button className="admin-action-button" type="button" onClick={() => reset()}>Try again</button>
      <Link href="/admin">Open the dashboard</Link>
    </main>
  );
}
