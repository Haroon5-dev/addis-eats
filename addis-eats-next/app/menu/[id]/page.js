import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getDish } from "../../../lib/menu.js";
import { formatCurrency } from "../../../utils/formatCurrency.js";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const dish = getDish(id);
  if (!dish || !dish.available) return { title: "Dish not found", robots: { index: false, follow: false } };

  const description = `${dish.description} ${dish.name} at Addis Eats for ${dish.price} ETB.`;
  return {
    title: dish.name,
    description,
    alternates: { canonical: `/menu/${dish.id}` },
    openGraph: {
      type: "article", title: `${dish.name} | Addis Eats`, description,
      url: `/menu/${dish.id}`,
      images: [{ url: `/menu/${dish.id}/opengraph-image`, width: 1200, height: 630, alt: dish.name }],
    },
    twitter: { card: "summary_large_image", title: `${dish.name} | Addis Eats`, description, images: [`/menu/${dish.id}/opengraph-image`] },
  };
}

export default async function DishPage({ params }) {
  const { id } = await params;
  const dish = getDish(id);
  if (!dish || !dish.available) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MenuItem",
    name: dish.name,
    description: dish.description,
    image: dish.image ? new URL(dish.image, siteUrl).toString() : undefined,
    offers: {
      "@type": "Offer",
      price: String(dish.price),
      priceCurrency: "ETB",
      availability: "https://schema.org/InStock",
      url: new URL(`/menu/${dish.id}`, siteUrl).toString(),
    },
  };

  return (
    <div className="dish-detail">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      {dish.image ? (
        <Image src={dish.image} alt={`${dish.name} - ${dish.description}`} width={1200} height={900} sizes="(max-width: 700px) 100vw, 800px" priority />
      ) : null}
      <h1>{dish.name}</h1>
      <p>{dish.description}</p>
      <p className="dish-price">{formatCurrency(dish.price)}</p>
      <p>Category: {dish.category}</p>
      {dish.ingredients?.length ? (
        <section aria-labelledby="ingredients-title">
          <h2 id="ingredients-title">Ingredients</h2>
          <ul>
            {dish.ingredients.map((ingredient) => (
              <li key={ingredient}>{ingredient}</li>
            ))}
          </ul>
        </section>
      ) : null}
      <Link href="/menu">← Back to Menu</Link>
    </div>
  );
}
