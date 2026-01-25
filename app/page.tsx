"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Eye, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["section-0"]));
  const [searchQuery, setSearchQuery] = useState("");
  const isSearching = searchQuery.trim().length > 0;


  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      setIsDark(true);
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    } else if (theme === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(prefersDark);
      if (prefersDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.add("light");
      }
    }

    fetchGames();
  }, []);

//Arama kısmı







const fetchGames = async () => {
  try {
    const res = await fetch("/api/games", {
      cache: "no-store",
    });
    const data = await res.json();

    setGames(data);

    if (data.length === 0) {
      setSelectedGame(null);
    } else if (selectedGame) {
const updated = data.find((g: Game) => g._id === selectedGame._id);
      setSelectedGame(updated || null);
    } else {
      setSelectedGame(data[0]);
    }
  } catch (error) {
    console.error("Oyunlar yüklenirken hata:", error);
    setGames([]);
    setSelectedGame(null);
  } finally {
    setLoading(false);
  }
};


  const handleGameClick = async (game: Game) => {
  setSelectedGame(game);
  setOpenSections(new Set(["section-0"]));

  try {
    await fetch(`/api/games/${game._id}/click`, { method: "POST" });

    const res = await fetch("/api/games");
    const data = await res.json();

    if (Array.isArray(data)) {
      setGames(data);
    } else {
      console.error("Click sonrası games array değil:", data);
      setGames([]);
    }
  } catch (error) {
    console.error("Tıklama kaydedilemedi:", error);
  }
};


  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
    }
  };

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getCalloutStyle = (type: string) => {
    switch (type) {
      case "info":
        return "border-l-[#10b981] dark:border-l-[#34d399] bg-gray-50 dark:bg-gray-700/30";
      case "warn":
        return "border-l-[#f59e0b] dark:border-l-[#fbbf24] bg-gray-50 dark:bg-gray-700/30";
      case "note":
        return "border-l-[#3b82f6] dark:border-l-[#60a5fa] bg-gray-50 dark:bg-gray-700/30";
      default:
        return "border-l-[#6b7280] dark:border-l-[#9ca3af] bg-gray-50 dark:bg-gray-950/30";
    }
  };

  // Render content with image markers
  const renderContentWithImages = (content: string, images?: SectionImage[], callouts?: SectionCallout[]) => {
    // Her iki marker tipini de yakala: [resim:X] ve [kutu:X]
    const parts = content.split(/(\[resim:\d+\]|\[kutu:\d+\])/g);

    if (parts.length === 1 && !parts[0].match(/\[resim:\d+\]|\[kutu:\d+\]/)) {
      // Sadece düz metin varsa
      return (
        <p className="whitespace-pre-line text-[14px] text-[#222] dark:text-[#e7e9ee] leading-[1.55]">{content}</p>
      );
    }

    return (
      <div className="text-[14px] text-[#222] dark:text-[#e7e9ee] leading-[1.55]">
        {parts.map((part, idx) => {
          // Resim marker'ı kontrolü
          const imageMatch = part.match(/\[resim:(\d+)\]/);
          if (imageMatch) {
            const imageIndex = parseInt(imageMatch[1]) - 1;
            const image = images?.[imageIndex];
            if (image) {
              return (
                <img
                  key={idx}
                  src={image.url}
                  alt=""
                  className="my-2 max-w-full max-h-80 rounded-lg border border-[#d7d7d0] dark:border-[#272d3a] cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(image.url, "_blank")}
                />
              );
            }
            return null;
          }

          // Kutu/Callout marker'ı kontrolü
          const calloutMatch = part.match(/\[kutu:(\d+)\]/);
          if (calloutMatch) {
            const calloutIndex = parseInt(calloutMatch[1]) - 1;
            const callout = callouts?.[calloutIndex];
            if (callout) {
              return (
                <div
                  key={idx}
                  className={`my-3 p-3 rounded-[10px] border border-[#d7d7d0] dark:border-[#272d3a] border-l-4 ${getCalloutStyle(
                    callout.type,
                  )}`}
                >
                  <div className="font-bold text-[11px] uppercase text-[#222] dark:text-[#e7e9ee]">{callout.title}</div>
                  <div className="text-[13px] mt-0.5 text-[#666] dark:text-[#a7adbb]">{callout.text}</div>
                </div>
              );
            }
            return null;
          }

          return part ? (
            <span key={idx} className="whitespace-pre-line">
              {part}
            </span>
          ) : null;
        })}
      </div>
    );
  };


