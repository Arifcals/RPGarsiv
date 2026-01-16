import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/mongodb";
import Game from "@/models/Game";

// Tek oyun getir
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const game = await Game.findById(id);

    if (!game) {
      return NextResponse.json({ error: "Oyun bulunamadı" }, { status: 404 });
    }

    return NextResponse.json(game);
  } catch (error) {
    console.error("Get game error:", error);
    return NextResponse.json({ error: "Oyun yüklenirken hata oluştu" }, { status: 500 });
  }
}

// Oyunu güncelle (sadece admin)
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token");

    if (!token) {
      return NextResponse.json({ error: "Yetkiniz yok" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const data = await request.json();

    const game = await Game.findByIdAndUpdate(
      id,
      {
        icon: data.icon,
        imageUrl: data.imageUrl,
        name: data.name,
        desc: data.desc,
        sections: data.sections,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!game) {
      return NextResponse.json({ error: "Oyun bulunamadı" }, { status: 404 });
    }

    return NextResponse.json(game);
  } catch (error) {
    console.error("Update game error:", error);
    return NextResponse.json({ error: "Oyun güncellenirken hata oluştu" }, { status: 500 });
  }
}

// Oyunu sil (sadece admin)
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token");

    if (!token) {
      return NextResponse.json({ error: "Yetkiniz yok" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const game = await Game.findByIdAndDelete(id);

    if (!game) {
      return NextResponse.json({ error: "Oyun bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({ message: "Oyun silindi" });
  } catch (error) {
    console.error("Delete game error:", error);
    return NextResponse.json({ error: "Oyun silinirken hata oluştu" }, { status: 500 });
  }
}
