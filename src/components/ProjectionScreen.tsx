import React, { useState, useEffect } from "react";
import { Maximize2, Minimize2, Tv, Volume2, Instagram, EyeOff, Clock } from "lucide-react";
import { Song, Room, Announcement } from "../types";
import { listenToSongs, listenToAnnouncements } from "../lib/dbService";

interface ProjectionScreenProps {
  room: Room;
  onDisconnect: () => void;
}

export default function ProjectionScreen({ room, onDisconnect }: ProjectionScreenProps) {
  const [songsList, setSongsList] = useState<Song[]>([]);
  const [activeSong, setActiveSong] = useState<Song | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [useGradient, setUseGradient] = useState(false); // Pure black vs elegant deep blue/purple church gradient
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [localPreServiceIndex, setLocalPreServiceIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState("");

  // Sync real-time digital clock for a young tech-forward vibe
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync song list in order to find the active song content
  useEffect(() => {
    const unsubscribe = listenToSongs((loadedSongs) => {
      setSongsList(loadedSongs);
    });
    return () => unsubscribe();
  }, []);

  // Sync announcements for this room
  useEffect(() => {
    const unsubscribe = listenToAnnouncements(room.id, (loaded) => {
      setAnnouncements(loaded);
    });
    return () => unsubscribe();
  }, [room.id]);

  // Update activeSong when room.activeSongId changes
  useEffect(() => {
    if (room.activeSongId && songsList.length > 0) {
      const found = songsList.find(s => s.id === room.activeSongId);
      setActiveSong(found || null);
    } else if (!room.activeSongId) {
      setActiveSong(null);
    }
  }, [room.activeSongId, songsList]);

  // Pre-service auto-loop timer (cycles every 7 seconds)
  useEffect(() => {
    if (room.activeAnnouncementType !== "pre-service") return;
    const preServices = announcements.filter(a => a.type === "pre-service");
    if (preServices.length === 0) return;

    const interval = setInterval(() => {
      setLocalPreServiceIndex(prev => (prev + 1) % preServices.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [room.activeAnnouncementType, announcements]);

  // Fullscreen support
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error("Erro ao ativar tela cheia:", err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const currentSlide = activeSong && room.activeSlideIndex < activeSong.slides.length
    ? activeSong.slides[room.activeSlideIndex]
    : null;

  // Filter lists of announcements
  const preServices = announcements.filter(a => a.type === "pre-service");
  const postServices = announcements.filter(a => a.type === "post-service");

  const currentPreService = preServices.length > 0 
    ? preServices[localPreServiceIndex % preServices.length] 
    : null;

  const currentPostService = postServices.length > 0 && room.activeAnnouncementIndex !== undefined && room.activeAnnouncementIndex < postServices.length
    ? postServices[room.activeAnnouncementIndex]
    : null;

  // Helper to get matching beautiful icon for default pre-service youth slides
  const getPreServiceIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes("imagem") || lower.includes("foto")) {
      return <EyeOff className="w-16 h-16 text-pink-400 animate-pulse" />;
    }
    if (lower.includes("celular") || lower.includes("silencioso") || lower.includes("som") || lower.includes("deus")) {
      return <Volume2 className="w-16 h-16 text-amber-400 animate-bounce" />;
    }
    if (lower.includes("redes") || lower.includes("social") || lower.includes("instagram") || lower.includes("siga")) {
      return <Instagram className="w-16 h-16 text-cyan-400 animate-pulse" />;
    }
    return <Clock className="w-16 h-16 text-emerald-400 animate-spin-slow" />;
  };

  return (
    <div className={`min-h-screen relative flex flex-col justify-center items-center overflow-hidden transition-all duration-700 ${
      room.isBlackout 
        ? "bg-black text-black" // Absolute blackout
        : room.activeAnnouncementType === "pre-service" && room.activeProjectionType !== "offering" && room.activeProjectionType !== "scripture"
          ? "bg-gradient-to-tr from-[#0D0B21] via-[#1A1140] to-[#2D124D] text-[#F9F7F2]" // Premium neon-youth purple aesthetic
          : useGradient 
            ? "bg-black text-white" // Pure black
            : room.activeProjectionType === "offering"
              ? "bg-[#142319] text-[#FDFBF7]" // A deep holy forest green theme for offerings
              : "bg-natural-dark-bg text-[#F9F7F2]" // Natural Slate / Warm Ivory theme
    }`}>
      
      {/* Dynamic Animated background mesh for Youth Pre-Service Loop */}
      {(!room.isBlackout && room.activeAnnouncementType === "pre-service") && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
          <div className="absolute top-1/4 -left-12 w-[35rem] h-[35rem] rounded-full bg-indigo-500/10 blur-[120px] animate-blob-slow" />
          <div className="absolute bottom-1/4 -right-12 w-[40rem] h-[40rem] rounded-full bg-pink-500/10 blur-[140px] animate-blob-slower" />
          <div className="absolute top-1/2 left-1/3 w-[30rem] h-[30rem] rounded-full bg-cyan-500/5 blur-[100px] animate-blob" />
        </div>
      )}

      {/* Floating control bar (visible on hover) */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 z-50 bg-white border border-natural-border px-4 py-2 rounded-xl shadow-lg max-w-xl mx-auto text-natural-text">
        <div className="flex items-center space-x-2">
          <Tv className="w-4 h-4 text-natural-sage" />
          <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-natural-sage">
            PROJEÇÃO DATASHOW: {room.id}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setUseGradient(!useGradient)}
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-natural-bg hover:bg-natural-cream border border-natural-border rounded text-natural-sage transition cursor-pointer"
          >
            {useGradient ? "Estilo: Natural Cálido" : "Estilo: Preto de Alto Contraste"}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1 hover:bg-natural-bg text-natural-sage hover:text-natural-sage-hover rounded transition cursor-pointer"
            title="Alternar Tela Cheia"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onDisconnect}
            className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded transition cursor-pointer"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Main projection box */}
      <div className="w-full max-w-5xl px-8 text-center select-none py-12 z-10 flex flex-col items-center">
        {room.isBlackout ? (
          // Blackout mode (absolute void)
          null
        ) : room.activeProjectionType === "scripture" && room.activeScriptureText && room.activeScriptureText.length > 0 ? (
          // BEAUTIFUL SERIF SCRIPTURE PROJECTION
          <div 
            key={`scripture-${room.activeScriptureIndex}-${room.activeScriptureReference}`}
            className="animate-fade-in space-y-6 md:space-y-8 max-w-4xl"
          >
            <p 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif italic font-medium leading-relaxed drop-shadow-[0_4px_16px_rgba(0,0,0,0.65)] text-[#FDFBF7]"
            >
              "{room.activeScriptureText[room.activeScriptureIndex ?? 0]}"
            </p>
            {room.activeScriptureReference && (
              <div className="text-xl sm:text-2xl font-mono tracking-widest text-emerald-400 uppercase pt-6 drop-shadow-md">
                — {room.activeScriptureReference} —
              </div>
            )}
          </div>
        ) : room.activeProjectionType === "offering" ? (
          // MAJESTIC TITHES & OFFERINGS DESIGN
          <div className="animate-fade-in w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white/5 border border-white/10 p-8 md:p-10 rounded-3xl backdrop-blur-md shadow-2xl">
            {/* Left side: Holy scriptures and invitation */}
            <div className="md:col-span-7 text-left space-y-6">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-mono uppercase tracking-[0.2em] font-bold">
                Ofertório Sagrado
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold italic tracking-wide text-emerald-300">
                Dízimos & Ofertas
              </h2>
              <div className="border-l-2 border-emerald-500/30 pl-4 space-y-3">
                <p className="text-lg sm:text-xl md:text-2xl font-serif italic text-white/90 leading-relaxed">
                  "Cada um contribua conforme propôs no seu coração; não com tristeza ou por necessidade; porque Deus ama ao que dá com alegria."
                </p>
                <p className="text-xs font-mono font-bold uppercase text-emerald-400 tracking-wider">
                  2 Coríntios 9:7
                </p>
              </div>
            </div>

            {/* Right side: PIX QR Code & Details */}
            <div className="md:col-span-5 flex flex-col items-center p-6 bg-white rounded-2xl text-natural-text border border-natural-border/20 shadow-xl">
              <p className="text-[10px] font-mono uppercase tracking-widest font-bold text-natural-sage mb-3">
                Contribua pelo PIX
              </p>
              
              <div className="p-3 bg-natural-bg rounded-xl border border-natural-border/40">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=142319&data=${encodeURIComponent(room.pixKey || "pix@paroquia.com")}`}
                  alt="QR Code Pix"
                  referrerPolicy="no-referrer"
                  className="w-44 h-44 sm:w-48 sm:h-48 rounded-lg"
                />
              </div>

              <div className="text-center mt-4 w-full">
                <p className="text-xs font-bold text-natural-text truncate max-w-xs mx-auto">
                  {room.pixName || "Paróquia Bom Samaritano"}
                </p>
                <div className="mt-1.5 px-3 py-1 bg-natural-bg border border-natural-border/50 rounded-lg text-[10px] font-mono text-natural-sage font-bold flex items-center justify-center gap-1.5 select-all">
                  <span>Chave:</span>
                  <span className="truncate max-w-[150px]">{room.pixKey || "pix@paroquia.com"}</span>
                </div>
              </div>
            </div>
          </div>
        ) : room.activeAnnouncementType === "pre-service" && currentPreService ? (
          // COOL & YOUNG PRE-SERVICE YOUTH SLIDESHOW / LOOP
          <div 
            key={`pre-${localPreServiceIndex}`} 
            className="animate-fade-in flex flex-col items-center space-y-8 md:space-y-12 max-w-4xl"
          >
            {/* Young visual header badge */}
            <div className="flex items-center space-x-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-inner">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-[0.25em] text-cyan-300 uppercase">
                {currentTime ? `HOJE • ${currentTime}` : "BEM-VINDO"}
              </span>
            </div>

            {/* Glowing Icon Container */}
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 shadow-lg backdrop-blur-lg">
              {getPreServiceIcon(currentPreService.title)}
            </div>

            {/* Cool text lines */}
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-sm font-mono tracking-widest text-cyan-300 uppercase font-bold">
                {currentPreService.title}
              </h2>
              {currentPreService.lines.map((line, idx) => (
                <p 
                  key={idx}
                  className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-sans font-extrabold leading-tight tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] ${
                    idx === 0 ? "text-white" : "text-slate-300"
                  }`}
                >
                  {line}
                </p>
              ))}
            </div>

            {/* Loop indicator bar */}
            <div className="flex space-x-1.5 pt-4">
              {preServices.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === (localPreServiceIndex % preServices.length) ? "w-8 bg-cyan-400" : "w-1.5 bg-white/20"
                  }`} 
                />
              ))}
            </div>
          </div>
        ) : room.activeAnnouncementType === "post-service" && currentPostService ? (
          // ELEGANT END-OF-SERVICE ANNOUNCEMENTS SLIDESHOW
          <div 
            key={`post-${room.activeAnnouncementIndex}`} 
            className="animate-fade-in space-y-8 max-w-4xl"
          >
            <div className="inline-block px-4 py-1.5 rounded-full bg-[#E5DCC6]/10 border border-[#E5DCC6]/20 text-natural-sage/90 text-xs font-mono uppercase tracking-widest font-bold">
              📢 Avisos Importantes
            </div>

            <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold italic tracking-wide text-natural-sage">
              {currentPostService.title}
            </h2>

            <div className="space-y-4 md:space-y-6 pt-4">
              {currentPostService.lines.map((line, idx) => (
                <p 
                  key={idx} 
                  className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif italic drop-shadow-sm leading-relaxed ${
                    idx === 0 ? "text-[#FDFBF7] font-semibold" : "text-[#F9F7F2]/80"
                  }`}
                >
                  {line}
                </p>
              ))}
            </div>

            <div className="text-[10px] font-mono tracking-widest text-natural-sage/50 uppercase pt-6">
              Aviso { (room.activeAnnouncementIndex ?? 0) + 1 } de { postServices.length }
            </div>
          </div>
        ) : room.isClearText || !currentSlide ? (
          // Clear mode / Welcome screen on projector
          <div className="animate-fade-in flex flex-col items-center space-y-4">
            <span className="text-xl sm:text-2xl font-serif italic text-natural-sage/60">
              Boletim Digital
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold italic tracking-wide text-natural-sage/50">
              Bom Samaritano
            </h1>
            <p className="text-xs font-mono tracking-widest text-natural-sage/40 uppercase font-semibold">
              Sala de Projeção Conectada: {room.id}
            </p>
          </div>
        ) : (
          // Active lyrics slide with super-readable Display typography
          <div 
            key={`${room.activeSongId}-${room.activeSlideIndex}`} // Forces re-render for anim trigger
            className="animate-fade-in space-y-6 md:space-y-8"
          >
            {currentSlide.lines.map((line, idx) => (
              <p 
                key={idx} 
                className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-snug sm:leading-normal drop-shadow-[0_4px_16px_rgba(0,0,0,0.65)] ${
                  useGradient 
                    ? "text-white uppercase font-sans font-extrabold" 
                    : "text-[#FDFBF7] font-serif italic font-medium"
                }`}
                id={`projector-line-${idx}`}
              >
                {line}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Hidden layout hint at bottom for projection operators */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-center opacity-0 hover:opacity-80 transition-opacity duration-300">
        <span className="text-[10px] font-mono text-natural-sage/60 tracking-widest uppercase font-semibold text-center">
          {room.activeProjectionType === "scripture"
            ? `BÍBLIA: ${room.activeScriptureReference} • SLIDE ${room.activeScriptureIndex !== undefined ? room.activeScriptureIndex + 1 : 1} / ${room.activeScriptureText?.length || 1}`
            : room.activeProjectionType === "offering"
              ? `TELA DE OFERTÓRIO ATIVA (${room.pixName || "PIX"})`
              : room.activeAnnouncementType === "pre-service" 
                ? `LOOP ATIVO: ${preServices.length} ANÚNCIOS DE PRÉ-CULTO`
                : room.activeAnnouncementType === "post-service"
                  ? `AVISOS DE FIM DE CULTO: ${room.activeAnnouncementIndex !== undefined ? room.activeAnnouncementIndex + 1 : 1} / ${postServices.length}`
                  : activeSong 
                    ? `${activeSong.title} • SLIDE ${room.activeSlideIndex + 1} / ${activeSong.slides.length}` 
                    : "SEM LOUVOR ATIVO"}
        </span>
      </div>

      {/* Embedded CSS for seamless transitions and cool floating animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 10s infinite alternate ease-in-out;
        }
        .animate-blob-slow {
          animation: blob 16s infinite alternate ease-in-out;
        }
        .animate-blob-slower {
          animation: blob 22s infinite alternate ease-in-out;
        }
        .animate-spin-slow {
          animation: spin 12s linear infinite;
        }
      `}</style>
    </div>
  );
}
