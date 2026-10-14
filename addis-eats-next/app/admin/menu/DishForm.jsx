import Link from "next/link";

import { saveDishAction } from "../actions.js";

export default function DishForm({ dish }) {
  return (
    <form action={saveDishAction} className="admin-dish-form">
      <input type="hidden" name="dishId" value={dish?.id ?? ""} />
      <div className="admin-dish-form-grid">
        <label>
          Dish name
          <input name="name" required minLength={2} maxLength={80} defaultValue={dish?.name ?? ""} />
        </label>
        <label>
          Category
          <input name="category" required minLength={2} maxLength={40} list="dish-categories" defaultValue={dish?.category ?? ""} />
          <datalist id="dish-categories"><option value="Ethiopian" /><option value="Pizza" /><option value="Burgers" /><option value="Drinks" /></datalist>
        </label>
        <label>
          Price (ETB)
          <input name="price" type="number" min="0.01" step="0.01" required defaultValue={dish?.price ?? ""} />
        </label>
        <label>
          Image path
          <input name="image" type="text" required placeholder="/images/doro-wat.jpg" defaultValue={dish?.image ?? ""} />
          <small>Use an image path from the public folder, such as /images/doro-wat.jpg.</small>
        </label>
        <label className="admin-dish-description">
          Description
          <textarea name="description" rows="4" minLength={10} maxLength={500} required defaultValue={dish?.description ?? ""} />
        </label>
        <label className="admin-dish-description">
          Ingredients <span>(comma separated)</span>
          <textarea name="ingredients" rows="3" defaultValue={dish?.ingredients?.join(", ") ?? ""} />
        </label>
      </div>
      <label className="admin-availability-control">
        <input type="checkbox" name="available" defaultChecked={dish?.available ?? true} />
        Available to order
      </label>
      <div className="admin-form-actions">
        <button className="admin-action-button" type="submit">{dish ? "Save changes" : "Add dish"}</button>
        <Link href="/admin/menu">Cancel</Link>
      </div>
    </form>
  );
}
