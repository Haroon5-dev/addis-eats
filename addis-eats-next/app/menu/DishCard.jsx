import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "../../utils/formatCurrency.js";

export default function DishCard({ dish }) {
  return (
    <article className="dish">
      <Image
        className="dish-image"
        src={dish.image}
        alt={dish.imageAlt || `${dish.name} served at Addis Eats`}
        width={800}
        height={600}
        sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
      />
      <div className="dish-content">
        <h2>{dish.name}{dish.spicy ? <span className="spicy">Spicy</span> : null}</h2>
        <p>{dish.description}</p>
        <p className="dish-price">{formatCurrency(dish.price)}</p>
        <div className="dish-actions">
          <Link className="details-link" href={`/menu/${dish.id}`}>View details</Link>
        </div>
      </div>
    </article>
  );
}
