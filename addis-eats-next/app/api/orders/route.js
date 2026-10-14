import { orderSchema, zodFieldErrors } from "../../../lib/schema.js";
import { createOrder } from "../../../lib/orders.js";
import { getSession } from "../../../lib/session.js";
import { getDishes } from "../../../lib/menu.js";

function normaliseOrder(input) {
  const customer = input?.customer;
  const dishes = getDishes();
  const submittedItems = Array.isArray(input?.items) ? input.items : [];
  const unknownItem = submittedItems.find(
    (item) => !dishes.some((entry) => String(entry.id) === String(item?.id) && entry.available)
  );

  if (unknownItem) {
    return {
      customer,
      items: [],
      total: 0,
      invalidItemId: unknownItem?.id,
    };
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

  return { customer, items, total };
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      {
        error: {
          code: "INVALID_JSON",
          message: "Request body must be valid JSON.",
        },
      },
      { status: 400 }
    );
  }

  const normalized = normaliseOrder(body);

  if (normalized.invalidItemId !== undefined) {
    return Response.json(
      {
        error: {
          code: "UNKNOWN_DISH",
          message: `Dish ${normalized.invalidItemId} does not exist or is unavailable.`,
        },
      },
      { status: 422 }
    );
  }

  const parsed = orderSchema.safeParse(normalized);

  if (!parsed.success) {
    return Response.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Please correct the highlighted fields.",
        },
        errors: zodFieldErrors(parsed.error),
      },
      { status: 422 }
    );
  }

  const session = await getSession();
  if (!session) return Response.json({ error: { code: "UNAUTHENTICATED", message: "Please sign in before placing an order." } }, { status: 401 });
  const order = await createOrder({
    ...parsed.data,
    ownerId: session.userId,
  });

  return Response.json(
    {
      order: {
        id: order.id,
        status: order.status,
        total: order.total,
      },
    },
    { status: 201 }
  );
}
