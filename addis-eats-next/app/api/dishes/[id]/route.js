import { getDish } from "../../../../lib/menu.js";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const { id } = await params;
  const dish = getDish(id);

  if (!dish || !dish.available) {
    return Response.json(
      {
        error: {
          code: "DISH_NOT_FOUND",
          message: "Dish not found.",
        },
      },
      { status: 404 }
    );
  }

  return Response.json({ dish }, { headers: { "Cache-Control": "no-store" } });
}
