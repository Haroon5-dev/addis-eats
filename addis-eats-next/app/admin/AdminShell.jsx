import Link from "next/link";

const navigation = [
  { href: "/admin", label: "Overview", icon: "▦", key: "overview" },
  { href: "/admin/orders", label: "Orders", icon: "◷", key: "orders" },
  { href: "/admin/menu", label: "Menu", icon: "☷", key: "menu" },
  { href: "/admin/customers", label: "Customers", icon: "♙", key: "customers" },
  { href: "/staff/kitchen", label: "Kitchen", icon: "⌂", key: "kitchen" },
];

export default function AdminShell({ user, active, children }) {
  const visibleNavigation = user.role === "staff"
    ? navigation
    : navigation.filter((item) => item.key === "kitchen");
  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar" aria-label="Admin navigation">
        <Link className="admin-brand" href={user.role === "staff" ? "/admin" : "/staff/kitchen"}>
          <span className="admin-brand-mark" aria-hidden="true">A</span>
          <span><strong>Addis Eats</strong><small>STAFF WORKSPACE</small></span>
        </Link>
        <p className="admin-nav-label">WORKSPACE</p>
        <nav className="admin-nav">
          {visibleNavigation.map((item) => (
            <Link
              className={`admin-nav-link${active === item.key ? " is-active" : ""}`}
              href={item.href}
              aria-current={active === item.key ? "page" : undefined}
              key={item.key}
            >
              <span aria-hidden="true">{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-note">
          <span className="admin-live-dot" aria-hidden="true" />
          Staff access
          <small>{user.email}</small>
        </div>
      </aside>
      <section className="admin-content">{children}</section>
    </div>
  );
}
