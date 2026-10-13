import Link from "next/link";
import dishes from "../../public/dishes.json";
import SearchBox from "./SearchBox.jsx";

const PAGE_SIZE = 4;
const CATEGORIES = new Set(["Ethiopian", "Pizza", "Burgers", "Drinks"]);
const getStringParam = (value) => (typeof value === "string" ? value : "");

export default async function MenuPage({ searchParams }) {
  const params = await searchParams;
  const requestedCategory = getStringParam(params.category);
  const category = CATEGORIES.has(requestedCategory) ? requestedCategory : "";
  const search = getStringParam(params.search).trim();
  const requestedPage = Number.parseInt(getStringParam(params.page) || "1", 10);
  const categoryDishes = dishes.filter((dish) => !category || dish.category === category);
  const normalizedSearch = search.toLocaleLowerCase();
  const filteredDishes = categoryDishes.filter((dish) =>
    `${dish.name} ${dish.category} ${dish.description}`
      .toLocaleLowerCase()
      .includes(normalizedSearch)
  );
  const totalPages = Math.max(1, Math.ceil(filteredDishes.length / PAGE_SIZE));
  const page = Number.isFinite(requestedPage)
    ? Math.min(Math.max(1, requestedPage), totalPages)
    : 1;
  const initialDishes = filteredDishes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const initialPagination = {
    page,
    limit: PAGE_SIZE,
    total: filteredDishes.length,
    totalPages,
    hasPrevious: page > 1,
    hasNext: page < totalPages,
  };

  return (
    <div className="menu-page">
      <div className="menu-heading">
        <div>
          <h1>Our Menu</h1>
          <p>
            Discover Ethiopian favorites and international classics, freshly
            prepared in Addis Ababa.
          </p>
        </div>
      </div>
      <nav className="menu-links" aria-label="Menu links">
        <Link href="/">Home</Link>
        <Link href="/cart">Cart</Link>
        <Link href="/checkout">Checkout</Link>
      </nav>
      <SearchBox
        key={`${category}:${search}:${page}`}
        allDishes={categoryDishes}
        initialDishes={initialDishes}
        initialPagination={initialPagination}
        initialCategory={category}
        initialSearch={search}
        initialPage={page}
      />
    </div>
  );
}
