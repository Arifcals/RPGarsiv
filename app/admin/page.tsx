"use client";

import { useEffect, useState, JSX } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Plus,
  Edit,
  Trash2,
  LogOut,
  Moon,
  Sun,
  ChevronDown,
  ChevronRight,
  Upload,
  X,
  ImagePlus,
  Info,
} from "lucide-react";
import { uploadImage, deleteImage } from "@/lib/uploadImage";

interface SectionImage {
  url: string;
}

interface SectionCallout {
  type: "info" | "warn" | "note";
  title: string;
  text: string;
}

interface Section {
  _id?: string;
  title: string;
  content: string;
  images?: SectionImage[];
  callouts?: SectionCallout[];
  subsections?: Section[];
}

interface Game {
  _id: string;
  icon?: string;
  imageUrl?: string;
  name: string;
  desc?: string;
  sections: Section[];
  clickCount: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);

  // Yeni oyun form
  const [newGameOpen, setNewGameOpen] = useState(false);
  const [newGameIcon, setNewGameIcon] = useState("🎮");
  const [newGameName, setNewGameName] = useState("");
  const [newGameDesc, setNewGameDesc] = useState("");
  const [newGameImage, setNewGameImage] = useState<File | null>(null);
  const [newGameImagePreview, setNewGameImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  // Düzenleme form
  const [editOpen, setEditOpen] = useState(false);
  const [editIcon, setEditIcon] = useState("");
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string>("");
  const [editImageUrl, setEditImageUrl] = useState<string>("");

  // Bölüm ekleme
  const [sectionOpen, setSectionOpen] = useState(false);
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionContent, setSectionContent] = useState("");
  const [parentSectionPath, setParentSectionPath] = useState<number[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Bölüm düzenleme
  const [editSectionOpen, setEditSectionOpen] = useState(false);
  const [editingSectionPath, setEditingSectionPath] = useState<number[]>([]);

  // Bölüm görselleri
  const [sectionImages, setSectionImages] = useState<SectionImage[]>([]);
  const [pendingImageFiles, setPendingImageFiles] = useState<File[]>([]);
  const [imageUploading, setImageUploading] = useState(false);

  // Bölüm bilgi kutuları
  const [sectionCallouts, setSectionCallouts] = useState<SectionCallout[]>([]);
  const [newCalloutType, setNewCalloutType] = useState<"info" | "warn" | "note">("info");
  const [newCalloutTitle, setNewCalloutTitle] = useState("");
  const [newCalloutText, setNewCalloutText] = useState("");

  // Bilgi kutusu düzenleme
  const [editingCalloutIndex, setEditingCalloutIndex] = useState<number | null>(null);
  const [editCalloutType, setEditCalloutType] = useState<"info" | "warn" | "note">("info");
  const [editCalloutTitle, setEditCalloutTitle] = useState("");
  const [editCalloutText, setEditCalloutText] = useState("");

  useEffect(() => {
    checkAuth();
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else if (theme === "light") {
      setIsDark(false);
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(prefersDark);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/check");
      const data = await res.json();

      if (data.authenticated) {
        setAuthenticated(true);
        fetchGames();
      } else {
        router.push("/login");
      }
    } catch (error) {
      router.push("/login");
    }
  };

  const fetchGames = async () => {
    try {
      const res = await fetch("/api/games");
      const data = await res.json();
      setGames(data);

      // Seçili oyunu güncelle
      if (selectedGame) {
        const updatedSelected = data.find((g: Game) => g._id === selectedGame._id);
        if (updatedSelected) {
          console.log("Updating selectedGame:", updatedSelected);
          setSelectedGame(updatedSelected);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Oyunlar yüklenirken hata:", error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  const handleCreateGame = async () => {
    try {
      setUploading(true);
      let imageUrl = "";

      // Eğer resim seçildiyse, önce yükle
      if (newGameImage) {
        imageUrl = await uploadImage(newGameImage, "games");
      }

      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          icon: newGameIcon,
          imageUrl: imageUrl || undefined,
          name: newGameName,
          desc: newGameDesc,
        }),
      });

      if (res.ok) {
        setNewGameOpen(false);
        setNewGameIcon("🎮");
        setNewGameName("");
        setNewGameDesc("");
        setNewGameImage(null);
        setNewGameImagePreview("");
        fetchGames();
      }
    } catch (error) {
      console.error("Oyun oluşturulamadı:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleEditGame = async () => {
    if (!selectedGame) return;

    try {
      setUploading(true);
      let imageUrl = editImageUrl;

      // Yeni resim seçildiyse
      if (editImage) {
        // Eski resmi sil
        if (selectedGame.imageUrl) {
          await deleteImage(selectedGame.imageUrl);
        }
        // Yeni resmi yükle
        imageUrl = await uploadImage(editImage, "games");
      }

      const res = await fetch(`/api/games/${selectedGame._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          icon: editIcon,
          imageUrl: imageUrl || undefined,
          name: editName,
          desc: editDesc,
          sections: selectedGame.sections,
        }),
      });

      if (res.ok) {
        setEditOpen(false);
        setEditImage(null);
        setEditImagePreview("");
        fetchGames();
        const updated = await res.json();
        setSelectedGame(updated);
      }
    } catch (error) {
      console.error("Oyun güncellenemedi:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    if (!confirm("Bu oyunu silmek istediğinize emin misiniz?")) return;

    try {
      const game = games.find((g) => g._id === gameId);

      // Oyunun resmini sil
      if (game?.imageUrl) {
        await deleteImage(game.imageUrl);
      }

      const res = await fetch(`/api/games/${gameId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        if (selectedGame?._id === gameId) {
          setSelectedGame(null);
        }
        fetchGames();
      }
    } catch (error) {
      console.error("Oyun silinemedi:", error);
    }
  };

  // Helper function to get section at path
  const getSectionAtPath = (sections: Section[], path: number[]): Section | null => {
    if (path.length === 0) return null;
    let current: Section = sections[path[0]];
    for (let i = 1; i < path.length; i++) {
      if (!current.subsections) return null;
      current = current.subsections[path[i]];
    }
    return current;
  };

  // Helper function to set section at path
  const setSectionAtPath = (sections: Section[], path: number[], newSection: Section): Section[] => {
    const result = JSON.parse(JSON.stringify(sections));
    if (path.length === 1) {
      result[path[0]] = newSection;
      return result;
    }
    let current = result[path[0]];
    for (let i = 1; i < path.length - 1; i++) {
      current = current.subsections[path[i]];
    }
    current.subsections[path[path.length - 1]] = newSection;
    return result;
  };

  // Helper function to add subsection at path
  const addSubsectionAtPath = (sections: Section[], path: number[], newSection: Section): Section[] => {
    const result = JSON.parse(JSON.stringify(sections));
    if (path.length === 0) {
      result.push(newSection);
      return result;
    }
    let current = result[path[0]];
    for (let i = 1; i < path.length; i++) {
      current = current.subsections[path[i]];
    }
    if (!current.subsections) {
      current.subsections = [];
    }
    current.subsections.push(newSection);
    return result;
  };

  // Helper function to delete section at path
  const deleteSectionAtPath = (sections: Section[], path: number[]): Section[] => {
    const result = JSON.parse(JSON.stringify(sections));
    if (path.length === 1) {
      result.splice(path[0], 1);
      return result;
    }
    let current = result[path[0]];
    for (let i = 1; i < path.length - 1; i++) {
      current = current.subsections[path[i]];
    }
    current.subsections.splice(path[path.length - 1], 1);
    return result;
  };

  const handleAddSection = async () => {
    if (!selectedGame) return;

    setImageUploading(true);

    try {
      // Upload pending images
      const uploadedImages: SectionImage[] = [...sectionImages];
      for (const file of pendingImageFiles) {
        const url = await uploadImage(file, "sections");
        uploadedImages.push({ url });
      }

      const newSection: Section = {
        title: sectionTitle,
        content: sectionContent,
        images: uploadedImages.length > 0 ? uploadedImages : undefined,
        callouts: sectionCallouts.length > 0 ? sectionCallouts : undefined,
        subsections: [],
      };

      const updatedSections = addSubsectionAtPath(selectedGame.sections, parentSectionPath, newSection);

      console.log("Updated sections:", JSON.stringify(updatedSections, null, 2));

      const res = await fetch(`/api/games/${selectedGame._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...selectedGame,
          sections: updatedSections,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        console.log("API response:", JSON.stringify(updated, null, 2));

        // State'i güncelle
        setSelectedGame(updated);

        // Oyun listesini de güncelle
        setGames((prevGames) => prevGames.map((g) => (g._id === updated._id ? updated : g)));

        // Form'u temizle
        setSectionOpen(false);
        setSectionTitle("");
        setSectionContent("");
        setParentSectionPath([]);
        setSectionImages([]);
        setPendingImageFiles([]);
        setSectionCallouts([]);
        setNewCalloutTitle("");
        setNewCalloutText("");
        setEditingCalloutIndex(null);
        setEditCalloutType("info");
        setEditCalloutTitle("");
        setEditCalloutText("");
      }
    } catch (error) {
      console.error("Bölüm eklenemedi:", error);
    } finally {
      setImageUploading(false);
    }
  };

  const handleEditSection = async () => {
    if (!selectedGame || editingSectionPath.length === 0) return;

    setImageUploading(true);

    try {
      const existingSection = getSectionAtPath(selectedGame.sections, editingSectionPath);

      // Delete removed images from existing section
      if (existingSection?.images) {
        for (const img of existingSection.images) {
          if (!sectionImages.find((si) => si.url === img.url)) {
            await deleteImage(img.url);
          }
        }
      }

      // Upload new pending images
      const uploadedImages: SectionImage[] = [...sectionImages];
      for (const file of pendingImageFiles) {
        const url = await uploadImage(file, "sections");
        uploadedImages.push({ url });
      }

      const updatedSection: Section = {
        title: sectionTitle,
        content: sectionContent,
        images: uploadedImages.length > 0 ? uploadedImages : undefined,
        callouts: sectionCallouts.length > 0 ? sectionCallouts : undefined,
        subsections: existingSection?.subsections || [],
      };

      const updatedSections = setSectionAtPath(selectedGame.sections, editingSectionPath, updatedSection);

      const res = await fetch(`/api/games/${selectedGame._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...selectedGame,
          sections: updatedSections,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setSelectedGame(updated);
        setGames((prevGames) => prevGames.map((g) => (g._id === updated._id ? updated : g)));

        // Form'u temizle
        setEditSectionOpen(false);
        setSectionTitle("");
        setSectionContent("");
        setEditingSectionPath([]);
        setSectionImages([]);
        setPendingImageFiles([]);
        setSectionCallouts([]);
        setNewCalloutTitle("");
        setNewCalloutText("");
        setEditingCalloutIndex(null);
        setEditCalloutType("info");
        setEditCalloutTitle("");
        setEditCalloutText("");
      }
    } catch (error) {
      console.error("Bölüm düzenlenemedi:", error);
    } finally {
      setImageUploading(false);
    }
  };

  const handleDeleteSectionAtPath = async (path: number[]) => {
    if (!selectedGame) return;
    if (!confirm("Bu bölümü silmek istediğinize emin misiniz?")) return;

    const updatedSections = deleteSectionAtPath(selectedGame.sections, path);

    try {
      const res = await fetch(`/api/games/${selectedGame._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...selectedGame,
          sections: updatedSections,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setSelectedGame(updated);
        fetchGames();
      }
    } catch (error) {
      console.error("Bölüm silinemedi:", error);
    }
  };

  // Recursive section renderer
  const renderSection = (section: Section, path: number[], depth: number): JSX.Element => {
    const sectionKey = path.join("-");
    const isExpanded = expandedSections.has(sectionKey);
    const indentStyle = depth > 0 ? { marginLeft: `${depth * 12}px` } : {};

    return (
      <div
        key={sectionKey}
        className={`border border-border rounded-lg ${depth > 0 ? "bg-secondary/10" : ""}`}
        style={indentStyle}
      >
        <div className="p-3">
          <div className="flex items-start justify-between">
            <button
              onClick={() => {
                setExpandedSections((prev) => {
                  const newSet = new Set(prev);
                  if (newSet.has(sectionKey)) {
                    newSet.delete(sectionKey);
                  } else {
                    newSet.add(sectionKey);
                  }
                  return newSet;
                });
              }}
              className="flex items-center gap-2 flex-1 text-left hover:opacity-80 transition-opacity"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0" />
              )}
              <div className="flex-1">
                <h4 className={`font-medium ${depth > 0 ? "text-sm" : ""}`}>{section.title}</h4>
                {!isExpanded && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {section.content.substring(0, 100)}...
                  </p>
                )}
              </div>
            </button>
            <div className="flex gap-1 ml-2">
              <Button
                size="sm"
                variant="outline"
                title="Alt bölüm ekle"
                onClick={() => {
                  setParentSectionPath(path);
                  setSectionTitle("");
                  setSectionContent("");
                  setSectionImages([]);
                  setPendingImageFiles([]);
                  setSectionCallouts([]);
                  setNewCalloutTitle("");
                  setNewCalloutText("");
                  setEditingCalloutIndex(null);
                  setEditCalloutType("info");
                  setEditCalloutTitle("");
                  setEditCalloutText("");
                  setSectionOpen(true);
                }}
              >
                <Plus className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                title="Düzenle"
                onClick={() => {
                  setSectionTitle(section.title);
                  setSectionContent(section.content);
                  setSectionImages(section.images || []);
                  setPendingImageFiles([]);
                  setSectionCallouts(section.callouts || []);
                  setNewCalloutTitle("");
                  setNewCalloutText("");
                  setEditingCalloutIndex(null);
                  setEditCalloutType("info");
                  setEditCalloutTitle("");
                  setEditCalloutText("");
                  setEditingSectionPath(path);
                  setEditSectionOpen(true);
                }}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" title="Sil" onClick={() => handleDeleteSectionAtPath(path)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
        {isExpanded && (
          <div className="px-3 pb-3 border-t border-border">
            {/* Başta görseller */}
            {/* Görseller listesi */}
            {section.images && section.images.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {section.images.map((img, idx) => (
                  <div key={idx} className="relative">
                    <img src={img.url} alt="" className="h-16 max-w-32 rounded-lg object-cover border border-border" />
                    <span className="absolute -top-1 -left-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line">{section.content}</p>
            {section.callouts && section.callouts.length > 0 && (
              <div className="mt-2 space-y-1">
                {section.callouts.map((callout, idx) => (
                  <div key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="bg-primary text-primary-foreground w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    📌 {callout.type} - {callout.title}: {callout.text}
                  </div>
                ))}
              </div>
            )}
            {section.subsections && section.subsections.length > 0 && (
              <div className="mt-3 space-y-2">
                <div className="text-xs font-semibold text-muted-foreground">
                  Alt Bölümler ({section.subsections.length}):
                </div>
                {section.subsections.map((subsection, subIdx) =>
                  renderSection(subsection, [...path, subIdx], depth + 1),
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (!authenticated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-400 mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Admin Paneli</h1>
            <p className="text-sm text-muted-foreground mt-1">Oyunları ve bölümleri yönetin</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={toggleTheme} className="rounded-full">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="rounded-full">
              <LogOut className="h-4 w-4" />
              Çıkış
            </Button>
            <Button size="sm" asChild className=" rounded-full border border-primary">
              <a href="/">Ana Sayfa</a>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
          {/* Sidebar */}
          <aside>
            <div className="bg-card border border-border rounded-2xl shadow-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold">Oyunlar</h2>
                <Dialog open={newGameOpen} onOpenChange={setNewGameOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Yeni Oyun Ekle</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>İkon (Emoji - Opsiyonel)</Label>
                        <details className="group">
                          <summary className="cursor-pointer list-none">
                            <div className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                              <span className="text-2xl">{newGameIcon || "🎮"}</span>
                              <span className="text-sm text-muted-foreground">Emoji seç veya yaz</span>
                            </div>
                          </summary>
                          <div className="mt-2 p-3 border border-border rounded-lg bg-secondary/20">
                            <div className="flex gap-2 mb-2 flex-wrap">
                              {["🎮", "🎯", "⚔️", "🎲", "🎰", "📚", "🔮", "⭐", "💎", "👑"].map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => setNewGameIcon(emoji)}
                                  className={`text-2xl p-2 rounded-lg border-2 transition-all hover:scale-110 ${
                                    newGameIcon === emoji
                                      ? "border-primary bg-primary/10"
                                      : "border-border hover:border-primary/50"
                                  }`}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                            <Input
                              value={newGameIcon}
                              onChange={(e) => setNewGameIcon(e.target.value)}
                              placeholder="🎮"
                              className="text-center"
                            />
                          </div>
                        </details>
                      </div>
                      <div>
                        <Label>Oyun Adı</Label>
                        <Input
                          value={newGameName}
                          onChange={(e) => setNewGameName(e.target.value)}
                          placeholder="Oyun adını girin"
                        />
                      </div>
                      <div>
                        <Label>Açıklama</Label>
                        <Textarea
                          value={newGameDesc}
                          onChange={(e) => setNewGameDesc(e.target.value)}
                          placeholder="Kısa açıklama"
                        />
                      </div>
                      <div>
                        <Label>Oyun Görseli (Opsiyonel)</Label>
                        <div className="space-y-2">
                          {newGameImagePreview && (
                            <div className="relative w-full h-40 rounded-lg overflow-hidden border border-border">
                              <img src={newGameImagePreview} alt="Preview" className="w-full h-full object-cover" />
                              <button
                                onClick={() => {
                                  setNewGameImage(null);
                                  setNewGameImagePreview("");
                                }}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setNewGameImage(file);
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setNewGameImagePreview(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <p className="text-xs text-muted-foreground">
                            Resim yüklerseniz ikon yerine resim gösterilir
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={handleCreateGame}
                        disabled={uploading}
                        className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg border-2 border-primary"
                      >
                        {uploading ? "Yükleniyor..." : "Oluştur"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-2">
                {games.map((game) => (
                  <div
                    key={game._id}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedGame?._id === game._id
                        ? "bg-primary/10 border-primary/35"
                        : "hover:bg-secondary/50 border-transparent"
                    }`}
                    onClick={() => setSelectedGame(game)}
                  >
                    <div className="flex items-start gap-2">
                      <div className="text-xl w-9 h-9 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0 overflow-hidden">
                        {game.imageUrl ? (
                          <img src={game.imageUrl} alt={game.name} className="w-full h-full object-cover" />
                        ) : (
                          game.icon
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{game.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {game.sections.length} bölüm • {game.clickCount} görüntülenme
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGame(game._id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main>
            {selectedGame ? (
              <div className="bg-card border border-border rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedGame.name}</h2>
                    <p className="text-sm text-muted-foreground">{selectedGame.desc}</p>
                  </div>
                  <div className="flex gap-2">
                    <Dialog open={editOpen} onOpenChange={setEditOpen}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditIcon(selectedGame.icon || "");
                            setEditName(selectedGame.name);
                            setEditDesc(selectedGame.desc || "");
                            setEditImageUrl(selectedGame.imageUrl || "");
                            setEditImagePreview(selectedGame.imageUrl || "");
                            setEditImage(null);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                          Düzenle
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Oyunu Düzenle</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>İkon (Opsiyonel)</Label>
                            <details className="group">
                              <summary className="cursor-pointer list-none">
                                <div className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                                  <span className="text-2xl">{editIcon || "🎮"}</span>
                                  <span className="text-sm text-muted-foreground">Emoji seç veya yaz</span>
                                </div>
                              </summary>
                              <div className="mt-2 p-3 border border-border rounded-lg bg-secondary/20">
                                <div className="flex gap-2 mb-2 flex-wrap">
                                  {["🎮", "🎯", "⚔️", "🎲", "🎰", "📚", "🔮", "⭐", "💎", "👑"].map((emoji) => (
                                    <button
                                      key={emoji}
                                      type="button"
                                      onClick={() => setEditIcon(emoji)}
                                      className={`text-2xl p-2 rounded-lg border-2 transition-all hover:scale-110 ${
                                        editIcon === emoji
                                          ? "border-primary bg-primary/10"
                                          : "border-border hover:border-primary/50"
                                      }`}
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                                <Input
                                  value={editIcon}
                                  onChange={(e) => setEditIcon(e.target.value)}
                                  className="text-center"
                                />
                              </div>
                            </details>
                          </div>
                          <div>
                            <Label>Ad</Label>
                            <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                          </div>
                          <div>
                            <Label>Açıklama</Label>
                            <Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
                          </div>
                          <div>
                            <Label>Oyun Görseli (Opsiyonel)</Label>
                            <div className="space-y-2">
                              {editImagePreview && (
                                <div className="relative w-full h-40 rounded-lg overflow-hidden border border-border">
                                  <img src={editImagePreview} alt="Preview" className="w-full h-full object-cover" />
                                  <button
                                    onClick={() => {
                                      setEditImage(null);
                                      setEditImagePreview("");
                                      setEditImageUrl("");
                                    }}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              )}
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setEditImage(file);
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      setEditImagePreview(reader.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                              <p className="text-xs text-muted-foreground">
                                Resim yüklerseniz ikon yerine resim gösterilir
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={handleEditGame}
                            disabled={uploading}
                            className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg border-2 border-primary"
                          >
                            {uploading ? "Yükleniyor..." : "Kaydet"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog
                      open={sectionOpen}
                      onOpenChange={(open) => {
                        setSectionOpen(open);
                        if (!open) {
                          setParentSectionPath([]);
                          setSectionImages([]);
                          setPendingImageFiles([]);
                          setSectionCallouts([]);
                          setNewCalloutType("info");
                          setNewCalloutTitle("");
                          setNewCalloutText("");
                          setEditingCalloutIndex(null);
                          setEditCalloutType("info");
                          setEditCalloutTitle("");
                          setEditCalloutText("");
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          onClick={() => {
                            setParentSectionPath([]);
                            setSectionTitle("");
                            setSectionContent("");
                            setSectionCallouts([]);
                            setNewCalloutType("info");
                            setNewCalloutTitle("");
                            setNewCalloutText("");
                            setEditingCalloutIndex(null);
                            setEditCalloutType("info");
                            setEditCalloutTitle("");
                            setEditCalloutText("");
                            setSectionImages([]);
                            setPendingImageFiles([]);
                          }}
                          className="border border-primary"
                        >
                          <Plus className="h-4 w-4" />
                          Bölüm Ekle
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            {parentSectionPath.length > 0 ? "Yeni Alt Bölüm Ekle" : "Yeni Bölüm Ekle"}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Bölüm Başlığı</Label>
                            <Input
                              value={sectionTitle}
                              onChange={(e) => setSectionTitle(e.target.value)}
                              placeholder="Örn: Giriş, Temel Kavramlar"
                            />
                          </div>
                          <div>
                            <Label>İçerik</Label>
                            <Textarea
                              id="sectionContentAdd"
                              value={sectionContent}
                              onChange={(e) => setSectionContent(e.target.value)}
                              placeholder="Bölüm içeriğini buraya yazın... Resim için [resim:1], kutu için [kutu:1] yazın"
                              className="min-h-50"
                            />
                          </div>
                          {/* Bilgi Kutuları */}
                          <div className="space-y-3 p-4 border border-border rounded-lg">
                            <div className="flex items-center justify-between">
                              <Label className="flex items-center gap-2">
                                <Info className="h-4 w-4" />
                                Bilgi Kutuları
                              </Label>
                            </div>

                            {/* Mevcut kutular */}
                            {sectionCallouts.length > 0 && (
                              <div className="space-y-2">
                                {sectionCallouts.map((callout, idx) => (
                                  <div key={idx}>
                                    {editingCalloutIndex === idx ? (
                                      /* Düzenleme modu */
                                      <div className="space-y-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                                        <div className="grid grid-cols-3 gap-2">
                                          <select
                                            value={editCalloutType}
                                            onChange={(e) =>
                                              setEditCalloutType(e.target.value as "info" | "warn" | "note")
                                            }
                                            className="h-9 rounded-md border border-input bg-card text-foreground px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring [&>option]:bg-white [&>option]:text-black dark:[&>option]:bg-gray-900 dark:[&>option]:text-white"
                                          >
                                            <option value="info">Bilgi</option>
                                            <option value="warn">Uyarı</option>
                                            <option value="note">Not</option>
                                          </select>
                                          <Input
                                            value={editCalloutTitle}
                                            onChange={(e) => setEditCalloutTitle(e.target.value)}
                                            placeholder="Başlık"
                                            className="col-span-2"
                                          />
                                        </div>
                                        <Textarea
                                          value={editCalloutText}
                                          onChange={(e) => setEditCalloutText(e.target.value)}
                                          placeholder="Kutu içeriği"
                                          className="min-h-16"
                                        />
                                        <div className="flex gap-2">
                                          <Button
                                            type="button"
                                            size="sm"
                                            onClick={() => {
                                              if (editCalloutTitle.trim() && editCalloutText.trim()) {
                                                setSectionCallouts((prev) =>
                                                  prev.map((c, i) =>
                                                    i === idx
                                                      ? {
                                                          type: editCalloutType,
                                                          title: editCalloutTitle,
                                                          text: editCalloutText,
                                                        }
                                                      : c,
                                                  ),
                                                );
                                                setEditingCalloutIndex(null);
                                                setEditCalloutType("info");
                                                setEditCalloutTitle("");
                                                setEditCalloutText("");
                                              }
                                            }}
                                            className="flex-1"
                                          >
                                            Kaydet
                                          </Button>
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                              setEditingCalloutIndex(null);
                                              setEditCalloutType("info");
                                              setEditCalloutTitle("");
                                              setEditCalloutText("");
                                            }}
                                          >
                                            İptal
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      /* Görüntüleme modu */
                                      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                                        <span className="bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                          {idx + 1}
                                        </span>
                                        <span
                                          className={`text-xs px-2 py-0.5 rounded ${
                                            callout.type === "info"
                                              ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                                              : callout.type === "warn"
                                                ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                                                : "bg-green-500/20 text-green-600 dark:text-green-400"
                                          }`}
                                        >
                                          {callout.type === "info"
                                            ? "Bilgi"
                                            : callout.type === "warn"
                                              ? "Uyarı"
                                              : "Not"}
                                        </span>
                                        <span className="text-sm flex-1 truncate">{callout.title}</span>
                                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">[kutu:{idx + 1}]</code>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            const textarea = document.getElementById(
                                              "sectionContentAdd",
                                            ) as HTMLTextAreaElement;
                                            if (textarea) {
                                              const pos = textarea.selectionStart;
                                              const text = sectionContent;
                                              setSectionContent(
                                                text.slice(0, pos) + `[kutu:${idx + 1}]` + text.slice(pos),
                                              );
                                            }
                                          }}
                                          className="h-6 px-2 text-xs"
                                        >
                                          Ekle
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            setEditingCalloutIndex(idx);
                                            setEditCalloutType(callout.type);
                                            setEditCalloutTitle(callout.title);
                                            setEditCalloutText(callout.text);
                                          }}
                                          className="h-6 w-6 p-0"
                                          title="Düzenle"
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => setSectionCallouts((prev) => prev.filter((_, i) => i !== idx))}
                                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Yeni kutu ekleme */}
                            <div className="space-y-2 pt-2 border-t border-border">
                              <div className="grid grid-cols-3 gap-2">
                                <select
                                  value={newCalloutType}
                                  onChange={(e) => setNewCalloutType(e.target.value as "info" | "warn" | "note")}
                                  className="h-9 rounded-md border border-input bg-card text-foreground px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring [&>option]:bg-white [&>option]:text-black dark:[&>option]:bg-gray-900 dark:[&>option]:text-white"
                                >
                                  <option value="info">Bilgi</option>
                                  <option value="warn">Uyarı</option>
                                  <option value="note">Not</option>
                                </select>
                                <Input
                                  value={newCalloutTitle}
                                  onChange={(e) => setNewCalloutTitle(e.target.value)}
                                  placeholder="Başlık"
                                  className="col-span-2"
                                />
                              </div>
                              <Textarea
                                value={newCalloutText}
                                onChange={(e) => setNewCalloutText(e.target.value)}
                                placeholder="Kutu içeriği"
                                className="min-h-16"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (newCalloutTitle.trim() && newCalloutText.trim()) {
                                    setSectionCallouts((prev) => [
                                      ...prev,
                                      {
                                        type: newCalloutType,
                                        title: newCalloutTitle,
                                        text: newCalloutText,
                                      },
                                    ]);
                                    setNewCalloutType("info");
                                    setNewCalloutTitle("");
                                    setNewCalloutText("");
                                  }
                                }}
                                className="w-full"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Kutu Ekle
                              </Button>
                            </div>
                          </div>

                          {/* Görsel Ekleme */}
                          <div className="space-y-3 p-4 border border-border rounded-lg">
                            <div className="flex items-center justify-between">
                              <Label className="flex items-center gap-2">
                                <ImagePlus className="h-4 w-4" />
                                Görseller
                              </Label>
                            </div>

                            {/* Mevcut ve bekleyen görseller */}
                            {(sectionImages.length > 0 || pendingImageFiles.length > 0) && (
                              <div className="grid grid-cols-3 gap-2">
                                {sectionImages.map((img, idx) => (
                                  <div key={`existing-${idx}`} className="relative group">
                                    <img
                                      src={img.url}
                                      alt={`Görsel ${idx + 1}`}
                                      className="w-full h-20 object-cover rounded-lg border border-border"
                                    />
                                    <span className="absolute -top-1.5 -left-1.5 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                      {idx + 1}
                                    </span>
                                    <button
                                      onClick={() => setSectionImages((prev) => prev.filter((_, i) => i !== idx))}
                                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        const textarea = document.getElementById(
                                          "sectionContentAdd",
                                        ) as HTMLTextAreaElement;
                                        if (textarea) {
                                          const cursorPos = textarea.selectionStart;
                                          const textBefore = sectionContent.substring(0, cursorPos);
                                          const textAfter = sectionContent.substring(cursorPos);
                                          setSectionContent(textBefore + `[resim:${idx + 1}]` + textAfter);
                                        } else {
                                          setSectionContent(sectionContent + `[resim:${idx + 1}]`);
                                        }
                                      }}
                                      className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded hover:bg-black/90"
                                    >
                                      Ekle
                                    </button>
                                  </div>
                                ))}
                                {pendingImageFiles.map((file, idx) => (
                                  <div key={`pending-${idx}`} className="relative group">
                                    <img
                                      src={URL.createObjectURL(file)}
                                      alt={`Yeni Görsel ${idx + 1}`}
                                      className="w-full h-20 object-cover rounded-lg border border-dashed border-primary"
                                    />
                                    <span className="absolute -top-1.5 -left-1.5 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                      {sectionImages.length + idx + 1}
                                    </span>
                                    <button
                                      onClick={() => setPendingImageFiles((prev) => prev.filter((_, i) => i !== idx))}
                                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        const newNum = sectionImages.length + idx + 1;
                                        const textarea = document.getElementById(
                                          "sectionContentAdd",
                                        ) as HTMLTextAreaElement;
                                        if (textarea) {
                                          const cursorPos = textarea.selectionStart;
                                          const textBefore = sectionContent.substring(0, cursorPos);
                                          const textAfter = sectionContent.substring(cursorPos);
                                          setSectionContent(textBefore + `[resim:${newNum}]` + textAfter);
                                        } else {
                                          setSectionContent(sectionContent + `[resim:${newNum}]`);
                                        }
                                      }}
                                      className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded hover:bg-black/90"
                                    >
                                      Ekle
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Yeni görsel ekle */}
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setPendingImageFiles((prev) => [...prev, file]);
                                  e.target.value = "";
                                }
                              }}
                            />
                            <p className="text-xs text-muted-foreground">
                              İçerikte resim göstermek istediğiniz yere{" "}
                              <code className="bg-secondary px-1 rounded">[resim:1]</code> yazın. Her resmin üzerindeki
                              numarayı kullanın.
                            </p>
                          </div>

                          <Button
                            onClick={handleAddSection}
                            disabled={imageUploading}
                            className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg border-2 border-primary"
                          >
                            {imageUploading ? "Yükleniyor..." : "Bölümü Ekle"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Bölüm Düzenleme Dialog */}
                    <Dialog
                      open={editSectionOpen}
                      onOpenChange={(open) => {
                        setEditSectionOpen(open);
                        if (!open) {
                          setSectionImages([]);
                          setPendingImageFiles([]);
                          setEditingSectionPath([]);
                          setSectionCallouts([]);
                          setNewCalloutType("info");
                          setNewCalloutTitle("");
                          setNewCalloutText("");
                          setEditingCalloutIndex(null);
                          setEditCalloutType("info");
                          setEditCalloutTitle("");
                          setEditCalloutText("");
                        }
                      }}
                    >
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            {editingSectionPath.length > 1 ? "Alt Bölümü Düzenle" : "Bölümü Düzenle"}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Bölüm Başlığı</Label>
                            <Input
                              value={sectionTitle}
                              onChange={(e) => setSectionTitle(e.target.value)}
                              placeholder="Örn: Giriş, Temel Kavramlar"
                            />
                          </div>
                          <div>
                            <Label>İçerik</Label>
                            <Textarea
                              id="sectionContentEdit"
                              value={sectionContent}
                              onChange={(e) => setSectionContent(e.target.value)}
                              placeholder="Bölüm içeriğini buraya yazın... Resim için [resim:1], kutu için [kutu:1] yazın"
                              className="min-h-50"
                            />
                          </div>
                          {/* Bilgi Kutuları */}
                          <div className="space-y-3 p-4 border border-border rounded-lg">
                            <div className="flex items-center justify-between">
                              <Label className="flex items-center gap-2">
                                <Info className="h-4 w-4" />
                                Bilgi Kutuları
                              </Label>
                            </div>

                            {/* Mevcut kutular */}
                            {sectionCallouts.length > 0 && (
                              <div className="space-y-2">
                                {sectionCallouts.map((callout, idx) => (
                                  <div key={idx}>
                                    {editingCalloutIndex === idx ? (
                                      /* Düzenleme modu */
                                      <div className="space-y-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                                        <div className="grid grid-cols-3 gap-2">
                                          <select
                                            value={editCalloutType}
                                            onChange={(e) =>
                                              setEditCalloutType(e.target.value as "info" | "warn" | "note")
                                            }
                                            className="h-9 rounded-md border border-input bg-card text-foreground px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring [&>option]:bg-white [&>option]:text-black dark:[&>option]:bg-gray-900 dark:[&>option]:text-white"
                                          >
                                            <option value="info">Bilgi</option>
                                            <option value="warn">Uyarı</option>
                                            <option value="note">Not</option>
                                          </select>
                                          <Input
                                            value={editCalloutTitle}
                                            onChange={(e) => setEditCalloutTitle(e.target.value)}
                                            placeholder="Başlık"
                                            className="col-span-2"
                                          />
                                        </div>
                                        <Textarea
                                          value={editCalloutText}
                                          onChange={(e) => setEditCalloutText(e.target.value)}
                                          placeholder="Kutu içeriği"
                                          className="min-h-16"
                                        />
                                        <div className="flex gap-2">
                                          <Button
                                            type="button"
                                            size="sm"
                                            onClick={() => {
                                              if (editCalloutTitle.trim() && editCalloutText.trim()) {
                                                setSectionCallouts((prev) =>
                                                  prev.map((c, i) =>
                                                    i === idx
                                                      ? {
                                                          type: editCalloutType,
                                                          title: editCalloutTitle,
                                                          text: editCalloutText,
                                                        }
                                                      : c,
                                                  ),
                                                );
                                                setEditingCalloutIndex(null);
                                                setEditCalloutType("info");
                                                setEditCalloutTitle("");
                                                setEditCalloutText("");
                                              }
                                            }}
                                            className="flex-1 border"
                                          >
                                            Kaydet
                                          </Button>
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                              setEditingCalloutIndex(null);
                                              setEditCalloutType("info");
                                              setEditCalloutTitle("");
                                              setEditCalloutText("");
                                            }}
                                          >
                                            İptal
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      /* Görüntüleme modu */
                                      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                                        <span className="bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                          {idx + 1}
                                        </span>
                                        <span
                                          className={`text-xs px-2 py-0.5 rounded ${
                                            callout.type === "info"
                                              ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                                              : callout.type === "warn"
                                                ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                                                : "bg-green-500/20 text-green-600 dark:text-green-400"
                                          }`}
                                        >
                                          {callout.type === "info"
                                            ? "Bilgi"
                                            : callout.type === "warn"
                                              ? "Uyarı"
                                              : "Not"}
                                        </span>
                                        <span className="text-sm flex-1 truncate">{callout.title}</span>
                                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">[kutu:{idx + 1}]</code>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            const textarea = document.getElementById(
                                              "sectionContentEdit",
                                            ) as HTMLTextAreaElement;
                                            if (textarea) {
                                              const pos = textarea.selectionStart;
                                              const text = sectionContent;
                                              setSectionContent(
                                                text.slice(0, pos) + `[kutu:${idx + 1}]` + text.slice(pos),
                                              );
                                            }
                                          }}
                                          className="h-6 px-2 text-xs"
                                        >
                                          Ekle
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            setEditingCalloutIndex(idx);
                                            setEditCalloutType(callout.type);
                                            setEditCalloutTitle(callout.title);
                                            setEditCalloutText(callout.text);
                                          }}
                                          className="h-6 w-6 p-0"
                                          title="Düzenle"
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => setSectionCallouts((prev) => prev.filter((_, i) => i !== idx))}
                                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Yeni kutu ekleme */}
                            <div className="space-y-2 pt-2 border-t border-border">
                              <div className="grid grid-cols-3 gap-2">
                                <select
                                  value={newCalloutType}
                                  onChange={(e) => setNewCalloutType(e.target.value as "info" | "warn" | "note")}
                                  className="h-9 rounded-md border border-input bg-card text-foreground px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring [&>option]:bg-white [&>option]:text-black dark:[&>option]:bg-gray-900 dark:[&>option]:text-white"
                                >
                                  <option value="info">Bilgi</option>
                                  <option value="warn">Uyarı</option>
                                  <option value="note">Not</option>
                                </select>
                                <Input
                                  value={newCalloutTitle}
                                  onChange={(e) => setNewCalloutTitle(e.target.value)}
                                  placeholder="Başlık"
                                  className="col-span-2"
                                />
                              </div>
                              <Textarea
                                value={newCalloutText}
                                onChange={(e) => setNewCalloutText(e.target.value)}
                                placeholder="Kutu içeriği"
                                className="min-h-16"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (newCalloutTitle.trim() && newCalloutText.trim()) {
                                    setSectionCallouts((prev) => [
                                      ...prev,
                                      {
                                        type: newCalloutType,
                                        title: newCalloutTitle,
                                        text: newCalloutText,
                                      },
                                    ]);
                                    setNewCalloutType("info");
                                    setNewCalloutTitle("");
                                    setNewCalloutText("");
                                  }
                                }}
                                className="w-full"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Kutu Ekle
                              </Button>
                            </div>
                          </div>

                          {/* Görsel Ekleme */}
                          <div className="space-y-3 p-4 border border-border rounded-lg">
                            <div className="flex items-center justify-between">
                              <Label className="flex items-center gap-2">
                                <ImagePlus className="h-4 w-4" />
                                Görseller
                              </Label>
                            </div>

                            {/* Mevcut ve bekleyen görseller */}
                            {(sectionImages.length > 0 || pendingImageFiles.length > 0) && (
                              <div className="grid grid-cols-3 gap-2">
                                {sectionImages.map((img, idx) => (
                                  <div key={`existing-${idx}`} className="relative group">
                                    <img
                                      src={img.url}
                                      alt={`Görsel ${idx + 1}`}
                                      className="w-full h-20 object-cover rounded-lg border border-border"
                                    />
                                    <span className="absolute -top-1.5 -left-1.5 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                      {idx + 1}
                                    </span>
                                    <button
                                      onClick={() => setSectionImages((prev) => prev.filter((_, i) => i !== idx))}
                                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        const textarea = document.getElementById(
                                          "sectionContentEdit",
                                        ) as HTMLTextAreaElement;
                                        if (textarea) {
                                          const cursorPos = textarea.selectionStart;
                                          const textBefore = sectionContent.substring(0, cursorPos);
                                          const textAfter = sectionContent.substring(cursorPos);
                                          setSectionContent(textBefore + `[resim:${idx + 1}]` + textAfter);
                                        } else {
                                          setSectionContent(sectionContent + `[resim:${idx + 1}]`);
                                        }
                                      }}
                                      className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded hover:bg-black/90"
                                    >
                                      Ekle
                                    </button>
                                  </div>
                                ))}
                                {pendingImageFiles.map((file, idx) => (
                                  <div key={`pending-${idx}`} className="relative group">
                                    <img
                                      src={URL.createObjectURL(file)}
                                      alt={`Yeni Görsel ${idx + 1}`}
                                      className="w-full h-20 object-cover rounded-lg border border-dashed border-primary"
                                    />
                                    <span className="absolute -top-1.5 -left-1.5 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                      {sectionImages.length + idx + 1}
                                    </span>
                                    <button
                                      onClick={() => setPendingImageFiles((prev) => prev.filter((_, i) => i !== idx))}
                                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        const newNum = sectionImages.length + idx + 1;
                                        const textarea = document.getElementById(
                                          "sectionContentEdit",
                                        ) as HTMLTextAreaElement;
                                        if (textarea) {
                                          const cursorPos = textarea.selectionStart;
                                          const textBefore = sectionContent.substring(0, cursorPos);
                                          const textAfter = sectionContent.substring(cursorPos);
                                          setSectionContent(textBefore + `[resim:${newNum}]` + textAfter);
                                        } else {
                                          setSectionContent(sectionContent + `[resim:${newNum}]`);
                                        }
                                      }}
                                      className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded hover:bg-black/90"
                                    >
                                      Ekle
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Yeni görsel ekle */}
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setPendingImageFiles((prev) => [...prev, file]);
                                  e.target.value = "";
                                }
                              }}
                            />
                            <p className="text-xs text-muted-foreground">
                              İçerikte resim göstermek istediğiniz yere{" "}
                              <code className="bg-secondary px-1 rounded">[resim:1]</code> yazın. Her resmin üzerindeki
                              numarayı kullanın.
                            </p>
                          </div>

                          <Button
                            onClick={handleEditSection}
                            disabled={imageUploading}
                            className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg border-2 border-primary"
                          >
                            {imageUploading ? "Yükleniyor..." : "Kaydet"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="space-y-4 mt-6">
                  <h3 className="font-bold text-lg">Bölümler</h3>
                  {selectedGame.sections.length > 0 ? (
                    <div className="space-y-2 max-h-150 overflow-y-auto pr-2">
                      {selectedGame.sections.map((section, idx) => renderSection(section, [idx], 0))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">Henüz bölüm eklenmemiş.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-2xl shadow-lg p-12 text-center">
                <p className="text-muted-foreground">
                  {games.length === 0
                    ? "Henüz oyun eklenmemiş. Sol panelden yeni oyun ekleyin."
                    : "Düzenlemek için bir oyun seçin."}
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
