import { readLocalJson, writeLocalJson } from "./local-data.js";

function readOrders() {
  return readLocalJson("orders.json", []);
}

export function createOrder(order) {
  const id = `AE-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = new Date().toISOString();
  const record = {
    id,
    ...order,
    status: "pending",
    createdAt,
    statusHistory: [{ status: "pending", changedAt: createdAt, changedBy: "system" }],
  };

  writeLocalJson("orders.json", [...readOrders(), record]);
  return record;
}

export function getOrder(id) {
  return readOrders().find((order) => order.id === id);
}

export function getAllOrders() {
  return readOrders().sort((first, second) => second.createdAt.localeCompare(first.createdAt));
}

export function getOrdersForOwner(ownerId) {
  return getAllOrders()
    .filter((order) => order.ownerId === ownerId);
}

export function cancelStoredOrder(id) {
  const orders = readOrders();
  const index = orders.findIndex((order) => order.id === id);
  const order = orders[index];
  if (!order) return null;

  const changedAt = new Date().toISOString();
  const cancelled = {
    ...order,
    status: "cancelled",
    cancelledAt: changedAt,
    statusUpdatedAt: changedAt,
    statusHistory: [...(order.statusHistory ?? [{ status: order.status, changedAt: order.createdAt, changedBy: "system" }]), { status: "cancelled", changedAt, changedBy: order.ownerId }],
  };

  orders[index] = cancelled;
  writeLocalJson("orders.json", orders);
  return cancelled;
}

export const ORDER_STATUSES = ["pending", "confirmed", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"];

export const ORDER_STATUS_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export function updateOrderStatus(id, status, actor) {
  if (!ORDER_STATUSES.includes(status)) return { error: "Invalid order status." };

  const orders = readOrders();
  const index = orders.findIndex((order) => order.id === id);
  if (index === -1) return { error: "Order not found." };

  const order = orders[index];
  if (!ORDER_STATUS_TRANSITIONS[order.status]?.includes(status)) {
    return { error: `Cannot move an order from ${order.status} to ${status}.` };
  }

  const changedAt = new Date().toISOString();
  const updated = {
    ...order,
    status,
    statusUpdatedAt: changedAt,
    ...(status === "cancelled" ? { cancelledAt: changedAt } : {}),
    statusHistory: [...(order.statusHistory ?? [{ status: order.status, changedAt: order.createdAt, changedBy: "system" }]), { status, changedAt, changedBy: actor }],
  };

  orders[index] = updated;
  writeLocalJson("orders.json", orders);
  return { order: updated };
}
