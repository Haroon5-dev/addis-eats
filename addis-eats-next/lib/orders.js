import { neon } from "@neondatabase/serverless";
import { readLocalJson, writeLocalJson } from "./local-data.js";

let schemaReady;

async function getDatabase() {
  if (!process.env.DATABASE_URL) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("DATABASE_URL must be configured for production order storage.");
    }
    return null;
  }
  const sql = neon(process.env.DATABASE_URL);
  if (!schemaReady) {
    schemaReady = sql`
      CREATE TABLE IF NOT EXISTS addis_eats_orders (
        id TEXT PRIMARY KEY,
        owner_id TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL,
        status TEXT NOT NULL,
        order_data JSONB NOT NULL
      )
    `.then(async () => {
      await sql`CREATE INDEX IF NOT EXISTS addis_eats_orders_owner_created_idx ON addis_eats_orders (owner_id, created_at DESC)`;
    }).catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  await schemaReady;
  return sql;
}

function readLocalOrders() {
  return readLocalJson("orders.json", []);
}

export async function createOrder(order) {
  const id = `AE-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = new Date().toISOString();
  const record = {
    id,
    ...order,
    status: "pending",
    createdAt,
    statusHistory: [{ status: "pending", changedAt: createdAt, changedBy: "system" }],
  };

  const sql = await getDatabase();
  if (sql) {
    await sql`
      INSERT INTO addis_eats_orders (id, owner_id, created_at, status, order_data)
      VALUES (${record.id}, ${record.ownerId}, ${record.createdAt}, ${record.status}, ${JSON.stringify(record)}::jsonb)
    `;
  } else {
    writeLocalJson("orders.json", [...readLocalOrders(), record]);
  }
  return record;
}

export async function getOrder(id) {
  const sql = await getDatabase();
  if (!sql) return readLocalOrders().find((order) => order.id === id);
  const rows = await sql`SELECT order_data AS "orderData" FROM addis_eats_orders WHERE id = ${id} LIMIT 1`;
  return rows[0]?.orderData;
}

export async function getAllOrders() {
  const sql = await getDatabase();
  if (!sql) return readLocalOrders().sort((first, second) => second.createdAt.localeCompare(first.createdAt));
  const rows = await sql`SELECT order_data AS "orderData" FROM addis_eats_orders ORDER BY created_at DESC`;
  return rows.map((row) => row.orderData);
}

export async function getOrdersForOwner(ownerId) {
  const sql = await getDatabase();
  if (!sql) return (await getAllOrders()).filter((order) => order.ownerId === ownerId);
  const rows = await sql`
    SELECT order_data AS "orderData"
    FROM addis_eats_orders
    WHERE owner_id = ${ownerId}
    ORDER BY created_at DESC
  `;
  return rows.map((row) => row.orderData);
}

export async function cancelStoredOrder(id) {
  const sql = await getDatabase();
  const orders = sql ? null : readLocalOrders();
  if (sql) {
    const order = await getOrder(id);
    if (!order || order.status !== "pending") return null;
    const changedAt = new Date().toISOString();
    const cancelled = {
      ...order,
      status: "cancelled",
      cancelledAt: changedAt,
      statusUpdatedAt: changedAt,
      statusHistory: [...(order.statusHistory ?? [{ status: order.status, changedAt: order.createdAt, changedBy: "system" }]), { status: "cancelled", changedAt, changedBy: order.ownerId }],
    };
    const rows = await sql`
      UPDATE addis_eats_orders
      SET status = ${cancelled.status}, order_data = ${JSON.stringify(cancelled)}::jsonb
      WHERE id = ${id} AND status = 'pending'
      RETURNING id
    `;
    return rows.length ? cancelled : null;
  }

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

export async function updateOrderStatus(id, status, actor) {
  if (!ORDER_STATUSES.includes(status)) return { error: "Invalid order status." };

  const sql = await getDatabase();
  const orders = sql ? null : readLocalOrders();
  if (sql) {
    const order = await getOrder(id);
    if (!order) return { error: "Order not found." };
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
    const rows = await sql`
      UPDATE addis_eats_orders
      SET status = ${updated.status}, order_data = ${JSON.stringify(updated)}::jsonb
      WHERE id = ${id} AND status = ${order.status}
      RETURNING id
    `;
    if (!rows.length) return { error: "Order status changed concurrently. Reload and try again." };
    return { order: updated };
  }

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
