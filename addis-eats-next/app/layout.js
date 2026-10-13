import Link from "next/link";
import "./globals.css";
import Providers from "./providers.jsx";
import CartNavLink from "./cart/CartNavLink.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import { getSession } from "../lib/session.js";
import { signOut } from "./actions.js";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Addis Eats | Delicious food, delivered", template: "%s | Addis Eats" },
  description: "Discover Ethiopian favorites and delicious meals at Addis Eats.",
  openGraph: {
    type: "website", siteName: "Addis Eats",
    title: "Addis Eats | Delicious food, delivered",
    description: "Discover Ethiopian favorites and delicious meals at Addis Eats.",
    url: "/", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Addis Eats food menu" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Addis Eats | Delicious food, delivered",
    description: "Discover Ethiopian favorites and delicious meals at Addis Eats.",
    images: ["/opengraph-image"],
  },
};

export default async function RootLayout({ children }) {
  const session = await getSession();
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <header className="site-header">
          <div className="site-header-inner">
            <Link href="/" className="site-logo">
              Addis Eats
            </Link>

            <nav className="site-nav" aria-label="Main navigation">
              <Link href="/">Home</Link>
              <Link href="/menu">Menu</Link>
              <CartNavLink />
              <Link href="/favorites">Favorites</Link>
              {session ? <Link href="/orders">Orders</Link> : null}
              <Link href="/checkout">Checkout</Link>
              {session ? (
                <form action={signOut} className="nav-auth-form">
                  <span className="nav-user">{session.email}</span>
                  <button type="submit" className="nav-signout">Sign out</button>
                </form>
              ) : (
                <Link href="/signin">Sign in</Link>
              )}
              <ThemeToggle />
            </nav>
          </div>
        </header>

        <Providers>
          <main className="site-main">{children}</main>
        </Providers>

        <footer className="site-footer">
          <p>© 2026 Addis Eats. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
