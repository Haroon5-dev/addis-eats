import Link from "next/link";
import Image from "next/image";
import { getDishes } from "../lib/menu.js";
import { formatCurrency } from "../utils/formatCurrency.js";

export const dynamic = "force-dynamic";

export default function Home() {
  const dishes = getDishes().filter((dish) => dish.available);
  const specials = [1, 3, 4]
    .map((id) => dishes.find((dish) => dish.id === id))
    .filter(Boolean);

  return (
    <div className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <Image
          className="home-hero-image"
          src="/images/Mainhero.jpg"
          alt="Freshly baked pizza topped with tomato, melted cheese and basil"
          fill
          preload
          quality={70}
          sizes="(max-width: 1361px) 94vw, 1280px"
        />
        <div className="home-hero-shade" />
        <div className="home-hero-content">
          <p className="home-eyebrow">A taste of Addis, made for you</p>
          <h1 id="home-title">Good food brings us together.</h1>
          <p>
            From Ethiopian favorites to familiar comforts, discover something
            delicious and order it with ease.
          </p>
          <div className="home-hero-actions">
            <Link className="home-primary-link" href="/menu">
              Explore the menu
            </Link>
            <Link className="home-secondary-link" href="/cart">
              View your cart
            </Link>
          </div>
        </div>
        <span className="home-hero-note">Freshly prepared in Addis Ababa</span>
      </section>

      <section className="home-specials" aria-labelledby="specials-title">
        <div className="home-section-heading">
          <div>
            <p className="home-eyebrow">Chosen for today</p>
            <h2 id="specials-title">A few local favorites</h2>
          </div>
          <Link href="/menu" className="home-view-menu">
            See the full menu <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="home-special-grid">
          {specials.map((dish) => (
            <article className="home-special-card" key={dish.id}>
              <Link
                className="home-special-image-link"
                href={`/menu/${dish.id}`}
                aria-label={`View ${dish.name}`}
              >
                <Image
                  src={dish.image}
                  alt={`${dish.name}, ${dish.description}`}
                  width={800}
                  height={600}
                  sizes="(max-width: 680px) 100vw, (max-width: 1000px) 50vw, 33vw"
                />
              </Link>
              <div className="home-special-copy">
                <p>{dish.category}</p>
                <h3>
                  <Link href={`/menu/${dish.id}`}>{dish.name}</Link>
                </h3>
                <span>{formatCurrency(dish.price)}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}