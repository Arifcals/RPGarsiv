import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/mongodb";
import Game from "@/models/Game";

// Tüm oyunları getir
export async function GET() {
  try {
    await dbConnect();
    const games = await Game.find({}).sort({ createdAt: -1 });
    return NextResponse.json(games);
  } catch (error) {
    console.error("Get games error:", error);
    return NextResponse.json({ error: "Oyunlar yüklenirken hata oluştu" }, { status: 500 });
  }
}

// Yeni oyun oluştur (sadece admin)
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token");

    if (!token) {
      return NextResponse.json({ error: "Yetkiniz yok" }, { status: 401 });
    }

    await dbConnect();

    const data = await request.json();
    const game = await Game.create({
      icon: data.icon,
      imageUrl: data.imageUrl,
      name: data.name,
      desc: data.desc,
      sections: data.sections || [],
      clickCount: 0,
    });

    return NextResponse.json(game, { status: 201 });
  } catch (error) {
    console.error("Create game error:", error);
    return NextResponse.json({ error: "Oyun oluşturulurken hata oluştu" }, { status: 500 });
  }
}
