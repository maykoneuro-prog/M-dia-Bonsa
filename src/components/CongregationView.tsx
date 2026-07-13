import React, { useState, useEffect } from "react";
import { 
  Users, 
  Tv, 
  ZoomIn, 
  ZoomOut, 
  Sun, 
  Moon, 
  ArrowLeft, 
  Music,
  Maximize2
} from "lucide-react";
import { Song, Slide, Room } from "../types";
import { listenToSongs } from "../lib/dbService";

interface CongregationViewProps {
  room: Room;
  onDisconnect: () => void;
}

export default function CongregationView({ room, onDisconnect }: CongregationViewProps) {
  const [songsList, setSongsList] = useState<Song[]>([]);
  const [activeSong, setActiveSong] = useState<Song | null>(null);
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg" | "xl">("lg");
  const [lightMode, setLightMode] = useState(false);

  // Sync song list in order to find the active song content
  useEffect(() => {
    const unsubscribe = listenToSongs((loadedSongs) => {
      setSongsList(loadedSongs);
    });
    return () => unsubscribe();
  }, []);

  // Update activeSong when room.activeSongId changes
  useEffect(() => {
    if (room.activeSongId && songsList.length > 0) {
      const found = songsList.find(s => s.id === room.activeSongId);
      setActiveSong(found || null);
    } else if (!room.activeSongId) {
      setActiveSong(null);
    }
  }, [room.activeSongId, songsList]);

  // Handle font scale classes
  const getFontSizeClass = () => {
    switch (fontSize) {
      case "sm": return "text-lg sm:text-xl leading-relaxed";
      case "md": return "text-xl sm:text-2xl leading-relaxed";
      case "lg": return "text-2xl sm:text-3xl leading-relaxed font-bold";
      case "xl": return "text-3xl sm:text-4xl leading-loose font-bold";
    }
  };

  const getContextSizeClass = () => {
    switch (fontSize) {
      case "sm": return "text-xs sm:text-sm";
      case "md": return "text-sm sm:text-base";
      case "lg": return "text-base sm:text-lg";
      case "xl": return "text-lg sm:text-xl";
    }
  };

  // Extract slides
  const slides = activeSong?.slides || [];
  const currentSlideIndex = room.activeSlideIndex;

  const prevSlide = currentSlideIndex > 0 ? slides[currentSlideIndex - 1] : null;
  const currentSlide = currentSlideIndex < slides.length ? slides[currentSlideIndex] : null;
  const nextSlide = currentSlideIndex < slides.length - 1 ? slides[currentSlideIndex + 1] : null;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      lightMode 
        ? "bg-natural-bg text-natural-text" 
        : "bg-natural-dark-bg text-natural-bg"
    } font-sans`}>
      
      {/* Top sticky bar */}
      <header className={`px-4 py-3 border-b flex justify-between items-center ${
        lightMode 
          ? "bg-white border-natural-border" 
          : "bg-[#242422] border-natural-dark-border"
      } backdrop-blur-md sticky top-0 z-20 transition-colors`}>
        <div className="flex items-center space-x-2">
          <button
            onClick={onDisconnect}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              lightMode ? "hover:bg-natural-cream text-natural-sage" : "hover:bg-natural-dark-border text-natural-bg/70"
            }`}
            title="Sair da Sala"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className={`text-[10px] font-bold uppercase tracking-wider ${
              lightMode ? "text-natural-sage/70" : "text-natural-bg/60"
            }`}>
              Acompanhar Letras
            </h1>
            <p className={`text-sm font-serif font-bold italic tracking-tight ${
              lightMode ? "text-natural-text" : "text-white"
            }`}>
              {room.name}
            </p>
          </div>
        </div>

        {/* Sync Status Badge */}
        <div className="flex items-center space-x-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-natural-sage opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-natural-sage"></span>
          </span>
          <span className={`text-[10px] font-mono tracking-wider uppercase font-semibold ${
            lightMode ? "text-natural-text/80" : "text-natural-bg/80"
          }`}>
            SALA: {room.id}
          </span>
        </div>
      </header>

      {/* Control panel for customized viewing experience */}
      <div className={`px-4 py-2 flex items-center justify-between border-b text-xs transition-colors ${
        lightMode 
          ? "bg-[#FAF8F5] border-natural-border text-natural-text/70" 
          : "bg-[#1E1E1C] border-natural-dark-border text-natural-bg/70"
      }`}>
        <span className="font-semibold uppercase tracking-wider text-[10px]">Modo Leitor</span>
        
        <div className="flex items-center space-x-3">
          {/* Font resizing */}
          <div className={`flex items-center space-x-1 p-1 rounded-lg ${
            lightMode ? "bg-natural-cream/60" : "bg-natural-dark-border"
          }`}>
            <button
              onClick={() => {
                if (fontSize === "xl") setFontSize("lg");
                else if (fontSize === "lg") setFontSize("md");
                else if (fontSize === "md") setFontSize("sm");
              }}
              disabled={fontSize === "sm"}
              className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded disabled:opacity-30 cursor-pointer"
              title="Diminuir texto"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[10px] uppercase font-bold w-5 text-center">
              {fontSize}
            </span>
            <button
              onClick={() => {
                if (fontSize === "sm") setFontSize("md");
                else if (fontSize === "md") setFontSize("lg");
                else if (fontSize === "lg") setFontSize("xl");
              }}
              disabled={fontSize === "xl"}
              className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded disabled:opacity-30 cursor-pointer"
              title="Aumentar texto"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Theme switcher */}
          <button
            onClick={() => setLightMode(!lightMode)}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg cursor-pointer"
            title={lightMode ? "Modo Escuro" : "Modo Claro"}
          >
            {lightMode ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
          </button>
        </div>
      </div>

      {/* Body content */}
      <main className="flex-1 flex flex-col justify-center p-6 max-w-lg w-full mx-auto">
        {room.isBlackout ? (
          <div className="text-center space-y-3 py-12 animate-pulse">
            <div className="h-2.5 w-2.5 bg-red-500 rounded-full mx-auto"></div>
            <p className="text-xs uppercase font-mono tracking-widest text-red-500 font-bold">
              Modo Blackout Ativado
            </p>
            <p className={`text-xs max-w-[240px] mx-auto ${lightMode ? "text-natural-text/60" : "text-natural-bg/50"}`}>
              O projetor está temporariamente oculto para momentos de oração ou preleção.
            </p>
          </div>
        ) : !activeSong ? (
          <div className="text-center py-12 space-y-4">
            <div className="inline-flex items-center justify-center p-4 bg-natural-sage/10 border border-natural-sage/20 rounded-full text-natural-sage mb-2">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-xs uppercase font-bold tracking-widest text-natural-sage">Aguardando Projeção</h3>
            <p className={`text-xs max-w-[280px] mx-auto leading-relaxed ${lightMode ? "text-natural-text/60" : "text-natural-bg/50"}`}>
              Fique conectado nesta tela. Assim que o líder iniciar o louvor no datashow, as letras aparecerão aqui instantaneamente.
            </p>
          </div>
        ) : (
          <div className="space-y-8 py-6 flex flex-col justify-between h-full min-h-[400px]">
            {/* Song Meta Header */}
            <div className={`text-center border-b pb-4 ${lightMode ? "border-natural-border" : "border-natural-dark-border"}`}>
              <span className="text-[9px] font-bold tracking-widest text-natural-sage uppercase font-mono bg-natural-sage/10 px-2.5 py-1 rounded-full">
                Sincronizado
              </span>
              <h2 className={`text-lg font-serif italic font-bold tracking-tight mt-3 ${lightMode ? "text-natural-text" : "text-white"}`}>
                {activeSong.title}
              </h2>
              <p className={`text-xs uppercase tracking-wider font-semibold ${lightMode ? "text-natural-text/60" : "text-natural-bg/60"}`}>
                {activeSong.artist}
              </p>
            </div>

            {/* Lyrics View */}
            <div className="flex-1 flex flex-col justify-center space-y-8 my-4">
              
              {/* Previous verse (context) */}
              {prevSlide && !room.isClearText && (
                <div className={`opacity-25 text-center transition-all ${getContextSizeClass()}`}>
                  <p className="text-[10px] uppercase tracking-wider font-mono font-bold mb-1">
                    Anterior
                  </p>
                  <div className="space-y-1 font-serif italic">
                    {prevSlide.lines.map((line, idx) => (
                      <p key={idx}>{line}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Current active verse */}
              <div className="text-center py-4">
                {room.isClearText ? (
                  <p className="text-xs italic opacity-60 uppercase tracking-widest">
                    Texto oculto no projetor
                  </p>
                ) : (
                  <div className={`space-y-2 font-serif italic transition-all duration-300 ${getFontSizeClass()}`}>
                    {currentSlide?.lines.map((line, idx) => (
                      <p key={idx} className={`tracking-tight font-medium ${lightMode ? "text-[#2D2D2A]" : "text-white"}`}>
                        {line}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Next verse (context) */}
              {nextSlide && !room.isClearText && (
                <div className={`opacity-25 text-center transition-all ${getContextSizeClass()}`}>
                  <p className="text-[10px] uppercase tracking-wider font-mono font-bold mb-1">
                    Seguinte
                  </p>
                  <div className="space-y-1 font-serif italic">
                    {nextSlide.lines.map((line, idx) => (
                      <p key={idx}>{line}</p>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Progress dots bar */}
            <div className={`flex justify-center items-center space-x-1.5 pt-4 border-t ${
              lightMode ? "border-natural-border" : "border-natural-dark-border"
            }`}>
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentSlideIndex === index 
                      ? "w-4 bg-natural-sage" 
                      : lightMode ? "w-1.5 bg-natural-cream" : "w-1.5 bg-natural-dark-border"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className={`py-4 text-center border-t text-[10px] font-mono tracking-wider transition-colors ${
        lightMode 
          ? "bg-white border-natural-border text-natural-sage/55" 
          : "bg-[#242422] border-natural-dark-border text-natural-bg/50"
      }`}>
        BOLETIM DIGITAL BOM SAMARITANO &copy; 2026
      </footer>
    </div>
  );
}
