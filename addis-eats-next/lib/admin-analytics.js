const BUSINESS_TIME_ZONE = "Africa/Addis_Ababa";

function getDateKey(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function shiftDateKey(key, days) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

function dateLabel(key, options) {
  return new Intl.DateTimeFormat("en-ET", {
    ...options,
    timeZone: "UTC",
  }).format(new Date(`${key}T12:00:00Z`));
}

export function getDashboardAnalytics(orders, now = new Date()) {
  const today = getDateKey(now);
  const dates = Array.from({ length: 7 }, (_, index) => shiftDateKey(today, index - 6));
  const counts = new Map(dates.map((date) => [date, 0]));
  const neighborhoodTotals = new Map();
  let totalOrdersInPeriod = 0;

  for (const order of orders) {
    const createdAt = new Date(order.createdAt);
    if (!Number.isNaN(createdAt.valueOf())) {
      const day = getDateKey(createdAt);
      if (counts.has(day)) {
        counts.set(day, counts.get(day) + 1);
        totalOrdersInPeriod += 1;
      }
    }

    if (order.status === "cancelled") continue;
    const area = order.customer?.area?.trim() || "Area not specified";
    neighborhoodTotals.set(area, (neighborhoodTotals.get(area) ?? 0) + Number(order.total || 0));
  }

  const sortedAreas = [...neighborhoodTotals.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((first, second) => second.value - first.value || first.name.localeCompare(second.name));
  const visibleAreas = sortedAreas.slice(0, 7);
  const remainingValue = sortedAreas.slice(7).reduce((sum, area) => sum + area.value, 0);
  if (remainingValue > 0) visibleAreas.push({ name: "Other areas", value: remainingValue });

  return {
    orderValueByNeighborhood: visibleAreas,
    ordersByDay: dates.map((date) => ({
      date,
      label: dateLabel(date, { weekday: "short" }),
      fullLabel: dateLabel(date, { dateStyle: "medium" }),
      count: counts.get(date),
    })),
    totalOrdersInPeriod,
    periodLabel: `${dateLabel(dates[0], { day: "numeric", month: "short" })} – ${dateLabel(dates[6], { day: "numeric", month: "short", year: "numeric" })}`,
    timeZone: BUSINESS_TIME_ZONE,
  };
}

export function getPagedOrders(orders, sort, requestedPage, pageSize = 10) {
  const comparators = {
    newest: (first, second) => second.createdAt.localeCompare(first.createdAt),
    oldest: (first, second) => first.createdAt.localeCompare(second.createdAt),
    "total-high": (first, second) => second.total - first.total || second.createdAt.localeCompare(first.createdAt),
    "total-low": (first, second) => first.total - second.total || second.createdAt.localeCompare(first.createdAt),
  };
  const safeSort = Object.hasOwn(comparators, sort) ? sort : "newest";
  const sorted = [...orders].sort(comparators[safeSort]);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const page = Math.min(Math.max(Number.parseInt(requestedPage, 10) || 1, 1), totalPages);

  return {
    orders: sorted.slice((page - 1) * pageSize, page * pageSize),
    page,
    pageSize,
    total: sorted.length,
    totalPages,
    sort: safeSort,
  };
}
