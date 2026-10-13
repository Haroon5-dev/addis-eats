"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import fetcher from "../../lib/fetcher.js";
import DishesList from "./DishesList.jsx";

const PAGE_SIZE = 4;

export default function SearchBox({
  allDishes,
  initialDishes,
  initialPagination,
  initialCategory,
  initialSearch,
  initialPage,
}) {
  const router = useRouter();
  const [input, setInput] = useState(initialSearch);
  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(initialPage);

  const updateUrl = useCallback(
    (changes) => {
      const url = new URL(window.location.href);
      Object.entries(changes).forEach(([key, value]) => {
        if (!value || (key === "page" && value === 1)) {
          url.searchParams.delete(key);
        } else {
          url.searchParams.set(key, String(value));
        }
      });
      router.replace(`${url.pathname}${url.search}`, { scroll: false });
    },
    [router]
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const nextSearch = input.trim();
      if (nextSearch === search) return;
      setSearch(nextSearch);
      setPage(1);
      updateUrl({ search: nextSearch, page: 1 });
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [input, search, updateUrl]);

  const key = search
    ? `/api/dishes?search=${encodeURIComponent(search)}&category=${encodeURIComponent(initialCategory)}&page=${page}&limit=${PAGE_SIZE}`
    : null;
  const { data, error, isLoading, isValidating } = useSWR(key, fetcher, {
    fallbackData: { dishes: initialDishes, pagination: initialPagination },
    keepPreviousData: true,
    revalidateOnFocus: false,
    dedupingInterval: 2000,
  });

  const allPagination = {
    page,
    limit: PAGE_SIZE,
    total: allDishes.length,
    totalPages: Math.max(1, Math.ceil(allDishes.length / PAGE_SIZE)),
    hasPrevious: page > 1,
    hasNext: page < Math.max(1, Math.ceil(allDishes.length / PAGE_SIZE)),
  };
  const visibleDishes = search
    ? data?.dishes ?? initialDishes
    : allDishes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pagination = search ? data?.pagination ?? initialPagination : allPagination;

  function changePage(nextPage) {
    setPage(nextPage);
    updateUrl({ page: nextPage });
  }

  return (
    <section className="menu-search" aria-label="Search menu">
      <label htmlFor="dish-search">Search dishes</label>
      <input
        id="dish-search"
        type="search"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Search by dish, category, or ingredient..."
        autoComplete="off"
      />
      <div className="search-status" aria-live="polite">
        {isValidating && search
          ? "Updating results…"
          : search
            ? `${pagination.total} result(s) for “${search}”`
            : `${pagination.total} dishes available`}
      </div>
      {error && (
        <p className="form-error" role="alert">
          Could not refresh dishes: {error.message}
        </p>
      )}
      {isLoading && search && <p className="loading-message">Searching menu…</p>}
      <DishesList dishes={visibleDishes} />
      <nav className="pagination" aria-label="Dish pages">
        <button
          type="button"
          onClick={() => changePage(Math.max(1, page - 1))}
          disabled={page <= 1}
        >
          Previous
        </button>
        <span>
          Page {pagination.page ?? page} of {pagination.totalPages ?? 1}
        </span>
        <button
          type="button"
          onClick={() =>
            changePage(Math.min(pagination.totalPages ?? 1, page + 1))
          }
          disabled={!pagination.hasNext}
        >
          Next
        </button>
      </nav>
      {!search && (
        <p className="search-hint">
          Browse the full menu or enter a term to search.
        </p>
      )}
    </section>
  );
}
