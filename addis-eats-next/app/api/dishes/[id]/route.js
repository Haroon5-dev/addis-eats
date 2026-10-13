import dishes from "../../../../public/dishes.json";

export async function GET(request, { params }) {
  const { id } = await params;
  const dish = dishes.find((item) => String(item.id) === String(id));

  if (!dish) {
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

  return Response.json({ dish });
}
