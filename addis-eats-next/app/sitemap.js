import dishes from "../public/dishes.json";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function sitemap() {
  const lastModified = new Date();
  const publicRoutes = [
    { url: `${siteUrl}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/menu`, lastModified, changeFrequency: "daily", priority: 0.9 },
  ];
  const dishRoutes = dishes.map((dish) => ({
    url: `${siteUrl}/menu/${dish.id}`, lastModified, changeFrequency: "weekly", priority: 0.7,
  }));
  return [...publicRoutes, ...dishRoutes];
}
