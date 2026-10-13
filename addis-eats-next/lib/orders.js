const globalStore = globalThis;

globalStore.__addisEatsOrders ??= new Map();

const orders = globalStore.__addisEatsOrders;

export function createOrder(order) {
  const id = `AE-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const record = {
    id,
    ...order,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  orders.set(id, record);
  return record;
}

export function getOrder(id) {
  return orders.get(id);
}

export function getOrdersForOwner(ownerId) {
  return [...orders.values()]
    .filter((order) => order.ownerId === ownerId)
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt));
}

export function cancelStoredOrder(id) {
  const order = orders.get(id);

  if (!order) return null;

  const cancelled = {
    ...order,
    status: "cancelled",
    cancelledAt: new Date().toISOString(),
  };

  orders.set(id, cancelled);
  return cancelled;
}
