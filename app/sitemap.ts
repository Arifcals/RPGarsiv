import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rpgarsiv.com";

  // Ana sayfa
  const routes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  // Oyunları çek ve sitemap'e ekle (opsiyonel - API'den çekebilirsiniz)
  try {
    const response = await fetch(`${siteUrl}/api/games`, {
      next: { revalidate: 3600 }, // 1 saat cache
    });

    if (response.ok) {
      const games = await response.json();

      games.forEach((game: { _id: string; updatedAt?: string }) => {
        routes.push({
          url: `${siteUrl}/?game=${game._id}`,
          lastModified: game.updatedAt ? new Date(game.updatedAt) : new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        });
      });
    }
  } catch (error) {
    console.error("Sitemap oluşturulurken hata:", error);
  }

  return routes;
}
