"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getAllOrders, updateOrderStatus } from "../../lib/orders.js";
import { getDishes, saveDishes } from "../../lib/menu.js";
import { getSession } from "../../lib/session.js";

const dishSchema = z.object({
  name: z.string().trim().min(2).max(80),
  category: z.string().trim().min(2).max(40),
  price: z.coerce.number().positive().max(100000),
  description: z.string().trim().min(10).max(500),
  image: z.string().trim().startsWith("/").refine((value) => !value.startsWith("//") && !value.includes("\\")),
  ingredients: z.array(z.string().trim().min(1).max(50)).max(20),
});

async function requireStaff(roles = ["staff"]) {
  const session = await getSession();
  if (!session || !roles.includes(session.role)) redirect("/forbidden");
  return session;
}

export async function updateAdminOrderStatus(formData) {
  const session = await requireStaff(["staff", "kitchen"]);
  const id = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (session.role === "kitchen" && !["preparing", "ready"].includes(status)) {
    redirect("/forbidden");
  }
  const result = await updateOrderStatus(id, status, session.email);

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${encodeURIComponent(id)}`);
  revalidatePath("/staff/kitchen");
  revalidatePath("/orders");
  const detailReturn = formData.get("returnTo") === "detail";
  const destination = session.role === "kitchen"
    ? "/staff/kitchen"
    : detailReturn
      ? `/admin/orders/${encodeURIComponent(id)}`
      : "/admin/orders";
  if (result.error) redirect(`${destination}?error=${encodeURIComponent(result.error)}`);
  redirect(`${destination}?updated=1`);
}

export async function saveDishAction(formData) {
  await requireStaff();
  const ingredients = String(formData.get("ingredients") ?? "")
    .split(",")
    .map((ingredient) => ingredient.trim())
    .filter(Boolean);
  const parsed = dishSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    price: formData.get("price"),
    description: formData.get("description"),
    image: formData.get("image"),
    ingredients,
  });

  if (!parsed.success) {
    redirect(`/admin/menu?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Please check the dish details.")}`);
  }

  const dishes = getDishes();
  const rawId = String(formData.get("dishId") ?? "");
  const existingIndex = rawId ? dishes.findIndex((dish) => String(dish.id) === rawId) : -1;
  if (rawId && existingIndex === -1) redirect("/admin/menu?error=Dish%20not%20found");

  const availability = formData.get("available") === "on";
  const dish = {
    ...(existingIndex >= 0 ? dishes[existingIndex] : { id: Math.max(0, ...dishes.map((item) => Number(item.id) || 0)) + 1, spicy: false }),
    ...parsed.data,
    available: availability,
  };

  if (existingIndex >= 0) dishes[existingIndex] = dish;
  else dishes.push(dish);
  saveDishes(dishes);
  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath(`/menu/${dish.id}`);
  revalidatePath("/api/dishes");
  redirect("/admin/menu?saved=1");
}

export async function deleteDishAction(formData) {
  await requireStaff();
  const rawId = String(formData.get("dishId") ?? "");
  const dishId = Number(rawId);
  const dishes = getDishes();
  const dish = dishes.find((item) => item.id === dishId);
  if (!dish) redirect("/admin/menu?error=Dish%20not%20found");

  const isOrdered = (await getAllOrders()).some((order) => order.items.some((item) => Number(item.id) === dishId));
  if (isOrdered) {
    saveDishes(dishes.map((item) => item.id === dishId ? { ...item, available: false } : item));
  } else {
    saveDishes(dishes.filter((item) => item.id !== dishId));
  }

  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath(`/menu/${dishId}`);
  redirect("/admin/menu?deleted=1");
}
