"use server";

import { redirect } from "next/navigation";

import { orderSchema, zodFieldErrors } from "../lib/schema.js";
import { cancelStoredOrder, createOrder, getOrder } from "../lib/orders.js";
import { clearSession, getSession, setSession } from "../lib/session.js";
import { getDishes } from "../lib/menu.js";


function safeNext(value) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")
    ? value
    : "/menu";
}

export async function signIn(_previousState, formData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));
  const isAdminSignIn = next === "/admin" || next.startsWith("/admin/");
  const configuredAccounts = [
    { email: process.env.AUTH_EMAIL, password: process.env.AUTH_PASSWORD, role: "customer" },
    { email: process.env.STAFF_EMAIL, password: process.env.STAFF_PASSWORD, role: "staff" },
    { email: process.env.KITCHEN_EMAIL, password: process.env.KITCHEN_PASSWORD, role: "kitchen" },
  ].filter((account) => account.email && account.password);
  const accounts = isAdminSignIn
    ? configuredAccounts.filter((account) => account.role === "staff")
    : configuredAccounts;

  if (accounts.length === 0) {
    return {
      status: "error",
      message: isAdminSignIn
        ? "Admin sign-in is not configured for this deployment. Set STAFF_EMAIL, STAFF_PASSWORD, and AUTH_SECRET in Vercel Project Settings > Environment Variables for the Production environment, then redeploy. For local development, set them in .env.local and restart the server."
        : "Sign-in is not configured for this deployment. Set AUTH_EMAIL and AUTH_PASSWORD, plus AUTH_SECRET, in the hosting provider's environment variables and redeploy. For local development, set them in .env.local and restart the server.",
    };
  }

  const account = accounts.find((entry) => entry.email.toLowerCase() === email && entry.password === password);

  if (!account) return { status: "error", message: "Email or password is incorrect. Use the credentials configured for this account." };

  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) {
    return {
      status: "error",
      message: "Sign-in setup is incomplete: AUTH_SECRET must be at least 32 characters. Set it in the hosting provider's environment variables and redeploy, or set it in .env.local and restart the local server.",
    };
  }

  await setSession({ userId: email, id: email, email, role: account.role });
  redirect(next);
}

export async function signOut() {
  await clearSession();
  redirect("/signin");
}

function parseItems(rawItems) {
  try {
    return JSON.parse(rawItems || "[]");
  } catch {
    return [];
  }
}

function buildOrder(formData) {
  const submittedItems = parseItems(formData.get("items"));
  const dishes = getDishes();
  const unknownItem = submittedItems.find(
    (item) => !dishes.some((entry) => String(entry.id) === String(item?.id) && entry.available)
  );

  if (unknownItem) {
    return { invalidItemId: unknownItem?.id };
  }

  const items = submittedItems.map((item) => {
    const dish = dishes.find((entry) => String(entry.id) === String(item.id));

    return {
      id: dish.id,
      name: dish.name,
      price: dish.price,
      quantity: item.quantity,
    };
  });

  const total = items.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  return {
    customer: {
      name: String(formData.get("name") ?? ""),
      telebirr: String(formData.get("telebirr") ?? ""),
      area: String(formData.get("area") ?? ""),
      notes: String(formData.get("notes") ?? ""),
    },
    items,
    total,
  };
}

export async function placeOrder(previousState, formData) {
  const candidate = buildOrder(formData);

  if (candidate.invalidItemId !== undefined) {
    return {
      status: "error",
      fieldErrors: {
        items: `Dish ${candidate.invalidItemId} is unavailable or no longer exists.`,
      },
    };
  }

  const parsed = orderSchema.safeParse(candidate);

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  const session = await getSession();
  if (!session) return { status: "error", fieldErrors: {}, message: "Please sign in before placing an order." };
  const order = await createOrder({
    ...parsed.data,
    ownerId: session.userId,
  });

  return {
    status: "success",
    orderId: order.id,
    total: order.total,
  };
}

export async function cancelOrder(orderId) {
  const session = await getSession();
  if (!session) return { status: "error", code: "UNAUTHENTICATED", message: "Please sign in." };
  const order = await getOrder(orderId);

  if (!order) {
    return {
      status: "error",
      code: "NOT_FOUND",
      message: "Order not found.",
    };
  }

  if (order.ownerId !== session.userId) {
    return {
      status: "error",
      code: "FORBIDDEN",
      message: "You can only cancel your own orders.",
    };
  }

  if (order.status === "cancelled") {
    return {
      status: "success",
      orderId: order.id,
      orderStatus: "cancelled",
    };
  }

  if (order.status !== "pending") {
    return {
      status: "error",
      code: "INVALID_STATUS",
      message: "Only pending orders can be cancelled.",
    };
  }

  const cancelled = await cancelStoredOrder(order.id);
  if (!cancelled) {
    return {
      status: "error",
      code: "INVALID_STATUS",
      message: "The order status changed before cancellation. Refresh the page and try again.",
    };
  }

  return {
    status: "success",
    orderId: cancelled.id,
    orderStatus: cancelled.status,
  };
}
