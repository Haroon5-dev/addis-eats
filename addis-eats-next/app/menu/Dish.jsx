import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "../../utils/formatCurrency.js";
import AddToCartButton from "../cart/AddToCartButton.jsx";
import FavoriteButton from "../favorites/FavoriteButton.jsx";

export default function Dish({ dish }) {
  if (!dish) return null;

  return (
    <article className="dish" data-dish-category={dish.category}>
      <Image width={800} height={600} sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" src={dish.image} alt={`${dish.name} served at Addis Eats`} className="dish-image" />

      <div className="dish-content">
        <h2>
          {dish.name}
          {dish.spicy && <span className="spicy">Spicy</span>}
        </h2>

        {dish.description && <p>{dish.description}</p>}
        <p className="dish-price">{formatCurrency(dish.price)}</p>

        <div className="dish-actions">
          <Link href={`/menu/${dish.id}`} className="details-link">
            View Details
          </Link>
          <AddToCartButton dish={dish} />
          <FavoriteButton dish={dish} />
        </div>
      </div>
    </article>
  );
}
