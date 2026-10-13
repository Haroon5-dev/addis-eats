import dishes from "../../../public/dishes.json";

const DEFAULT_LIMIT = 4;
const MAX_LIMIT = 12;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = (searchParams.get("search") || "").trim().toLocaleLowerCase();
  const category = (searchParams.get("category") || "").trim().toLocaleLowerCase();
  const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number.parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT));

  const filtered = dishes.filter((dish) => {
    const searchable = `${dish.name} ${dish.category} ${dish.description}`.toLocaleLowerCase();
    const matchesSearch = !search || searchable.includes(search);
    const matchesCategory = !category || dish.category.toLocaleLowerCase() === category;
    return matchesSearch && matchesCategory;
  });
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * limit;

  return Response.json({
    dishes: filtered.slice(start, start + limit),
    pagination: { page: safePage, limit, total, totalPages, hasPrevious: safePage > 1, hasNext: safePage < totalPages },
    query: { search, category },
  }, { headers: { "Cache-Control": "no-store" } });
}
