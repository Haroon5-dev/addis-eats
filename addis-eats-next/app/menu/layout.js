import Link from "next/link";

const categories = ["All", "Ethiopian", "Pizza", "Burgers", "Drinks"];

export default function MenuLayout({ children }) {
  return (
    <div className="menu-layout">
      <aside className="menu-sidebar">
        <h2>Categories</h2>

        <nav aria-label="Menu categories">
          <ul>
            {categories.map((category) => (
              <li key={category}>
                <Link
                  href={category === "All" ? "/menu" : `/menu?category=${encodeURIComponent(category)}`}
                >
                  {category}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <section className="menu-content">
        {children}
      </section>
    </div>
  );
}