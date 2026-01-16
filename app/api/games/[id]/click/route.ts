import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Game from "@/models/Game";

// IP adresini al
function getClientIP(request: Request): string {
  // Cloudflare, Vercel, vb. için farklı header'lar kontrol et
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip");

  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(",")[0].trim();

  return "unknown";
}

// Oyun tıklama sayısını artır (24 saat içinde aynı IP'den tekrar sayılmaz)
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const clientIP = getClientIP(request);

    const game = await Game.findById(id);
    if (!game) {
      return NextResponse.json({ error: "Oyun bulunamadı" }, { status: 404 });
    }

    // Son 24 saat içinde bu IP'den görüntüleme var mı kontrol et
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const hasRecentView = game.viewedIPs?.some(
      (view: { ip: string; timestamp: Date }) => view.ip === clientIP && new Date(view.timestamp) > oneDayAgo
    );

    if (!hasRecentView) {
      // Yeni görüntüleme ekle ve sayıyı artır
      game.clickCount += 1;
      game.viewedIPs = game.viewedIPs || [];
      game.viewedIPs.push({ ip: clientIP, timestamp: new Date() });

      // 30 günden eski kayıtları temizle (performans için)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      game.viewedIPs = game.viewedIPs.filter(
        (view: { ip: string; timestamp: Date }) => new Date(view.timestamp) > thirtyDaysAgo
      );

      // Validation hatasını önlemek için boş content'leri düzelt
      if (game.sections) {
        game.sections.forEach((section: any) => {
          if (!section.content) {
            section.content = " ";
          }
          if (section.subsections) {
            section.subsections.forEach((sub: any) => {
              if (!sub.content) {
                sub.content = " ";
              }
            });
          }
        });
      }

      await game.save();
    }

    return NextResponse.json({
      clickCount: game.clickCount,
      counted: !hasRecentView,
    });
  } catch (error) {
    console.error("Increment click error:", error);
    return NextResponse.json({ error: "Tıklama sayısı güncellenirken hata oluştu" }, { status: 500 });
  }
}