const filterSections = (sections: Section[], query: string): Section[] => {
  const q = query.trim().toLowerCase();
  if (!q) return sections;

  return sections
    .map((section) => {
      const titleMatch = section.title.toLowerCase().includes(q);
      const contentMatch = section.content.toLowerCase().includes(q);

      const filteredSubsections = section.subsections
        ? filterSections(section.subsections, query)
        : [];

      if (titleMatch || contentMatch || filteredSubsections.length > 0) {
        return {
          ...section,
          subsections: filteredSubsections,
        };
      }

      return null;
    })
    .filter(Boolean) as Section[];
};







  // Recursive subsection renderer
  const renderSubsection = (section: Section, sectionId: string, depth: number): React.ReactNode => {
    const isOpen = openSections.has(sectionId);
    const paddingLeft = depth > 1 ? `${(depth - 1) * 8}px` : "0px";

    return (
      <div
        key={sectionId}
        className="border border-[#d7d7d0] dark:border-[#272d3a] rounded-xl bg-[#fafafa] dark:bg-[#101521] overflow-hidden"
        style={{ marginLeft: paddingLeft }}
      >
        <button
          onClick={() => toggleSection(sectionId)}
          className="w-full p-3.5 flex justify-between items-center cursor-pointer hover:bg-[rgba(0,0,0,.02)] dark:hover:bg-[rgba(255,255,255,.02)] transition-colors text-left"
        >
          <div className="font-semibold text-[14px] text-[#222] dark:text-[#e7e9ee]">{section.title}</div>
          <div
            className={`w-5.5 h-5.5 rounded-lg border border-[#d7d7d0] dark:border-[#272d3a] grid place-items-center bg-[rgba(255,255,255,.55)] dark:bg-[rgba(255,255,255,.06)] transition-transform ${
              isOpen ? "rotate-90 text-[#1f6feb] dark:text-[#6ea8ff]" : ""
            }`}
          >
            <ChevronRight className="w-3 h-3" />
          </div>
        </button>

        {isOpen && (
          <div className="px-3.5 pb-3.5">
            {renderContentWithImages(section.content, section.images, section.callouts)}

            {section.subsections && section.subsections.length > 0 && (
              <div className="mt-2.5 space-y-2.5">
                {section.subsections.map((sub, subIdx) =>
                  renderSubsection(sub, `${sectionId}-sub-${subIdx}`, depth + 1),
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center  justify-center bg-[#efefe8] dark:bg-[#0f1115]">
        <p className="text-[#666] dark:text-[#a7adbb]">Yükleniyor...</p>
      </div>
    );
  }

const visibleSections = selectedGame
  ? filterSections(selectedGame.sections, searchQuery)
  : [];



  return (
    <div className="min-h-screen bg-[#efefe8] dark:bg-[#0f1115] transition-colors">
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4.5 p-5.5 pb-15">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-4.5 lg:self-start h-fit">
          <div className="bg-white dark:bg-[#151922] border border-[#d7d7d0] dark:border-[#272d3a] rounded-[14px] shadow-[0_8px_24px_rgba(0,0,0,.08)] dark:shadow-[0_10px_30px_rgba(0,0,0,.45)] overflow-hidden">
            <div className="p-3.5 border-b border-[#d7d7d0] dark:border-[#272d3a] flex justify-between items-center">
              <div className="brand">
                <b className="text-[14px] text-[#222] dark:text-[#e7e9ee]">Çeviriler</b>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="rounded-full gap-1.5 border-[#d7d7d0] dark:border-[#272d3a] bg-[rgba(255,255,255,.55)] dark:bg-[rgba(255,255,255,.06)] text-[#222] dark:text-[#e7e9ee] hover:bg-[rgba(0,0,0,.05)] dark:hover:bg-[rgba(255,255,255,.1)] text-xs"
              >
                {isDark ? (
                  <>
                    <Sun className="h-4 w-4" />
                    Light
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" />
                    Dark
                  </>
                )}
              </Button>
            </div>

            <div className="p-2.5 flex flex-col gap-2">
              {games.map((game) => (
                <button
                  key={game._id}
                  onClick={() => handleGameClick(game)}
                  className={`flex gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all text-left ${
                    selectedGame?._id === game._id
                      ? "bg-[rgba(31,111,235,.12)] border border-[rgba(31,111,235,.35)]"
                      : "border border-transparent hover:bg-[rgba(0,0,0,.03)] dark:hover:bg-[rgba(255,255,255,.03)]"
                  }`}
                >
                  <div className="w-8.5 h-8.5 rounded-xl bg-[rgba(255,255,255,.55)] dark:bg-[rgba(255,255,255,.06)] grid place-items-center shrink-0 overflow-hidden">
                    {game.imageUrl ? (
                      <img src={game.imageUrl} alt={game.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[20px]">{game.icon || "🎮"}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[14px] leading-tight text-[#222] dark:text-[#e7e9ee]">
                      {game.name}
                    </div>
                    {game.desc && (
                      <div className="text-[11px] leading-tight opacity-65 font-normal text-[#666] dark:text-[#a7adbb] mt-0.5">
                        {game.desc}
                      </div>
                    )}
                    <div className="text-[11px] text-[#666] dark:text-[#a7adbb] mt-1 opacity-70 flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {game.clickCount} görüntülenme
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="max-w-7xl mx-auto w-full">
          {selectedGame ? (
            <>
<header className="mb-4.5 flex flex-col items-center text-center">
  <h1 className="text-[34px] font-bold ...">
    {selectedGame.name}
  </h1>

{/* 🔍 ARAMA */}
<div className="mt-3 w-full max-w-md">
  <input
    type="text"
    placeholder="Arama"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="
      w-full h-10 px-4 rounded-xl
      border border-[#d7d7d0] dark:border-[#272d3a]
      bg-white dark:bg-[#101521]
      text-[#222] dark:text-[#e7e9ee]
      placeholder:text-[#777]
      text-center
      focus:outline-none focus:ring-2 focus:ring-[#1f6feb]/40
    "
  />
</div>
</header>

              <div className="bg-white dark:bg-[#151922] border border-[#d7d7d0] dark:border-[#272d3a] rounded-[14px] shadow-[0_8px_24px_rgba(0,0,0,.08)] dark:shadow-[0_10px_30px_rgba(0,0,0,.45)] overflow-hidden">
                {visibleSections.map((section, idx) => {
                  const sectionId = `section-${idx}`;
                  const isOpen = openSections.has(sectionId);

                  return (
                    <div key={idx} className="border-t border-[#d7d7d0] dark:border-[#272d3a] first:border-t-0">
                      <button
                        onClick={() => toggleSection(sectionId)}
                        className="w-full p-4.5 flex justify-between items-center cursor-pointer hover:bg-[rgba(0,0,0,.02)] dark:hover:bg-[rgba(255,255,255,.02)] transition-colors text-left"
                      >
                        <div className="font-medium text-[16px] text-[#222] dark:text-[#e7e9ee]">{section.title}</div>
                        <div
                          className={`w-6.5 h-6.5 rounded-[10px] border border-[#d7d7d0] dark:border-[#272d3a] grid place-items-center bg-[rgba(255,255,255,.55)] dark:bg-[rgba(255,255,255,.06)] transition-transform ${
                            isOpen ? "rotate-90 text-[#1f6feb] dark:text-[#6ea8ff]" : ""
                          }`}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-4.5 pb-4.5">
                          {renderContentWithImages(section.content, section.images, section.callouts)}

                          {section.subsections && section.subsections.length > 0 && (
                            <div className="mt-2.5 space-y-2.5">
                              {section.subsections.map((sub, subIdx) =>
                                renderSubsection(sub, `${sectionId}-sub-${subIdx}`, 1),
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <footer className="mt-2 text-[13px] text-center text-[#666] dark:text-[#a7adbb]">{/*  */}</footer>
            </>
          ) : (
            <div className="bg-white dark:bg-[#151922] border border-[#d7d7d0] dark:border-[#272d3a] rounded-[14px] shadow-[0_8px_24px_rgba(0,0,0,.08)] dark:shadow-[0_10px_30px_rgba(0,0,0,.45)] p-12 text-center">
              <p className="text-[#666] dark:text-[#a7adbb]">Henüz oyun eklenmemiş.</p>
            </div>
          )}
        </main>
      </div>

      {/* Buy Me a Coffee Button */}
      <a
        href="https://buymeacoffee.com/rpgarsiv"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 left-4 z-50 transition-transform hover:scale-105"
      >
        <img
          src={isDark ? "/buy_me_a_coffee_dark.png" : "/buy_me_a_coffee_light.png"}
          alt="Buy Me a Coffee"
          className="h-10 w-auto"
          onError={(e) => {
            // Eğer light.png yoksa dark.png kullan
            e.currentTarget.src = "/buy_me_a_coffee_dark.png";
          }}
        />
      </a>
    </div>
  );
}
