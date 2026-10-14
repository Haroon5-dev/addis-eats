import initialDishes from "../public/dishes.json";
import { readLocalJson, writeLocalJson } from "./local-data.js";

export function getDishes() {
  const dishes = readLocalJson("menu.json", initialDishes);
  return dishes.map((dish) => ({ ...dish, available: dish.available !== false }));
}

export function getDish(id) {
  return getDishes().find((dish) => String(dish.id) === String(id));
}

export function saveDishes(dishes) {
  writeLocalJson("menu.json", dishes);
}
