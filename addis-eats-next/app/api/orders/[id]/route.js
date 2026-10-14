import { getOrder } from "../../../../lib/orders.js";
import { getSession } from "../../../../lib/session.js";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return Response.json({ error: { code: "UNAUTHENTICATED", message: "Please sign in." } }, { status: 401 });
  const order = await getOrder(id);
  if (!order) {
    return Response.json({ error: { code: "ORDER_NOT_FOUND", message: "Order not found." } }, { status: 404 });
  }

  if (order.ownerId !== session.userId) {
    return Response.json({ error: { code: "ORDER_NOT_FOUND", message: "Order not found." } }, { status: 404 });
  }

  return Response.json({
    order: {
      id: order.id,
      status: order.status,
      total: order.total,
      items: order.items,
      createdAt: order.createdAt,
      cancelledAt: order.cancelledAt ?? null,
    },
  }, { headers: { "Cache-Control": "no-store" } });
}
