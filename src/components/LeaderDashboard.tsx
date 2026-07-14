import React, { useState, useEffect } from "react";
import { 
  Search, 
  Plus, 
  Presentation, 
  EyeOff, 
  Eye, 
  Sparkles, 
  LogOut, 
  RefreshCw, 
  Music, 
  Share2, 
  Copy, 
  Check, 
  ChevronRight,
  Tv,
  Calendar,
  Trash2,
  Play,
  ArrowUp,
  ArrowDown,
  Layers,
  CheckSquare,
  Square,
  Megaphone,
  Edit3,
  BookOpen,
  HeartHandshake
} from "lucide-react";
import { Song, Slide, Room, Service, ServiceItem, LITURGY_CATEGORIES, Announcement } from "../types";
import { 
  addSongToLibrary, 
  updateRoomActiveState, 
  updateRoomDisplaySettings,
  listenToSongs,
  createService,
  updateService,
  deleteService,
  setActiveService,
  listenToServices,
  listenToAnnouncements,
  addAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  updateRoomAnnouncementState,
  seedDefaultAnnouncementsIfEmpty,
  updateRoomScriptureState,
  updateRoomOfferingState,
  updateRoomProjectionType
} from "../lib/dbService";

const BIBLE_BOOKS = [
  { name: "Gênesis", abbrev: "gn" },
  { name: "Êxodo", abbrev: "ex" },
  { name: "Levítico", abbrev: "lv" },
  { name: "Números", abbrev: "nm" },
  { name: "Deuteronômio", abbrev: "dt" },
  { name: "Josué", abbrev: "js" },
  { name: "Juízes", abbrev: "jz" },
  { name: "Rute", abbrev: "rt" },
  { name: "1 Samuel", abbrev: "1sm" },
  { name: "2 Samuel", abbrev: "2sm" },
  { name: "1 Reis", abbrev: "1rs" },
  { name: "2 Reis", abbrev: "2rs" },
  { name: "1 Crônicas", abbrev: "1cr" },
  { name: "2 Crônicas", abbrev: "2cr" },
  { name: "Esdras", abbrev: "ez" },
  { name: "Neemias", abbrev: "ne" },
  { name: "Ester", abbrev: "et" },
  { name: "Jó", abbrev: "jo" },
  { name: "Salmos", abbrev: "sl" },
  { name: "Provérbios", abbrev: "pv" },
  { name: "Eclesiastes", abbrev: "ec" },
  { name: "Cânticos", abbrev: "ct" },
  { name: "Isaías", abbrev: "is" },
  { name: "Jeremias", abbrev: "jr" },
  { name: "Lamentações", abbrev: "lm" },
  { name: "Ezequiel", abbrev: "ezq" },
  { name: "Daniel", abbrev: "dn" },
  { name: "Oséias", abbrev: "os" },
  { name: "Joel", abbrev: "jl" },
  { name: "Amós", abbrev: "am" },
  { name: "Obadias", abbrev: "ob" },
  { name: "Jonas", abbrev: "jn" },
  { name: "Miquéias", abbrev: "mq" },
  { name: "Naum", abbrev: "na" },
  { name: "Habacuque", abbrev: "hc" },
  { name: "Sofonias", abbrev: "sf" },
  { name: "Ageu", abbrev: "ag" },
  { name: "Zacarias", abbrev: "zc" },
  { name: "Malaquias", abbrev: "ml" },
  { name: "Mateus", abbrev: "mt" },
  { name: "Marcos", abbrev: "mc" },
  { name: "Lucas", abbrev: "lc" },
  { name: "João", abbrev: "jo" },
  { name: "Atos", abbrev: "at" },
  { name: "Romanos", abbrev: "rm" },
  { name: "1 Coríntios", abbrev: "1co" },
  { name: "2 Coríntios", abbrev: "2co" },
  { name: "Gálatas", abbrev: "gl" },
  { name: "Efésios", abbrev: "ef" },
  { name: "Filipenses", abbrev: "fp" },
  { name: "Colossenses", abbrev: "cl" },
  { name: "1 Tessalonicenses", abbrev: "1ts" },
  { name: "2 Tessalonicenses", abbrev: "2ts" },
  { name: "1 Timóteo", abbrev: "1tm" },
  { name: "2 Timóteo", abbrev: "2tm" },
  { name: "Tito", abbrev: "tt" },
  { name: "Filemom", abbrev: "fm" },
  { name: "Hebreus", abbrev: "hb" },
  { name: "Tiago", abbrev: "tg" },
  { name: "1 Pedro", abbrev: "1pe" },
  { name: "2 Pedro", abbrev: "2pe" },
  { name: "1 João", abbrev: "1jo" },
  { name: "2 João", abbrev: "2jo" },
  { name: "3 João", abbrev: "3jo" },
  { name: "Judas", abbrev: "jd" },
  { name: "Apocalipse", abbrev: "ap" }
];

interface LeaderDashboardProps {
  room: Room;
  songs: Song[];
  onDisconnect: () => void;
}

export default function LeaderDashboard({ room, onDisconnect }: LeaderDashboardProps) {
  const [songsList, setSongsList] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchingGemini, setIsSearchingGemini] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // States for adding song manually
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualArtist, setManualArtist] = useState("");
  const [manualLyrics, setManualLyrics] = useState("");
  const [isSavingManual, setIsSavingManual] = useState(false);

  // Tab control
  const [activeTab, setActiveTab] = useState<"projection" | "services" | "announcements">("services");

  // Announcements States
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [annTitle, setAnnTitle] = useState("");
  const [annLinesText, setAnnLinesText] = useState("");
  const [annType, setAnnType] = useState<"pre-service" | "post-service">("pre-service");
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);
  const [isSavingAnn, setIsSavingAnn] = useState(false);

  // --- BIBLE SAGRADA STATES ---
  const [bibleVersion, setBibleVersion] = useState<"nvi" | "ra" | "acf">("nvi");
  const [bibleBookAbbrev, setBibleBookAbbrev] = useState<string>("gn");
  const [bibleBookName, setBibleBookName] = useState<string>("Gênesis");
  const [bibleChapter, setBibleChapter] = useState<number>(1);
  const [fetchedVerses, setFetchedVerses] = useState<{ number: number; text: string }[]>([]);
  const [selectedVerseNumbers, setSelectedVerseNumbers] = useState<number[]>([]);
  const [isFetchingBible, setIsFetchingBible] = useState<boolean>(false);
  const [bibleError, setBibleError] = useState<string | null>(null);

  // Manual copy/paste scripture input states
  const [manualBibleRef, setManualBibleRef] = useState<string>("");
  const [manualBibleText, setManualBibleText] = useState<string>("");

  // --- OFFERING STATES ---
  const [pixKey, setPixKey] = useState<string>(room.pixKey || "");
  const [pixName, setPixName] = useState<string>(room.pixName || "Paróquia Bom Samaritano");
  const [isSavingOffering, setIsSavingOffering] = useState<boolean>(false);

  // Sync Pix state from room props
  useEffect(() => {
    if (room.pixKey) setPixKey(room.pixKey);
    if (room.pixName) setPixName(room.pixName);
  }, [room.pixKey, room.pixName]);

  // Seed default announcements if empty
  useEffect(() => {
    seedDefaultAnnouncementsIfEmpty(room.id);
  }, [room.id]);

  // Sync announcements
  useEffect(() => {
    const unsubscribe = listenToAnnouncements(room.id, (loaded) => {
      setAnnouncements(loaded);
    });
    return () => unsubscribe();
  }, [room.id]);

  // Services States
  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [newServiceTitle, setNewServiceTitle] = useState("");
  const [newServiceDate, setNewServiceDate] = useState("");
  const [isSavingService, setIsSavingService] = useState(false);
  // Holds the chosen liturgical category per song ID before adding it
  const [songLiturgyCategories, setSongLiturgyCategories] = useState<{[songId: string]: string}>({});

  // Sync worship services from database
  useEffect(() => {
    const unsubscribe = listenToServices(room.id, (loadedServices) => {
      setServicesList(loadedServices);
      
      // Keep the active/selected service in sync
      setSelectedService(prev => {
        if (!prev) {
          // If none was selected, auto-select the active service, or the first service
          const active = loadedServices.find(s => s.isActive);
          return active || loadedServices[0] || null;
        }
        const updated = loadedServices.find(s => s.id === prev.id);
        return updated || loadedServices[0] || null;
      });
    });
    return () => unsubscribe();
  }, [room.id]);

  // --- PRESENTER / TABLET NAVIGATION STATES & SELECTORS ---
  const [isPresenterModeOpen, setIsPresenterModeOpen] = useState(false);

  // Extract info for the Presenter Mode or live preview card
  const getPresenterInfo = () => {
    let typeLabel = "Nenhum";
    let referenceText = "Pronto para projetar";
    let currentSlideLines: string[] = [];
    let nextSlidePreview = "Fim da apresentação";
    let currentSlideIndex = 0;
    let totalSlides = 0;

    if (room.activeProjectionType === "scripture" && room.activeScriptureText && room.activeScriptureText.length > 0) {
      typeLabel = "📖 Bíblia Sagrada";
      referenceText = room.activeScriptureReference || "";
      currentSlideIndex = room.activeScriptureIndex ?? 0;
      totalSlides = room.activeScriptureText.length;
      
      const currentText = room.activeScriptureText[currentSlideIndex];
      if (currentText) {
        currentSlideLines = [currentText];
      }
      
      const nextText = room.activeScriptureText[currentSlideIndex + 1];
      nextSlidePreview = nextText ? nextText : "Fim do capítulo";
    } else if (room.activeProjectionType === "offering") {
      typeLabel = "💸 Dízimos e Ofertas";
      referenceText = room.pixName || "Paróquia Bom Samaritano";
      currentSlideLines = [
        "Chave PIX: " + (room.pixKey || "Não configurada"),
        "Contribua com alegria!"
      ];
      nextSlidePreview = "Nenhum slide subsequente";
    } else if (room.activeAnnouncementType === "post-service") {
      typeLabel = "📢 Avisos Pós-Culto";
      const postServices = announcements.filter(a => a.type === "post-service");
      totalSlides = postServices.length;
      currentSlideIndex = room.activeAnnouncementIndex ?? 0;
      
      const currentAnn = postServices[currentSlideIndex];
      if (currentAnn) {
        referenceText = currentAnn.title;
        currentSlideLines = currentAnn.lines;
      }
      
      const nextAnn = postServices[currentSlideIndex + 1];
      nextSlidePreview = nextAnn ? `${nextAnn.title}: ${nextAnn.lines.join(" ")}` : "Fim dos avisos";
    } else if (room.activeAnnouncementType === "pre-service") {
      typeLabel = "🔁 Loop de Pré-Culto";
      const preServices = announcements.filter(a => a.type === "pre-service");
      referenceText = "Looping de Entrada Automático";
      currentSlideLines = ["Anúncios de recepção ativos", "Passagem automática a cada 7s"];
      nextSlidePreview = "Fim do loop de entrada";
    } else if (room.activeSongId && selectedSong) {
      typeLabel = "🎵 Louvor";
      referenceText = `${selectedSong.title} — ${selectedSong.artist}`;
      currentSlideIndex = room.activeSlideIndex;
      totalSlides = selectedSong.slides.length;
      
      const currentSlide = selectedSong.slides[currentSlideIndex];
      if (currentSlide) {
        currentSlideLines = currentSlide.lines;
      }
      
      const nextSlide = selectedSong.slides[currentSlideIndex + 1];
      nextSlidePreview = nextSlide ? nextSlide.lines.join(" / ") : "Fim do louvor";
    }

    return {
      typeLabel,
      referenceText,
      currentSlideLines,
      nextSlidePreview,
      currentSlideIndex,
      totalSlides
    };
  };

  const presenterInfo = getPresenterInfo();

  const handlePresenterPrev = async () => {
    if (room.activeProjectionType === "scripture") {
      await handlePrevScriptureSlide();
    } else if (room.activeAnnouncementType === "post-service") {
      await handlePrevAnnouncementSlide();
    } else if (room.activeSongId) {
      await handlePrevSlide();
    }
  };

  const handlePresenterNext = async () => {
    if (room.activeProjectionType === "scripture") {
      await handleNextScriptureSlide();
    } else if (room.activeAnnouncementType === "post-service") {
      await handleNextAnnouncementSlide();
    } else if (room.activeSongId) {
      await handleNextSlide();
    }
  };

  const hasActiveProjection = !!(
    room.activeSongId || 
    room.activeProjectionType === "scripture" || 
    (room.activeProjectionType === "announcement" && room.activeAnnouncementType && room.activeAnnouncementType !== "none") ||
    room.activeProjectionType === "offering"
  );

  // Helper to parse pasted lyrics into slides
  const parsePastedLyrics = (text: string): Slide[] => {
    // Split raw text by double line breaks (handling different OS newline styles)
    const stanzas = text.split(/\r?\n\s*\r?\n/);
    const slides: Slide[] = [];

    for (const stanza of stanzas) {
      const rawLines = stanza.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
      if (rawLines.length === 0) continue;

      let slideType = "Estrofe";
      let firstLine = rawLines[0];

      // Check if first line is a section marker: e.g. [Refrão], Coro:, etc.
      const headerRegex = /^\[?(refrão|coro|ponte|estrofe|ministração|intro|introdução|refrão\s*\d+|estrofe\s*\d+)\]?:?$/i;
      if (headerRegex.test(firstLine)) {
        const match = firstLine.match(/^\[?([^\]:]+)/i);
        if (match) {
          const rawType = match[1].trim().toLowerCase();
          if (rawType.startsWith("coro") || rawType.startsWith("refrão")) {
            slideType = "Coro";
          } else if (rawType.startsWith("ponte")) {
            slideType = "Ponte";
          } else if (rawType.startsWith("ministra")) {
            slideType = "Ministração";
          } else if (rawType.startsWith("intro")) {
            slideType = "Introdução";
          } else {
            slideType = rawType.charAt(0).toUpperCase() + rawType.slice(1);
          }
        }
        // Remove the marker line so it's not projected as lyrics text
        rawLines.shift();
      }

      if (rawLines.length === 0) continue;

      // Split stanza lines into groups of maximum 4 lines to ensure great readability on screen
      const maxLinesPerSlide = 4;
      for (let i = 0; i < rawLines.length; i += maxLinesPerSlide) {
        const chunk = rawLines.slice(i, i + maxLinesPerSlide);
        slides.push({
          type: slideType,
          lines: chunk
        });
      }
    }

    return slides;
  };

  const handleSaveManualSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) {
      alert("Por favor, informe o título do louvor.");
      return;
    }
    if (!manualLyrics.trim()) {
      alert("Por favor, digite ou cole a letra do louvor.");
      return;
    }

    setIsSavingManual(true);
    try {
      const parsedSlides = parsePastedLyrics(manualLyrics);
      if (parsedSlides.length === 0) {
        throw new Error("A letra informada não possui linhas de texto válidas.");
      }

      const newSongId = await addSongToLibrary({
        title: manualTitle.trim(),
        artist: manualArtist.trim() || "Desconhecido",
        slides: parsedSlides
      });

      // Reset form and close modal
      setManualTitle("");
      setManualArtist("");
      setManualLyrics("");
      setShowManualModal(false);

      // Instantly select the manually added song
      const newSong: Song = {
        id: newSongId,
        title: manualTitle.trim(),
        artist: manualArtist.trim() || "Desconhecido",
        slides: parsedSlides
      };
      setSelectedSong(newSong);
      await updateRoomActiveState(room.id, newSongId, 0);

      setSearchMessage(`"${newSong.title}" adicionado manualmente com sucesso!`);
      setTimeout(() => setSearchMessage(""), 5000);
    } catch (err: any) {
      console.error(err);
      alert("Erro ao salvar louvor: " + (err.message || "Tente novamente."));
    } finally {
      setIsSavingManual(false);
    }
  };

  // Worship Service Handlers
  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceTitle.trim()) {
      alert("Por favor, informe o nome do culto.");
      return;
    }
    if (!newServiceDate) {
      alert("Por favor, selecione uma data.");
      return;
    }

    setIsSavingService(true);
    try {
      const newId = await createService(room.id, newServiceTitle.trim(), newServiceDate);
      
      // Auto-set the active status if it's the only one
      if (servicesList.length === 0) {
        await setActiveService(room.id, newId);
      }

      setNewServiceTitle("");
      setNewServiceDate("");
      setShowAddServiceModal(false);
    } catch (err: any) {
      console.error(err);
      alert(`Erro ao cadastrar culto: ${err?.message || err}`);
    } finally {
      setIsSavingService(false);
    }
  };

  const handleToggleServiceActive = async (serviceId: string, currentActive: boolean) => {
    try {
      await setActiveService(room.id, currentActive ? null : serviceId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm("Tem certeza que deseja remover este culto? Isso apagará toda a programação dele.")) {
      return;
    }
    try {
      await deleteService(serviceId);
      if (selectedService?.id === serviceId) {
        setSelectedService(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSongToService = async (song: Song) => {
    if (!selectedService) {
      alert("Por favor, selecione ou crie um culto primeiro na aba 'Programação de Cultos'.");
      setActiveTab("services");
      return;
    }

    const category = songLiturgyCategories[song.id] || "Momento de Louvor";
    const newItem: ServiceItem = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      songId: song.id,
      songTitle: song.title,
      songArtist: song.artist,
      liturgyCategory: category
    };

    const updatedItems = [...(selectedService.items || []), newItem];
    try {
      await updateService(selectedService.id, { items: updatedItems });
      
      setSearchMessage(`"${song.title}" adicionado ao culto "${selectedService.title}" como "${category}"!`);
      setTimeout(() => setSearchMessage(""), 5000);
    } catch (err) {
      console.error(err);
      alert("Erro ao adicionar louvor ao culto.");
    }
  };

  const handleRemoveSongFromService = async (itemId: string) => {
    if (!selectedService) return;
    const updatedItems = (selectedService.items || []).filter(item => item.id !== itemId);
    try {
      await updateService(selectedService.id, { items: updatedItems });
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveSongInService = async (itemId: string, direction: "up" | "down") => {
    if (!selectedService) return;
    const items = [...(selectedService.items || [])];
    const index = items.findIndex(item => item.id === itemId);
    if (index === -1) return;

    if (direction === "up" && index > 0) {
      const temp = items[index];
      items[index] = items[index - 1];
      items[index - 1] = temp;
    } else if (direction === "down" && index < items.length - 1) {
      const temp = items[index];
      items[index] = items[index + 1];
      items[index + 1] = temp;
    } else {
      return;
    }

    try {
      await updateService(selectedService.id, { items });
    } catch (err) {
      console.error(err);
    }
  };

  const handleProjectServiceSong = async (item: ServiceItem) => {
    const fullSong = songsList.find(s => s.id === item.songId);
    if (fullSong) {
      setSelectedSong(fullSong);
      await updateRoomActiveState(room.id, item.songId, 0);
      setActiveTab("projection");
    } else {
      alert("Esta música não foi encontrada no banco geral.");
    }
  };

  // Sync current active song from database state
  useEffect(() => {
    const unsubscribe = listenToSongs((loadedSongs) => {
      setSongsList(loadedSongs);
      
      // If there is an active song ID, make sure we keep selectedSong in sync
      if (room.activeSongId) {
        const active = loadedSongs.find(s => s.id === room.activeSongId);
        if (active) {
          setSelectedSong(active);
        }
      }
    });
    return () => unsubscribe();
  }, [room.activeSongId]);

  // Handle adding song through Gemini Search
  const handleGeminiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearchingGemini(true);
    setSearchMessage("Buscando letra e estruturando com a Inteligência do Gemini...");

    try {
      const response = await fetch(`/api/lyrics/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error("Não foi possível encontrar a música");
      }
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Add to Firestore database
      const newSongId = await addSongToLibrary({
        title: data.title || searchQuery,
        artist: data.artist || "Desconhecido",
        slides: data.slides || []
      });

      setSearchQuery("");
      setSearchMessage(`"${data.title}" adicionada com sucesso à biblioteca!`);
      
      // Auto select the new song for projection
      const newSong: Song = {
        id: newSongId,
        title: data.title,
        artist: data.artist,
        slides: data.slides
      };
      setSelectedSong(newSong);
      await updateRoomActiveState(room.id, newSongId, 0);

      setTimeout(() => setSearchMessage(""), 5000);
    } catch (err: any) {
      console.error(err);
      setSearchMessage("Erro ao buscar letra: " + (err.message || "Tente outro nome."));
    } finally {
      setIsSearchingGemini(false);
    }
  };

  const handleSelectSong = async (song: Song) => {
    setSelectedSong(song);
    await updateRoomActiveState(room.id, song.id, 0);
  };

  const handleSelectSlide = async (index: number) => {
    await updateRoomActiveState(room.id, room.activeSongId, index);
  };

  const handleNextSlide = async () => {
    if (!selectedSong) return;
    const nextIndex = Math.min(selectedSong.slides.length - 1, room.activeSlideIndex + 1);
    await updateRoomActiveState(room.id, room.activeSongId, nextIndex);
  };

  const handlePrevSlide = async () => {
    if (!selectedSong) return;
    const prevIndex = Math.max(0, room.activeSlideIndex - 1);
    await updateRoomActiveState(room.id, room.activeSongId, prevIndex);
  };

  const handleClearProject = async () => {
    await updateRoomActiveState(room.id, null, 0);
    setSelectedSong(null);
  };

  const toggleBlackout = async () => {
    await updateRoomDisplaySettings(room.id, { isBlackout: !room.isBlackout });
  };

  const toggleClearText = async () => {
    await updateRoomDisplaySettings(room.id, { isClearText: !room.isClearText });
  };

  // Announcements Action Handlers
  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annLinesText.trim()) return;

    setIsSavingAnn(true);
    const lines = annLinesText.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    const typeList = announcements.filter(a => a.type === annType);
    const order = editingAnnId 
      ? (announcements.find(a => a.id === editingAnnId)?.order ?? typeList.length + 1)
      : typeList.length + 1;

    try {
      if (editingAnnId) {
        await updateAnnouncement(editingAnnId, {
          title: annTitle.trim(),
          lines,
          type: annType,
          order
        });
      } else {
        await addAnnouncement({
          roomId: room.id,
          title: annTitle.trim(),
          lines,
          type: annType,
          order
        });
      }
      setAnnTitle("");
      setAnnLinesText("");
      setEditingAnnId(null);
      setShowAnnModal(false);
    } catch (err) {
      console.error("Erro ao salvar aviso:", err);
    } finally {
      setIsSavingAnn(false);
    }
  };

  const handleEditAnnouncementClick = (ann: Announcement) => {
    setEditingAnnId(ann.id);
    setAnnTitle(ann.title);
    setAnnLinesText(ann.lines.join("\n"));
    setAnnType(ann.type);
    setShowAnnModal(true);
  };

  const handleDeleteAnnouncementClick = async (id: string) => {
    if (confirm("Deseja realmente excluir este aviso?")) {
      try {
        await deleteAnnouncement(id);
      } catch (err) {
        console.error("Erro ao excluir aviso:", err);
      }
    }
  };

  const handleToggleAnnouncementMode = async (type: "pre-service" | "post-service" | "none") => {
    if (type === "none") {
      await updateRoomAnnouncementState(room.id, "none", 0);
    } else {
      // Clear any active song so announcements take priority cleanly
      await updateRoomActiveState(room.id, null, 0);
      await updateRoomAnnouncementState(room.id, type, 0);
    }
  };

  const handleNextAnnouncementSlide = async () => {
    const postServices = announcements.filter(a => a.type === "post-service");
    if (postServices.length === 0) return;
    const currentIndex = room.activeAnnouncementIndex ?? 0;
    const nextIndex = Math.min(postServices.length - 1, currentIndex + 1);
    await updateRoomAnnouncementState(room.id, "post-service", nextIndex);
  };

  const handlePrevAnnouncementSlide = async () => {
    const currentIndex = room.activeAnnouncementIndex ?? 0;
    const prevIndex = Math.max(0, currentIndex - 1);
    await updateRoomAnnouncementState(room.id, "post-service", prevIndex);
  };

  // --- BIBLE SAGRADA ACTION HANDLERS ---
  const handleFetchBible = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsFetchingBible(true);
    setBibleError(null);
    try {
      const url = `/api/bible/verses?version=${bibleVersion}&book=${bibleBookAbbrev}&chapter=${bibleChapter}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Não foi possível carregar o capítulo. Verifique se o livro ou capítulo existem.");
      }
      const data = await res.json();
      if (data && data.verses) {
        setFetchedVerses(data.verses);
        setSelectedVerseNumbers([]);
      } else {
        throw new Error("Nenhum versículo encontrado.");
      }
    } catch (err: any) {
      setBibleError(err.message || "Erro de conexão com o servidor da Bíblia.");
      setFetchedVerses([]);
    } finally {
      setIsFetchingBible(false);
    }
  };

  const handleToggleVerseSelection = (num: number) => {
    setSelectedVerseNumbers(prev => 
      prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num].sort((a,b) => a-b)
    );
  };

  const handleProjectSelectedScripture = async () => {
    if (selectedVerseNumbers.length === 0 && fetchedVerses.length === 0) return;
    
    // If no verses are specifically selected, project the whole chapter
    const versesToProject = selectedVerseNumbers.length > 0 
      ? fetchedVerses.filter(v => selectedVerseNumbers.includes(v.number))
      : fetchedVerses;

    const reference = `${bibleBookName} ${bibleChapter}:${selectedVerseNumbers.length > 0 ? selectedVerseNumbers.join(",") : `1-${fetchedVerses.length}`}`;
    
    // Combine texts
    const combinedText = versesToProject.map(v => `[${v.number}] ${v.text}`).join(" ");
    
    // Helper to split text nicely into slides
    const splitTextIntoSlides = (text: string, maxCharsPerSlide: number = 180): string[] => {
      const words = text.split(/\s+/);
      const slides: string[] = [];
      let currentSlideWords: string[] = [];
      let currentLength = 0;

      for (const word of words) {
        if (currentLength + word.length + 1 > maxCharsPerSlide) {
          slides.push(currentSlideWords.join(" "));
          currentSlideWords = [word];
          currentLength = word.length;
        } else {
          currentSlideWords.push(word);
          currentLength += word.length + 1;
        }
      }
      if (currentSlideWords.length > 0) {
        slides.push(currentSlideWords.join(" "));
      }
      return slides;
    };

    const textSlides = splitTextIntoSlides(combinedText);
    await updateRoomScriptureState(room.id, reference, textSlides, 0);
  };

  const handleProjectManualScripture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBibleRef.trim() || !manualBibleText.trim()) return;

    // Split paragraphs or lines into slides
    const lines = manualBibleText.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    
    await updateRoomScriptureState(room.id, manualBibleRef.trim(), lines, 0);
  };

  const handleNextScriptureSlide = async () => {
    if (!room.activeScriptureText || room.activeScriptureText.length === 0) return;
    const currentIndex = room.activeScriptureIndex ?? 0;
    const nextIndex = Math.min(room.activeScriptureText.length - 1, currentIndex + 1);
    await updateRoomScriptureState(room.id, room.activeScriptureReference ?? "", room.activeScriptureText, nextIndex);
  };

  const handlePrevScriptureSlide = async () => {
    if (!room.activeScriptureText || room.activeScriptureText.length === 0) return;
    const currentIndex = room.activeScriptureIndex ?? 0;
    const prevIndex = Math.max(0, currentIndex - 1);
    await updateRoomScriptureState(room.id, room.activeScriptureReference ?? "", room.activeScriptureText, prevIndex);
  };

  const handleClearProjectionType = async () => {
    await updateRoomProjectionType(room.id, "none");
  };

  // --- OFFERING ACTION HANDLERS ---
  const handleSaveAndProjectOffering = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingOffering(true);
    try {
      await updateRoomOfferingState(room.id, pixKey.trim(), pixName.trim());
    } catch (err) {
      console.error("Erro ao salvar dados de dízimos:", err);
    } finally {
      setIsSavingOffering(false);
    }
  };

  // Congregation join url
  const joinUrl = `${window.location.origin}/?room=${room.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=059669&data=${encodeURIComponent(joinUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenProjectionTab = () => {
    window.open(`/?room=${room.id}&role=projection`, "_blank");
  };

  return (
    <div className="min-h-screen bg-natural-bg text-natural-text flex flex-col font-sans selection:bg-natural-sage selection:text-white">
      {/* Header Panel */}
      <header className="border-b border-natural-border bg-white sticky top-0 z-30 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-natural-sage text-white rounded-lg shadow-sm">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xs font-bold text-natural-sage/80 uppercase tracking-wider">
              Líder de Projeção
            </h1>
            <p className="text-lg font-serif italic text-[#2D2D2A] font-bold">
              {room.name}
            </p>
          </div>
        </div>

        {/* Room badge & control triggers */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2 bg-natural-cream border border-natural-border rounded-xl flex items-center space-x-2">
            <span className="text-[10px] text-natural-sage/70 font-semibold tracking-wider font-mono">SALA:</span>
            <span className="text-sm font-bold tracking-widest text-natural-sage font-mono uppercase">
              {room.id}
            </span>
          </div>

          <button
            onClick={() => setShowShareModal(true)}
            className="p-2 bg-white hover:bg-natural-bg text-natural-text border border-natural-border hover:border-natural-sage/30 rounded-xl transition flex items-center justify-center cursor-pointer shadow-sm"
            title="Compartilhar com a Congregação"
            id="btn-share-room"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleOpenProjectionTab}
            className="px-3 py-2 bg-natural-sage hover:bg-natural-sage-hover text-white rounded-xl transition text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-sm"
            title="Abrir tela de Datashow em nova aba"
          >
            <Presentation className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Projetar</span>
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-natural-border px-6 flex flex-wrap justify-start items-center gap-x-1 shadow-sm">
        <button
          onClick={() => setActiveTab("projection")}
          className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "projection"
              ? "border-natural-sage text-natural-sage"
              : "border-transparent text-natural-text/50 hover:text-natural-sage"
          }`}
        >
          <Tv className="w-4 h-4" />
          <span>📽️ Louvores e Projeção</span>
        </button>
        <button
          onClick={() => setActiveTab("services")}
          className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "services"
              ? "border-natural-sage text-natural-sage"
              : "border-transparent text-natural-text/50 hover:text-natural-sage"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>⛪ Cultos</span>
          {servicesList.filter(s => s.isActive).length > 0 && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("announcements")}
          className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "announcements"
              ? "border-natural-sage text-natural-sage"
              : "border-transparent text-natural-text/50 hover:text-natural-sage"
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>📢 Avisos</span>
          {room.activeAnnouncementType && room.activeAnnouncementType !== "none" && room.activeProjectionType === "announcement" && (
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("bible")}
          className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "bible"
              ? "border-natural-sage text-natural-sage"
              : "border-transparent text-natural-text/50 hover:text-natural-sage"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>📖 Bíblia Sagrada</span>
          {room.activeProjectionType === "scripture" && (
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("offering")}
          className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "offering"
              ? "border-natural-sage text-natural-sage"
              : "border-transparent text-natural-text/50 hover:text-natural-sage"
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>💸 Dízimos e Ofertas</span>
          {room.activeProjectionType === "offering" && (
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          )}
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === "projection" && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-hidden max-w-7xl w-full mx-auto">
        
        {/* Left column: Song Library & Gemini Search (4 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          
          {/* Quick Search and Add bar */}
          <div className="bg-white border border-natural-border p-5 rounded-2xl shadow-sm">
            <h3 className="text-xs font-bold text-natural-sage uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Adicionar Novo Louvor</span>
            </h3>
            <form onSubmit={handleGeminiSearch} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nome do louvor ou link do Letras.mus.br..."
                  className="w-full pl-10 pr-4 py-2.5 bg-natural-bg border border-natural-border rounded-xl focus:outline-none focus:border-natural-sage text-natural-text placeholder-natural-text/40 text-xs transition"
                  disabled={isSearchingGemini}
                />
                <Search className="absolute left-3 top-3 w-4 h-4 text-natural-sage/50" />
              </div>
              <p className="text-[10px] text-natural-text/50 leading-tight px-1">
                💡 Cole um link do <strong>letras.mus.br</strong> ou pesquise pelo nome para extrair e estruturar em slides automaticamente.
              </p>
              <button
                type="submit"
                className="w-full py-2 bg-natural-sage/10 hover:bg-natural-sage/20 border border-natural-sage/20 text-natural-sage rounded-xl transition text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer"
                disabled={isSearchingGemini}
              >
                {isSearchingGemini ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                <span>{isSearchingGemini ? "Pesquisando..." : "Pesquisar & Adicionar"}</span>
              </button>
            </form>

            {searchMessage && (
              <div className="mt-3 text-[11px] text-natural-text/70 bg-natural-bg p-2.5 rounded-lg border border-natural-border text-center font-mono animate-fade-in">
                {searchMessage}
              </div>
            )}

            <div className="pt-3 mt-3 border-t border-natural-border/60 flex items-center justify-between text-[11px]">
              <span className="text-natural-text/50 font-medium">Não encontrou?</span>
              <button
                onClick={() => setShowManualModal(true)}
                className="text-natural-sage font-bold hover:text-natural-sage-hover cursor-pointer flex items-center space-x-1"
                type="button"
              >
                <Plus className="w-3 h-3" />
                <span>Colar letra manualmente</span>
              </button>
            </div>
          </div>

          {/* Songs Library */}
          <div className="bg-white border border-natural-border rounded-2xl flex-1 flex flex-col overflow-hidden min-h-[300px] shadow-sm">
            <div className="p-4 border-b border-natural-border flex justify-between items-center">
              <h3 className="text-xs font-bold text-natural-sage uppercase tracking-wider flex items-center space-x-1.5">
                <Music className="w-3.5 h-3.5" />
                <span>Biblioteca da Igreja</span>
              </h3>
              <span className="px-2 py-0.5 bg-natural-bg border border-natural-border text-[10px] text-natural-text/70 font-mono rounded font-semibold uppercase">
                {songsList.length} louvores
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {songsList.length === 0 ? (
                <div className="text-center py-8 text-xs text-natural-text/50 font-medium">
                  Sem músicas cadastradas. Pesquise acima para adicionar!
                </div>
              ) : (
                songsList.map((song) => {
                  const isCurrentProjection = room.activeSongId === song.id;
                  return (
                    <div
                      key={song.id}
                      className={`w-full p-2 px-3 rounded-xl transition-all flex items-center justify-between border ${
                        isCurrentProjection
                          ? "bg-natural-sage/10 border-natural-sage/30 text-natural-sage"
                          : "bg-transparent border-transparent hover:bg-natural-bg text-natural-text/80"
                      }`}
                    >
                      <button
                        onClick={() => handleSelectSong(song)}
                        className="flex-1 text-left truncate pr-2 cursor-pointer focus:outline-none"
                      >
                        <p className="font-serif font-bold text-sm tracking-tight text-natural-text hover:text-natural-sage">
                          {song.title}
                        </p>
                        <p className="text-[10px] text-natural-text/50 font-medium tracking-wide uppercase mt-0.5">
                          {song.artist}
                        </p>
                      </button>

                      {/* Quick Add to Worship Service */}
                      {selectedService && (
                        <div className="flex items-center space-x-1.5 flex-shrink-0 pl-1">
                          <select
                            value={songLiturgyCategories[song.id] || "Momento de Louvor"}
                            onChange={(e) => setSongLiturgyCategories(prev => ({ ...prev, [song.id]: e.target.value }))}
                            className="px-1.5 py-0.5 bg-white border border-natural-border rounded text-[10px] text-natural-text/70 focus:outline-none focus:border-natural-sage max-w-[110px]"
                            title="Escolher momento litúrgico"
                          >
                            {LITURGY_CATEGORIES.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleAddSongToService(song)}
                            className="p-1 bg-natural-sage text-white rounded hover:bg-natural-sage-hover transition cursor-pointer"
                            title={`Adicionar ao ${selectedService.title}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right column: Active Song Projection Controls & Live Lyrics (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          
          {/* Miniature Projector Monitor with Left/Right click zones */}
          <div className="bg-slate-950 text-white border border-slate-800 rounded-2xl shadow-xl overflow-hidden relative flex flex-col min-h-[190px] justify-between">
            
            {/* Header of monitor */}
            <div className="px-4 py-3 border-b border-white/5 bg-white/5 flex justify-between items-center z-20">
              <div className="flex items-center space-x-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-300">
                  Monitor do Datashow ({presenterInfo.typeLabel})
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                {presenterInfo.totalSlides > 0 ? `Slide ${presenterInfo.currentSlideIndex + 1} de ${presenterInfo.totalSlides}` : ""}
              </span>
            </div>

            {/* Click/Touch areas */}
            <div className="absolute inset-x-0 top-10 bottom-12 flex z-10 select-none">
              {/* Left Zone (Prev) */}
              <button
                onClick={handlePresenterPrev}
                className="w-1/2 h-full cursor-pointer flex items-center justify-start pl-3 hover:bg-white/[0.02] active:bg-white/[0.05] group text-left transition-colors focus:outline-none"
                title="Slide Anterior"
              >
                <ChevronRight className="w-5 h-5 text-white/5 group-hover:text-white/20 group-active:text-white/40 rotate-180 transition-colors" />
                <span className="text-[9px] uppercase font-mono tracking-wider text-white/5 group-hover:text-white/20 ml-1">
                  Voltar
                </span>
              </button>

              {/* Right Zone (Next) */}
              <button
                onClick={handlePresenterNext}
                className="w-1/2 h-full cursor-pointer flex items-center justify-end pr-3 hover:bg-white/[0.02] active:bg-white/[0.05] group text-right transition-colors focus:outline-none"
                title="Próximo Slide"
              >
                <span className="text-[9px] uppercase font-mono tracking-wider text-white/5 group-hover:text-white/20 mr-1">
                  Avançar
                </span>
                <ChevronRight className="w-5 h-5 text-white/5 group-hover:text-white/20 group-active:text-white/40 transition-colors" />
              </button>
            </div>

            {/* Central Display */}
            <div className="flex-1 p-5 flex flex-col justify-center items-center text-center relative pointer-events-none z-0">
              <h3 className="text-xs font-serif italic text-white/40 mb-2 truncate max-w-lg">
                {presenterInfo.referenceText}
              </h3>
              
              <div className="space-y-1 font-serif text-center w-full max-w-xl py-1 font-medium italic text-[#FDFBF7]">
                {room.isBlackout ? (
                  <p className="text-sm font-mono text-red-400 uppercase tracking-widest animate-pulse">
                    ● Blackout Ativo
                  </p>
                ) : room.isClearText ? (
                  <p className="text-sm font-mono text-amber-400 uppercase tracking-widest animate-pulse">
                    ● Letra Ocultada
                  </p>
                ) : presenterInfo.currentSlideLines.length === 0 ? (
                  <p className="text-xs text-slate-500 font-mono">Sem projeção ativa. Selecione um item.</p>
                ) : (
                  presenterInfo.currentSlideLines.slice(0, 3).map((line, idx) => (
                    <p key={idx} className="text-sm sm:text-base leading-relaxed">
                      {line}
                    </p>
                  ))
                )}
                {presenterInfo.currentSlideLines.length > 3 && (
                  <p className="text-[10px] text-slate-500 font-sans font-normal">...</p>
                )}
              </div>
            </div>

            {/* Quick action bar of monitor */}
            <div className="px-4 py-2.5 border-t border-white/5 bg-white/5 flex justify-between items-center z-20">
              <div className="flex space-x-2">
                <button
                  onClick={toggleBlackout}
                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border cursor-pointer transition ${
                    room.isBlackout
                      ? "bg-red-500/20 border-red-500/40 text-red-400"
                      : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  Blackout
                </button>
                <button
                  onClick={toggleClearText}
                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border cursor-pointer transition ${
                    room.isClearText
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                      : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  Limpar
                </button>
                {selectedSong && (
                  <button
                    onClick={handleClearProject}
                    className="px-2 py-1 bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 text-slate-300 rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Fechar
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[9px] font-mono text-slate-500 hidden sm:inline">
                  Próximo: {presenterInfo.nextSlidePreview.substring(0, 24)}...
                </span>
                <button
                  onClick={() => setIsPresenterModeOpen(true)}
                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider rounded transition cursor-pointer flex items-center space-x-1"
                >
                  <Tv className="w-3 h-3" />
                  <span>Modo Tablet</span>
                </button>
              </div>
            </div>

          </div>

          {/* Liturgical Add Action Bar if active */}
          {selectedSong && selectedService && (
            <div className="bg-white border border-natural-border p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-natural-text/60">Vincular louvor ao culto planejado:</span>
                <select
                  value={songLiturgyCategories[selectedSong.id] || "Momento de Louvor"}
                  onChange={(e) => setSongLiturgyCategories(prev => ({ ...prev, [selectedSong.id]: e.target.value }))}
                  className="px-2 py-1 bg-natural-bg border border-natural-border rounded-lg text-xs text-natural-text/85 focus:outline-none focus:border-natural-sage focus:ring-1 focus:ring-natural-sage/20"
                >
                  {LITURGY_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => handleAddSongToService(selectedSong)}
                className="px-3.5 py-1.5 bg-natural-sage hover:bg-natural-sage-hover text-white rounded-xl font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-sm self-end sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Escalar em: {selectedService.title}</span>
              </button>
            </div>
          )}

          {/* Active Slides Deck */}
          <div className="bg-white border border-natural-border rounded-2xl flex-1 flex flex-col overflow-hidden shadow-sm">
            <div className="p-4 border-b border-natural-border flex justify-between items-center bg-natural-bg">
              <span className="text-xs font-bold text-natural-sage uppercase tracking-wider">
                Slides para Projeção (Clique para Projetar)
              </span>

              {/* Navigation help */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrevSlide}
                  disabled={!selectedSong || room.activeSlideIndex === 0}
                  className="px-2.5 py-1 bg-white border border-natural-border hover:bg-natural-bg disabled:opacity-30 disabled:hover:bg-white text-natural-text/70 hover:text-natural-sage text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  Anterior
                </button>
                <span className="text-xs font-mono font-bold text-natural-sage/80">
                  {selectedSong ? `${room.activeSlideIndex + 1} / ${selectedSong.slides.length}` : "0 / 0"}
                </span>
                <button
                  onClick={handleNextSlide}
                  disabled={!selectedSong || room.activeSlideIndex === selectedSong.slides.length - 1}
                  className="px-2.5 py-1 bg-white border border-natural-border hover:bg-natural-bg disabled:opacity-30 disabled:hover:bg-white text-natural-text/70 hover:text-natural-sage text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  Seguinte
                </button>
              </div>
            </div>

            {/* Slide Cards list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FDFDFB]">
              {!selectedSong ? (
                <div className="flex flex-col items-center justify-center h-full text-natural-text/40 py-12">
                  <Presentation className="w-12 h-12 text-natural-sage/20 mb-2" />
                  <p className="text-xs font-bold uppercase tracking-wider text-natural-sage/50">Nenhum louvor ativo na projeção.</p>
                  <p className="text-[11px] text-natural-text/50 mt-1">Selecione uma música da biblioteca para começar!</p>
                </div>
              ) : (
                selectedSong.slides.map((slide, index) => {
                  const isCurrent = room.activeSlideIndex === index;
                  return (
                    <button
                      key={index}
                      onClick={() => handleSelectSlide(index)}
                      className={`w-full text-left p-4 rounded-xl transition border text-sm flex flex-col cursor-pointer ${
                        isCurrent
                          ? "bg-natural-sage/10 border-natural-sage text-natural-sage shadow-md ring-1 ring-natural-sage/10"
                          : "bg-white border-natural-border hover:bg-natural-bg text-natural-text"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full border-b border-natural-border/60 pb-2 mb-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider font-mono ${isCurrent ? "text-natural-sage" : "text-natural-text/40"}`}>
                          Slide {index + 1} • {slide.type}
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 bg-natural-sage text-white text-[9px] font-bold rounded uppercase tracking-wider">
                            No Datashow
                          </span>
                        )}
                      </div>
                      
                      {/* Lines of the slide */}
                      <div className="space-y-1.5 font-serif text-center w-full py-2 font-medium italic text-natural-text">
                        {slide.lines.map((line, idx) => (
                          <p key={idx} className="text-base sm:text-lg leading-relaxed">
                            {line}
                          </p>
                        ))}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    )}

      {/* Services Grid */}
      {activeTab === "services" && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-hidden max-w-7xl w-full mx-auto animate-fade-in">
          {/* Left Column (4 cols): Worship Services (Cultos) List */}
          <div className="lg:col-span-4 flex flex-col space-y-6">
            <div className="bg-white border border-natural-border p-5 rounded-2xl shadow-sm flex flex-col h-full">
              <div className="flex items-center justify-between mb-4 border-b border-natural-border/60 pb-3">
                <h3 className="text-xs font-bold text-natural-sage uppercase tracking-wider flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>Cultos Cadastrados</span>
                </h3>
                <button
                  onClick={() => setShowAddServiceModal(true)}
                  className="px-2.5 py-1 bg-natural-sage hover:bg-natural-sage-hover text-white rounded-lg text-xs font-bold flex items-center space-x-1 transition cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Novo Culto</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[300px]">
                {servicesList.length === 0 ? (
                  <div className="text-center py-12 text-xs text-natural-text/50 font-medium">
                    Nenhum culto cadastrado para este mês.<br />Clique em "Novo Culto" para começar!
                  </div>
                ) : (
                  servicesList.map((service) => {
                    const isSelected = selectedService?.id === service.id;
                    const formattedDate = service.date ? service.date.split("-").reverse().join("/") : "Sem data";
                    return (
                      <div
                        key={service.id}
                        onClick={() => setSelectedService(service)}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-3 ${
                          isSelected
                            ? "bg-natural-sage/5 border-natural-sage shadow-sm"
                            : "bg-white border-natural-border hover:bg-natural-bg"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <p className="font-serif font-bold text-sm text-natural-text">
                              {service.title}
                            </p>
                            <p className="text-[10px] text-natural-text/50 font-semibold uppercase mt-0.5 tracking-wider font-mono flex items-center space-x-1">
                              <Calendar className="w-3 h-3 text-natural-sage/70" />
                              <span>{formattedDate}</span>
                            </p>
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteService(service.id);
                            }}
                            className="p-1 text-natural-text/30 hover:text-red-600 rounded transition cursor-pointer"
                            title="Excluir Culto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Toggle Active status */}
                        <div className="flex items-center justify-between border-t border-natural-border/50 pt-2 text-[11px]">
                          <span className="text-natural-text/50 font-medium">
                            Status do Culto:
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleServiceActive(service.id, service.isActive);
                            }}
                            className={`px-2 py-0.5 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center space-x-1 border cursor-pointer transition ${
                              service.isActive
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 font-semibold"
                                : "bg-natural-bg border-natural-border text-natural-text/40"
                            }`}
                          >
                            {service.isActive ? (
                              <>
                                <CheckSquare className="w-3 h-3" />
                                <span>Em Uso Ativo</span>
                              </>
                            ) : (
                              <>
                                <Square className="w-3 h-3" />
                                <span>Inativo / Planejado</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column (8 cols): Selected Worship Service Details & Liturgical Program */}
          <div className="lg:col-span-8 flex flex-col space-y-6">
            {!selectedService ? (
              <div className="bg-white border border-natural-border rounded-2xl flex-1 flex flex-col items-center justify-center p-12 text-center shadow-sm">
                <Calendar className="w-16 h-16 text-natural-sage/10 mb-3" />
                <h3 className="text-sm font-bold text-natural-text/60">Nenhum Culto Selecionado</h3>
                <p className="text-xs text-natural-text/40 mt-1 max-w-sm leading-relaxed">
                  Crie um novo culto ou escolha um da lista ao lado para planejar a escala de louvores com a liturgia da igreja.
                </p>
              </div>
            ) : (
              <div className="bg-white border border-natural-border rounded-2xl flex-1 flex flex-col overflow-hidden shadow-sm">
                {/* Service Header */}
                <div className="p-5 border-b border-natural-border bg-natural-bg/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-lg font-serif italic font-bold text-natural-text">
                        {selectedService.title}
                      </h2>
                      {selectedService.isActive && (
                        <span className="px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-bold rounded uppercase tracking-wider animate-pulse">
                          Ativo / Em Uso
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-natural-text/50 font-medium uppercase mt-0.5 tracking-wide">
                      Data do Culto: {selectedService.date ? selectedService.date.split("-").reverse().join("/") : "Sem data"}
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab("projection")}
                    className="px-3 py-1.5 bg-natural-sage/10 hover:bg-natural-sage/20 text-natural-sage rounded-xl transition text-xs font-bold flex items-center space-x-1 border border-natural-sage/20 cursor-pointer self-start sm:self-auto shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Mais Músicas</span>
                  </button>
                </div>

                {/* Liturgical Schedule List */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-[#FDFDFB]">
                  <div className="flex items-center justify-between pb-2 border-b border-natural-border/60">
                    <span className="text-xs font-bold text-natural-sage uppercase tracking-wider">
                      Ordem Litúrgica de Louvor
                    </span>
                    <span className="text-[10px] font-mono text-natural-text/50 font-bold uppercase">
                      {(selectedService.items || []).length} louvores escalados
                    </span>
                  </div>

                  {(!selectedService.items || selectedService.items.length === 0) ? (
                    <div className="flex flex-col items-center justify-center py-16 text-natural-text/40">
                      <Layers className="w-12 h-12 text-natural-sage/20 mb-2" />
                      <p className="text-xs font-bold uppercase tracking-wider text-natural-sage/50">Nenhum louvor escalado.</p>
                      <p className="text-[11px] text-natural-text/50 mt-1 max-w-md text-center leading-relaxed">
                        Mude para a aba <strong>📽️ Projeção e Biblioteca</strong> para pesquisar ou escolher louvores e adicioná-los com a classificação litúrgica desejada!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {selectedService.items.map((item, idx) => {
                        const isCurrentProjection = room.activeSongId === item.songId;
                        return (
                          <div
                            key={item.id}
                            className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white ${
                              isCurrentProjection
                                ? "border-natural-sage ring-1 ring-natural-sage/20 shadow-md animate-pulse"
                                : "border-natural-border hover:border-natural-sage/30 shadow-sm"
                            }`}
                          >
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                              {/* Order Indicator */}
                              <div className="w-6 h-6 rounded-lg bg-natural-bg border border-natural-border flex items-center justify-center text-xs font-mono font-bold text-natural-text/40 flex-shrink-0 mt-0.5">
                                {idx + 1}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                  <span className="px-2.5 py-0.5 bg-natural-sage/15 border border-natural-sage/20 text-natural-sage text-[9px] font-bold rounded uppercase tracking-wider">
                                    {item.liturgyCategory}
                                  </span>
                                  {isCurrentProjection && (
                                    <span className="px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-bold rounded uppercase tracking-wider">
                                      Ativa no Datashow
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-serif font-bold text-base text-natural-text truncate">
                                  {item.songTitle}
                                </h4>
                                <p className="text-xs text-natural-text/50 uppercase mt-0.5 tracking-wide">
                                  Por {item.songArtist}
                                </p>
                              </div>
                            </div>

                            {/* Actions Area */}
                            <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                              {/* Move Up/Down */}
                              <div className="flex items-center border border-natural-border/60 rounded-lg bg-natural-bg overflow-hidden">
                                <button
                                  onClick={() => handleMoveSongInService(item.id, "up")}
                                  disabled={idx === 0}
                                  className="p-1.5 hover:bg-natural-cream text-natural-text/50 hover:text-natural-sage transition disabled:opacity-30 cursor-pointer border-r border-natural-border/60"
                                  title="Mover para Cima"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleMoveSongInService(item.id, "down")}
                                  disabled={idx === (selectedService.items || []).length - 1}
                                  className="p-1.5 hover:bg-natural-cream text-natural-text/50 hover:text-natural-sage transition disabled:opacity-30 cursor-pointer"
                                  title="Mover para Baixo"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Project Now Button */}
                              <button
                                onClick={() => handleProjectServiceSong(item)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer shadow-sm ${
                                  isCurrentProjection
                                    ? "bg-natural-sage text-white"
                                    : "bg-emerald-500 hover:bg-emerald-600 text-white"
                                }`}
                                title="Lançar letra no Datashow e controlar slides"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>{isCurrentProjection ? "Controlar Projeção" : "Projetar"}</span>
                              </button>

                              {/* Remove Button */}
                              <button
                                onClick={() => handleRemoveSongFromService(item.id)}
                                className="p-2 text-natural-text/30 hover:text-red-600 border border-natural-border/60 hover:border-red-200 rounded-lg bg-natural-bg hover:bg-red-50 transition cursor-pointer"
                                title="Remover do Culto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "announcements" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Announcements Header Actions */}
          <div className="bg-white border-b border-natural-border px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-base font-serif italic font-bold text-natural-text">📢 Central de Avisos e Loops de Mídia</h2>
              <p className="text-xs text-natural-text/60 mt-0.5 font-medium">
                Crie avisos e projete no Datashow. Escolha o loop automático para o pré-culto ou slides de passagem manual para o fim do culto.
              </p>
            </div>
            
            <button
              onClick={() => {
                setEditingAnnId(null);
                setAnnTitle("");
                setAnnLinesText("");
                setAnnType("pre-service");
                setShowAnnModal(true);
              }}
              className="px-4 py-2 bg-natural-sage hover:bg-natural-sage-hover text-white rounded-xl transition text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-sm"
              id="btn-new-announcement"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Aviso</span>
            </button>
          </div>
          
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-y-auto max-w-7xl w-full mx-auto">
            {/* Left Column: Pre-service loop control and library (6 cols) */}
            <div className="lg:col-span-6 flex flex-col space-y-4">
              <div className="bg-white border border-natural-border p-6 rounded-2xl shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-base font-serif italic font-bold text-natural-text flex items-center gap-2">
                      <span className="p-1.5 bg-cyan-50 text-cyan-600 rounded-lg"><RefreshCw className="w-4 h-4 animate-spin-slow" /></span>
                      Loop de Pré-Culto (Jovem)
                    </h3>
                    <p className="text-xs text-natural-text/60 font-medium mt-1">
                      Slides que ficam ciclando sozinhos na tela com fundo gradiente moderno antes do culto começar.
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleToggleAnnouncementMode(room.activeAnnouncementType === "pre-service" ? "none" : "pre-service")}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-sm ${
                      room.activeAnnouncementType === "pre-service"
                        ? "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                        : "bg-cyan-500 hover:bg-cyan-600 text-white"
                    }`}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{room.activeAnnouncementType === "pre-service" ? "Parar Loop" : "Projetar Loop"}</span>
                  </button>
                </div>

                {/* Loop Status Bar */}
                <div className={`p-4 rounded-xl border flex items-center justify-between mb-6 ${
                  room.activeAnnouncementType === "pre-service"
                    ? "bg-cyan-50/50 border-cyan-100 text-cyan-800"
                    : "bg-slate-50 border-slate-200 text-slate-500"
                }`}>
                  <div className="flex items-center space-x-3">
                    <span className={`w-3 h-3 rounded-full ${room.activeAnnouncementType === "pre-service" ? "bg-cyan-500 animate-ping" : "bg-slate-300"}`} />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider">
                        {room.activeAnnouncementType === "pre-service" ? "Ativo no Datashow" : "Inativo"}
                      </p>
                      <p className="text-[10px] opacity-75">
                        {room.activeAnnouncementType === "pre-service" ? "Transição automática de 7 segundos" : "Clique no botão para projetar"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pre-service list */}
                <div className="space-y-3">
                  {announcements.filter(a => a.type === "pre-service").length === 0 ? (
                    <div className="p-8 border border-dashed border-natural-border rounded-xl text-center text-natural-text/40 text-xs">
                      Nenhum aviso cadastrado para o pré-culto.
                    </div>
                  ) : (
                    announcements.filter(a => a.type === "pre-service").map((ann, idx) => (
                      <div key={ann.id} className="p-4 bg-natural-bg border border-natural-border hover:border-natural-sage/20 rounded-xl transition flex flex-col space-y-3 relative">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-cyan-600 uppercase bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded mr-2">
                              Slide {idx + 1}
                            </span>
                            <span className="text-xs font-bold text-natural-text">{ann.title}</span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <button
                              onClick={() => handleEditAnnouncementClick(ann)}
                              className="p-1.5 text-natural-text/50 hover:text-natural-sage hover:bg-white rounded transition cursor-pointer"
                              title="Editar"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteAnnouncementClick(ann.id)}
                              className="p-1.5 text-natural-text/30 hover:text-red-600 hover:bg-white rounded transition cursor-pointer"
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="text-[11px] font-serif italic text-natural-text/70 pl-2 border-l-2 border-cyan-200 space-y-0.5">
                          {ann.lines.map((line, lidx) => (
                            <p key={lidx}>{line}</p>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Post-service manual slides control (6 cols) */}
            <div className="lg:col-span-6 flex flex-col space-y-4">
              <div className="bg-white border border-natural-border p-6 rounded-2xl shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-base font-serif italic font-bold text-natural-text flex items-center gap-2">
                      <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><Megaphone className="w-4 h-4" /></span>
                      Avisos de Fim de Culto (Manual)
                    </h3>
                    <p className="text-xs text-natural-text/60 font-medium mt-1">
                      Slides de avisos que você passa manualmente na mesa de som conforme o locutor fala.
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleToggleAnnouncementMode(room.activeAnnouncementType === "post-service" ? "none" : "post-service")}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-sm ${
                      room.activeAnnouncementType === "post-service"
                        ? "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                        : "bg-emerald-500 hover:bg-emerald-600 text-white"
                    }`}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{room.activeAnnouncementType === "post-service" ? "Parar Slides" : "Projetar Slides"}</span>
                  </button>
                </div>

                {/* Post-service Status and Controller */}
                <div className={`p-4 rounded-xl border flex flex-col space-y-4 mb-6 ${
                  room.activeAnnouncementType === "post-service"
                    ? "bg-emerald-50/50 border-emerald-100 text-emerald-800"
                    : "bg-slate-50 border-slate-200 text-slate-500"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className={`w-3 h-3 rounded-full ${room.activeAnnouncementType === "post-service" ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider">
                          {room.activeAnnouncementType === "post-service" ? "Ativo no Datashow" : "Inativo"}
                        </p>
                        <p className="text-[10px] opacity-75">
                          {room.activeAnnouncementType === "post-service" ? `Aviso atual: ${room.activeAnnouncementIndex + 1} de ${announcements.filter(a => a.type === "post-service").length}` : "Clique no botão para projetar"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Manual control buttons if active */}
                  {room.activeAnnouncementType === "post-service" && announcements.filter(a => a.type === "post-service").length > 0 && (
                    <div className="flex flex-col space-y-3 bg-white p-3 rounded-lg border border-emerald-100">
                      <div className="flex justify-between items-center gap-2">
                        <button
                          onClick={handlePrevAnnouncementSlide}
                          disabled={room.activeAnnouncementIndex === 0}
                          className="flex-1 py-1.5 bg-natural-cream hover:bg-natural-cream-hover text-natural-sage font-bold text-xs rounded-lg transition disabled:opacity-30 cursor-pointer border border-natural-border"
                        >
                          ← Anterior
                        </button>
                        <button
                          onClick={handleNextAnnouncementSlide}
                          disabled={room.activeAnnouncementIndex === announcements.filter(a => a.type === "post-service").length - 1}
                          className="flex-1 py-1.5 bg-natural-sage hover:bg-natural-sage-hover text-white font-bold text-xs rounded-lg transition disabled:opacity-30 cursor-pointer"
                        >
                          Próximo →
                        </button>
                      </div>

                      {/* Quick Select Slide Bubbles */}
                      <div className="flex flex-wrap gap-1.5 justify-center pt-1">
                        {announcements.filter(a => a.type === "post-service").map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => updateRoomAnnouncementState(room.id, "post-service", idx)}
                            className={`w-7 h-7 rounded-full text-xs font-mono font-bold transition flex items-center justify-center cursor-pointer ${
                              idx === room.activeAnnouncementIndex
                                ? "bg-natural-sage text-white"
                                : "bg-natural-bg hover:bg-natural-cream text-natural-text border border-natural-border/60"
                            }`}
                          >
                            {idx + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Post-service list */}
                <div className="space-y-3">
                  {announcements.filter(a => a.type === "post-service").length === 0 ? (
                    <div className="p-8 border border-dashed border-natural-border rounded-xl text-center text-natural-text/40 text-xs">
                      Nenhum aviso cadastrado para o fim do culto.
                    </div>
                  ) : (
                    announcements.filter(a => a.type === "post-service").map((ann, idx) => {
                      const isCurrent = room.activeAnnouncementType === "post-service" && idx === room.activeAnnouncementIndex;
                      return (
                        <div
                          key={ann.id}
                          className={`p-4 border rounded-xl transition flex flex-col space-y-3 relative ${
                            isCurrent
                              ? "bg-emerald-50/10 border-emerald-300 ring-2 ring-emerald-500/15"
                              : "bg-natural-bg border-natural-border hover:border-natural-sage/20"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                                isCurrent
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-slate-100 text-slate-700"
                              }`}>
                                Slide {idx + 1}
                              </span>
                              <span className="text-xs font-bold text-natural-text">{ann.title}</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              {/* Project directly trigger */}
                              <button
                                onClick={() => {
                                  handleToggleAnnouncementMode("post-service");
                                  updateRoomAnnouncementState(room.id, "post-service", idx);
                                }}
                                className={`p-1 hover:bg-white rounded text-[10px] font-bold uppercase tracking-wider px-2 border transition ${
                                  isCurrent
                                    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                    : "bg-white text-natural-sage border-natural-border hover:border-natural-sage/20"
                                }`}
                              >
                                {isCurrent ? "Projetando" : "Lançar na Tela"}
                              </button>
                              <button
                                onClick={() => handleEditAnnouncementClick(ann)}
                                className="p-1.5 text-natural-text/50 hover:text-natural-sage hover:bg-white rounded transition cursor-pointer"
                                title="Editar"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteAnnouncementClick(ann.id)}
                                className="p-1.5 text-natural-text/30 hover:text-red-600 hover:bg-white rounded transition cursor-pointer"
                                title="Excluir"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="text-[11px] font-serif italic text-natural-text/70 pl-2 border-l-2 border-emerald-300 space-y-0.5">
                            {ann.lines.map((line, lidx) => (
                              <p key={lidx}>{line}</p>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "bible" && (
        <div className="flex-1 flex flex-col p-6 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">
          {/* Active Scripture Controller Bar (Sticky/Top) */}
          {room.activeProjectionType === "scripture" && (
            <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm animate-fade-in">
              <div className="flex items-center space-x-3.5">
                <span className="p-2.5 bg-emerald-500 text-white rounded-xl animate-pulse"><BookOpen className="w-5 h-5" /></span>
                <div>
                  <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-widest font-mono">Bíblia no Projetor</h4>
                  <p className="text-sm font-serif font-bold text-emerald-950 italic mt-0.5">
                    {room.activeScriptureReference || "Escritura Ativa"}
                  </p>
                </div>
              </div>

              {/* Slider Controls */}
              {room.activeScriptureText && room.activeScriptureText.length > 0 && (
                <div className="flex items-center space-x-3 bg-white px-4 py-2 border border-emerald-100 rounded-xl">
                  <button
                    onClick={handlePrevScriptureSlide}
                    disabled={room.activeScriptureIndex === 0}
                    className="p-1.5 hover:bg-natural-bg rounded-lg text-emerald-800 disabled:opacity-30 cursor-pointer text-xs font-bold transition"
                  >
                    ← Ant
                  </button>
                  <span className="text-xs font-mono font-bold text-emerald-900">
                    Slide {room.activeScriptureIndex !== undefined ? room.activeScriptureIndex + 1 : 1} / {room.activeScriptureText.length}
                  </span>
                  <button
                    onClick={handleNextScriptureSlide}
                    disabled={room.activeScriptureIndex === room.activeScriptureText.length - 1}
                    className="p-1.5 hover:bg-natural-bg rounded-lg text-emerald-800 disabled:opacity-30 cursor-pointer text-xs font-bold transition"
                  >
                    Próx →
                  </button>
                </div>
              )}

              <button
                onClick={handleClearProjectionType}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Parar Projeção
              </button>
            </div>
          )}

          {/* Active Scripture Text Preview */}
          {room.activeProjectionType === "scripture" && room.activeScriptureText && room.activeScriptureText.length > 0 && (
            <div className="bg-slate-900 text-white p-6 rounded-2xl text-center border border-slate-800 shadow-inner">
              <p className="text-xs font-mono tracking-widest uppercase text-slate-400 mb-2">Visualização Atual no Datashow</p>
              <p className="text-xl font-serif italic text-[#FDFBF7] font-medium leading-relaxed max-w-2xl mx-auto">
                "{room.activeScriptureText[room.activeScriptureIndex ?? 0]}"
              </p>
            </div>
          )}

          {/* Main Workspace: Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Box: Bible API Search (5 cols) */}
            <div className="lg:col-span-5 bg-white border border-natural-border p-6 rounded-2xl shadow-sm space-y-5">
              <div>
                <h3 className="text-base font-serif italic font-bold text-natural-text flex items-center gap-2">
                  <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><Search className="w-4 h-4" /></span>
                  Busca Rápida na Bíblia (API)
                </h3>
                <p className="text-xs text-natural-text/60 mt-1 font-medium">
                  Selecione a versão, livro e capítulo para consultar e projetar de forma instantânea.
                </p>
              </div>

              <form onSubmit={handleFetchBible} className="space-y-4">
                {/* Version Selector */}
                <div>
                  <label className="block text-[10px] font-bold text-natural-sage uppercase tracking-wider mb-2">
                    Versão da Bíblia
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["nvi", "ra", "acf"] as const).map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setBibleVersion(v)}
                        className={`py-1.5 text-xs font-bold rounded-lg uppercase tracking-wider transition border ${
                          bibleVersion === v
                            ? "bg-natural-sage text-white border-natural-sage shadow-sm"
                            : "bg-natural-bg hover:bg-natural-cream text-natural-text/70 border-natural-border"
                        }`}
                      >
                        {v === "nvi" ? "NVI" : v === "ra" ? "Almeida RA" : "Almeida ACF"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Book Selector */}
                <div>
                  <label className="block text-[10px] font-bold text-natural-sage uppercase tracking-wider mb-1.5">
                    Livro
                  </label>
                  <select
                    value={bibleBookAbbrev}
                    onChange={(e) => {
                      const selectedAbbrev = e.target.value;
                      setBibleBookAbbrev(selectedAbbrev);
                      const bookObj = BIBLE_BOOKS.find(b => b.abbrev === selectedAbbrev);
                      if (bookObj) {
                        setBibleBookName(bookObj.name);
                      }
                    }}
                    className="w-full px-3 py-2 bg-natural-bg border border-natural-border rounded-xl focus:outline-none focus:border-natural-sage text-natural-text text-xs cursor-pointer"
                  >
                    {BIBLE_BOOKS.map((b) => (
                      <option key={b.abbrev} value={b.abbrev}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Chapter & Trigger */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-natural-sage uppercase tracking-wider mb-1.5">
                      Capítulo
                    </label>
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => setBibleChapter(c => Math.max(1, c - 1))}
                        className="p-2 bg-natural-bg border border-natural-border hover:bg-natural-cream text-natural-text rounded-lg transition text-xs font-bold"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={bibleChapter}
                        onChange={(e) => setBibleChapter(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full text-center py-1 bg-natural-bg border border-natural-border rounded-lg text-xs font-bold text-natural-text"
                      />
                      <button
                        type="button"
                        onClick={() => setBibleChapter(c => c + 1)}
                        className="p-2 bg-natural-bg border border-natural-border hover:bg-natural-cream text-natural-text rounded-lg transition text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={isFetchingBible}
                      className="w-full py-2 bg-natural-sage hover:bg-natural-sage-hover disabled:bg-natural-sage/50 text-white rounded-xl font-bold text-xs tracking-wider uppercase transition shadow-sm cursor-pointer"
                    >
                      {isFetchingBible ? "Carregando..." : "Carregar Capítulo"}
                    </button>
                  </div>
                </div>
              </form>

              {bibleError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-[11px] leading-relaxed">
                  {bibleError}
                </div>
              )}
            </div>

            {/* Right Box: Chapter Verses & Selection (7 cols) */}
            <div className="lg:col-span-7 bg-white border border-natural-border p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-serif italic font-bold text-natural-text flex items-center gap-2">
                    <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><BookOpen className="w-4 h-4" /></span>
                    Versículos de {bibleBookName} {bibleChapter}
                  </h3>
                  <p className="text-xs text-natural-text/60 mt-1 font-medium">
                    {fetchedVerses.length > 0 
                      ? "Selecione versículos específicos para projetar ou projete o capítulo inteiro."
                      : "Carregue o capítulo ao lado para visualizar os versículos."}
                  </p>
                </div>

                {fetchedVerses.length > 0 && (
                  <button
                    onClick={handleProjectSelectedScripture}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer flex items-center space-x-1.5"
                  >
                    <span>📺 Projetar</span>
                    {selectedVerseNumbers.length > 0 && (
                      <span className="bg-emerald-800 text-[10px] text-white px-1.5 py-0.5 rounded-full">
                        {selectedVerseNumbers.length}
                      </span>
                    )}
                  </button>
                )}
              </div>

              {fetchedVerses.length > 0 ? (
                <div className="border border-natural-border rounded-xl divide-y divide-natural-border/60 max-h-[350px] overflow-y-auto">
                  {fetchedVerses.map((v) => {
                    const isSelected = selectedVerseNumbers.includes(v.number);
                    return (
                      <div
                        key={v.number}
                        onClick={() => handleToggleVerseSelection(v.number)}
                        className={`p-3 text-xs flex gap-3 transition cursor-pointer select-none ${
                          isSelected
                            ? "bg-emerald-500/10 hover:bg-emerald-500/15 text-natural-text font-medium"
                            : "hover:bg-natural-bg text-natural-text/80"
                        }`}
                      >
                        <span className={`font-mono font-extrabold flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border text-[10px] ${
                          isSelected 
                            ? "bg-emerald-600 border-emerald-600 text-white" 
                            : "bg-natural-bg border-natural-border text-natural-text/40"
                        }`}>
                          {v.number}
                        </span>
                        <p className="leading-relaxed pt-0.5">{v.text}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-16 border border-dashed border-natural-border rounded-2xl flex flex-col justify-center items-center text-center space-y-3">
                  <span className="p-3 bg-natural-bg text-natural-text/40 rounded-full"><BookOpen className="w-6 h-6" /></span>
                  <p className="text-xs font-medium text-natural-text/50 max-w-sm">
                    Nenhum capítulo carregado ainda. Escolha o livro e o capítulo ao lado e clique em <strong>Carregar Capítulo</strong> para visualizar a lista completa de versículos aqui.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Card: Manual Scripture Textbox */}
          <div className="bg-white border border-natural-border p-6 rounded-2xl shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-serif italic font-bold text-natural-text flex items-center gap-2">
                <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><Edit3 className="w-4 h-4" /></span>
                Editor Manual de Escrituras
              </h3>
              <p className="text-xs text-natural-text/60 mt-1 font-medium">
                Insira qualquer texto bíblico ou passagem para dividir automaticamente em slides de projeção.
              </p>
            </div>

            <form onSubmit={handleProjectManualScripture} className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4 space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-natural-sage uppercase tracking-wider mb-1">
                    Referência Bíblica *
                  </label>
                  <input
                    type="text"
                    required
                    value={manualBibleRef}
                    onChange={(e) => setManualBibleRef(e.target.value)}
                    placeholder="Ex: Hebreus 11:1-3 (Tradução Livre)"
                    className="w-full px-3 py-2 bg-natural-bg border border-natural-border rounded-xl focus:outline-none focus:border-natural-sage text-natural-text text-xs transition"
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-sm cursor-pointer"
                  >
                    📖 Projetar Manualmente
                  </button>
                </div>
              </div>

              <div className="md:col-span-8">
                <label className="block text-[10px] font-bold text-natural-sage uppercase tracking-wider mb-1">
                  Texto ou Versículos *
                </label>
                <textarea
                  required
                  value={manualBibleText}
                  onChange={(e) => setManualBibleText(e.target.value)}
                  placeholder={`Cole ou digite o texto bíblico aqui...\n\nVocê pode quebrar linhas ou parágrafos para forçar novos slides de projeção.`}
                  rows={4}
                  className="w-full px-3 py-2 bg-natural-bg border border-natural-border rounded-xl focus:outline-none focus:border-natural-sage text-natural-text text-xs font-serif italic transition resize-none"
                />
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === "offering" && (
        <div className="flex-1 flex flex-col p-6 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Box: Configuration Form (5 cols) */}
            <div className="lg:col-span-5 bg-white border border-natural-border p-6 rounded-2xl shadow-sm space-y-5">
              <div>
                <h3 className="text-base font-serif italic font-bold text-natural-text flex items-center gap-2">
                  <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg"><HeartHandshake className="w-4 h-4" /></span>
                  Configurações de Dízimos & Ofertas
                </h3>
                <p className="text-xs text-natural-text/60 mt-1 font-medium">
                  Preencha a chave PIX e o nome da paróquia para projetar automaticamente o QR Code no Datashow.
                </p>
              </div>

              <form onSubmit={handleSaveAndProjectOffering} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-natural-sage uppercase tracking-wider mb-1.5">
                    Chave PIX da Paróquia *
                  </label>
                  <input
                    type="text"
                    required
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    placeholder="Ex: CNPJ, E-mail, Celular ou Chave Aleatória"
                    className="w-full px-3 py-2 bg-natural-bg border border-natural-border rounded-xl focus:outline-none focus:border-natural-sage text-natural-text text-xs transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-natural-sage uppercase tracking-wider mb-1.5">
                    Nome do Beneficiário / Paróquia *
                  </label>
                  <input
                    type="text"
                    required
                    value={pixName}
                    onChange={(e) => setPixName(e.target.value)}
                    placeholder="Ex: Paróquia Bom Samaritano"
                    className="w-full px-3 py-2 bg-natural-bg border border-natural-border rounded-xl focus:outline-none focus:border-natural-sage text-natural-text text-xs transition"
                  />
                </div>

                <div className="pt-2 space-y-3">
                  <button
                    type="submit"
                    disabled={isSavingOffering}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-400 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-sm cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <span>📺 Salvar e Projetar no Datashow</span>
                  </button>

                  {room.activeProjectionType === "offering" ? (
                    <button
                      type="button"
                      onClick={handleClearProjectionType}
                      className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-bold text-xs transition cursor-pointer"
                    >
                      Parar Projeção de Ofertas
                    </button>
                  ) : (
                    <div className="text-center">
                      <span className="text-[10px] text-natural-text/40 font-mono font-bold uppercase">Projeção Inativa</span>
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Right Box: Projector Live Preview (7 cols) */}
            <div className="lg:col-span-7 bg-[#142319] text-[#FDFBF7] p-8 md:p-10 rounded-2xl shadow-2xl relative border border-[#1e3425] overflow-hidden">
              <div className="absolute top-3 right-3 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded text-[9px] font-mono uppercase tracking-widest font-bold">
                Pré-visualização
              </div>

              <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-center select-none">
                {/* Left Side: Scriptures */}
                <div className="md:col-span-7 text-left space-y-4">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[9px] font-mono uppercase tracking-wider font-bold">
                    Ofertório Sagrado
                  </span>
                  <h4 className="text-2xl font-serif font-bold italic tracking-wide text-emerald-300">
                    Dízimos & Ofertas
                  </h4>
                  <div className="border-l border-emerald-500/30 pl-3 space-y-2">
                    <p className="text-sm font-serif italic text-white/95 leading-relaxed">
                      "Cada um contribua conforme propôs no seu coração; não com tristeza ou por necessidade; porque Deus ama ao que dá com alegria."
                    </p>
                    <p className="text-[10px] font-mono font-bold uppercase text-emerald-400 tracking-wider">
                      2 Coríntios 9:7
                    </p>
                  </div>
                </div>

                {/* Right Side: QR Code Panel */}
                <div className="md:col-span-5 flex flex-col items-center p-4 bg-white rounded-xl text-natural-text border border-natural-border/20 shadow-lg">
                  <p className="text-[9px] font-mono uppercase tracking-widest font-bold text-natural-sage mb-2">
                    Contribua pelo PIX
                  </p>
                  
                  <div className="p-2 bg-natural-bg rounded-lg border border-natural-border/30">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=142319&data=${encodeURIComponent(pixKey || "pix@paroquia.com")}`}
                      alt="QR Code Pix"
                      referrerPolicy="no-referrer"
                      className="w-28 h-28 rounded-md"
                    />
                  </div>

                  <div className="text-center mt-3 w-full">
                    <p className="text-[10px] font-bold text-natural-text truncate max-w-[130px] mx-auto">
                      {pixName || "Paróquia Bom Samaritano"}
                    </p>
                    <div className="mt-1 px-2 py-0.5 bg-natural-bg border border-natural-border/40 rounded-md text-[8px] font-mono text-natural-sage font-bold flex items-center justify-center gap-1 select-all">
                      <span className="truncate max-w-[100px]">{pixKey || "pix@paroquia.com"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share / QR Code Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-natural-border w-full max-w-sm p-6 rounded-2xl shadow-2xl relative">
            <h3 className="text-base font-serif italic font-bold text-natural-text mb-2">Conectar Congregação</h3>
            <p className="text-xs text-natural-text/60 mb-6 font-medium">
              Membros podem escanear o QR Code abaixo para acompanhar as letras em tempo real nos próprios celulares.
            </p>

            <div className="bg-natural-bg p-4 border border-natural-border rounded-xl flex justify-center items-center mb-6">
              <img 
                src={qrCodeUrl} 
                alt="QR Code de acesso" 
                className="w-48 h-48 rounded"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-natural-bg border border-natural-border rounded-xl">
                <div>
                  <p className="text-[10px] text-natural-sage/70 font-semibold uppercase font-mono tracking-wider">Código de Acesso</p>
                  <p className="text-base font-bold tracking-widest text-natural-sage font-mono">{room.id}</p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(room.id);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="p-2 bg-natural-cream hover:bg-natural-cream-hover text-natural-sage rounded-lg transition border border-natural-border cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 bg-natural-sage hover:bg-natural-sage-hover text-white rounded-xl font-bold text-xs transition flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Link Copiado!" : "Copiar Link de Acompanhamento"}</span>
              </button>

              <button
                onClick={() => setShowShareModal(false)}
                className="w-full py-2 bg-natural-cream hover:bg-natural-cream-hover text-natural-text rounded-xl text-xs font-semibold transition cursor-pointer border border-natural-border"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Song Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-natural-border w-full max-w-lg p-6 rounded-2xl shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="mb-4">
              <h3 className="text-lg font-serif italic font-bold text-natural-text">Adicionar Louvor Manualmente</h3>
              <p className="text-xs text-natural-text/60 font-medium">
                Digite ou cole a letra completa do louvor. Ela será dividida automaticamente em slides elegantes.
              </p>
            </div>

            <form onSubmit={handleSaveManualSong} className="flex-1 flex flex-col overflow-hidden space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-natural-sage uppercase tracking-wider mb-1">
                    Título do Louvor *
                  </label>
                  <input
                    type="text"
                    required
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="Ex: Alvo Mais Que a Neve"
                    className="w-full px-3 py-2 bg-natural-bg border border-natural-border rounded-xl focus:outline-none focus:border-natural-sage text-natural-text text-xs transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-natural-sage uppercase tracking-wider mb-1">
                    Cantor ou Ministério
                  </label>
                  <input
                    type="text"
                    value={manualArtist}
                    onChange={(e) => setManualArtist(e.target.value)}
                    placeholder="Ex: Harpa Cristã"
                    className="w-full px-3 py-2 bg-natural-bg border border-natural-border rounded-xl focus:outline-none focus:border-natural-sage text-natural-text text-xs transition"
                  />
                </div>
              </div>

              <div className="flex-1 flex flex-col min-h-[150px]">
                <label className="block text-[10px] font-bold text-natural-sage uppercase tracking-wider mb-1">
                  Letra Completa *
                </label>
                <textarea
                  required
                  value={manualLyrics}
                  onChange={(e) => setManualLyrics(e.target.value)}
                  placeholder={`Cole a letra aqui...\n\nExemplo:\n\n[Coro]\nAlvo mais que a neve!\nAlvo mais que a neve!\nSim, nesse sangue lavado,\nMais alvo que a neve serei.`}
                  rows={8}
                  className="w-full flex-1 px-3 py-2 bg-natural-bg border border-natural-border rounded-xl focus:outline-none focus:border-natural-sage text-natural-text text-xs font-mono transition resize-none overflow-y-auto"
                />
              </div>

              <div className="text-[10px] text-natural-text/70 bg-natural-bg p-3 border border-natural-border rounded-xl leading-relaxed">
                <strong>💡 Dicas de Formatação:</strong>
                <ul className="list-disc pl-4 mt-1 space-y-0.5">
                  <li>Deixe uma <strong>linha em branco</strong> para separar as estrofes/slides.</li>
                  <li>Use marcadores como <strong>[Coro]</strong>, <strong>[Refrão]</strong>, ou <strong>[Ponte]</strong> na primeira linha de uma estrofe para classificar automaticamente o slide.</li>
                  <li>Se uma estrofe tiver mais que 4 linhas, ela será inteligentemente dividida em slides menores de até 4 linhas para facilitar a leitura.</li>
                </ul>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-natural-border/60">
                <button
                  type="button"
                  onClick={() => {
                    setManualTitle("");
                    setManualArtist("");
                    setManualLyrics("");
                    setShowManualModal(false);
                  }}
                  className="flex-1 py-2.5 bg-natural-cream hover:bg-natural-cream-hover text-natural-text rounded-xl text-xs font-semibold transition cursor-pointer border border-natural-border"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingManual}
                  className="flex-1 py-2.5 bg-natural-sage hover:bg-natural-sage-hover text-white rounded-xl font-bold text-xs transition flex items-center justify-center space-x-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSavingManual ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <span>Adicionar à Biblioteca</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Service Modal */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-natural-border w-full max-w-md p-6 rounded-2xl shadow-2xl relative">
            <h3 className="text-lg font-serif italic font-bold text-natural-text mb-1">Cadastrar Novo Culto</h3>
            <p className="text-xs text-natural-text/60 mb-4 font-medium">
              Planeje um culto para agendar as músicas em ordem litúrgica.
            </p>

            <form onSubmit={handleCreateService} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-natural-sage uppercase tracking-wider mb-1">
                  Nome do Culto *
                </label>
                <input
                  type="text"
                  required
                  value={newServiceTitle}
                  onChange={(e) => setNewServiceTitle(e.target.value)}
                  placeholder="Ex: Culto 01, Culto de Domingo Noite"
                  className="w-full px-3 py-2 bg-natural-bg border border-natural-border rounded-xl focus:outline-none focus:border-natural-sage text-natural-text text-xs transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-natural-sage uppercase tracking-wider mb-1">
                  Data do Culto *
                </label>
                <input
                  type="date"
                  required
                  value={newServiceDate}
                  onChange={(e) => setNewServiceDate(e.target.value)}
                  className="w-full px-3 py-2 bg-natural-bg border border-natural-border rounded-xl focus:outline-none focus:border-natural-sage text-natural-text text-xs transition"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setNewServiceTitle("");
                    setNewServiceDate("");
                    setShowAddServiceModal(false);
                  }}
                  className="flex-1 py-2 bg-natural-cream hover:bg-natural-cream-hover text-natural-text rounded-xl text-xs font-semibold transition cursor-pointer border border-natural-border"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingService}
                  className="flex-1 py-2 bg-natural-sage hover:bg-natural-sage-hover text-white rounded-xl font-bold text-xs transition flex items-center justify-center space-x-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSavingService ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Cadastrando...</span>
                    </>
                  ) : (
                    <span>Confirmar Cadastro</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Announcement Creator Modal */}
      {showAnnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-natural-border w-full max-w-md p-6 rounded-2xl shadow-2xl relative">
            <h3 className="text-lg font-serif italic font-bold text-natural-text mb-1">
              {editingAnnId ? "Editar Aviso" : "Novo Aviso de Mídia"}
            </h3>
            <p className="text-xs text-natural-text/60 mb-4 font-medium">
              Escreva mensagens cativantes. O Datashow cuidará do fundo jovem e das transições!
            </p>

            <form onSubmit={handleSaveAnnouncement} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-natural-sage uppercase tracking-wider mb-1">
                  Título do Aviso *
                </label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="Ex: Celular Silencioso ou Dízimos e Ofertas"
                  className="w-full px-3 py-2 bg-natural-bg border border-natural-border rounded-xl focus:outline-none focus:border-natural-sage text-natural-text text-xs transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-natural-sage uppercase tracking-wider mb-1">
                  Momento do Culto (Tipo) *
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setAnnType("pre-service")}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition text-center cursor-pointer ${
                      annType === "pre-service"
                        ? "bg-cyan-50 border-cyan-300 text-cyan-800 ring-2 ring-cyan-500/10"
                        : "bg-natural-bg border-natural-border text-natural-text hover:bg-natural-cream"
                    }`}
                  >
                    Pré-Culto (Loop Jovem)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnnType("post-service")}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition text-center cursor-pointer ${
                      annType === "post-service"
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800 ring-2 ring-emerald-500/10"
                        : "bg-natural-bg border-natural-border text-natural-text hover:bg-natural-cream"
                    }`}
                  >
                    Fim de Culto (Manual)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-natural-sage uppercase tracking-wider mb-1">
                  Linhas do Slide * (uma frase por linha, max 4 recomendável)
                </label>
                <textarea
                  required
                  rows={4}
                  value={annLinesText}
                  onChange={(e) => setAnnLinesText(e.target.value)}
                  placeholder="Seja muito bem-vindo!&#10;Nosso culto iniciará em breve.&#10;Prepare seu coração!"
                  className="w-full px-3 py-2 bg-natural-bg border border-natural-border rounded-xl focus:outline-none focus:border-natural-sage text-natural-text text-xs transition font-mono"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAnnModal(false)}
                  className="flex-1 py-2 bg-natural-cream hover:bg-natural-cream-hover border border-natural-border text-natural-text rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingAnn}
                  className="flex-1 py-2 bg-natural-sage hover:bg-natural-sage-hover text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSavingAnn ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <span>{editingAnnId ? "Salvar" : "Criar Aviso"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Presenter Mode Trigger FAB for Tablet */}
      {hasActiveProjection && (
        <button
          onClick={() => setIsPresenterModeOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-natural-sage hover:bg-natural-sage-hover text-white p-4 rounded-full shadow-2xl flex items-center space-x-2 border border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer group animate-bounce"
          title="Abrir Passador de Slides por Toque"
          id="btn-open-presenter-mode"
        >
          <Tv className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-wider pr-1 hidden sm:inline">Passador Tablet</span>
        </button>
      )}

      {/* Full-screen Slide Presenter Mode Overlay */}
      {isPresenterModeOpen && (
        <div className="fixed inset-0 bg-[#0D0B21] text-[#FDFBF7] z-50 flex flex-col p-4 sm:p-6 select-none animate-fade-in font-sans">
          
          {/* Header Controls */}
          <div className="relative z-20 flex justify-between items-center bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md mb-6">
            <div className="flex items-center space-x-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Modo Tablet Passador
                </h4>
                <p className="text-[10px] sm:text-[11px] text-white/50">
                  Toque nas laterais da tela para navegar os slides
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Blackout toggle */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleBlackout(); }}
                className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold uppercase tracking-wider transition flex items-center space-x-1.5 cursor-pointer ${
                  room.isBlackout
                    ? "bg-red-500/20 border-red-500/40 text-red-400"
                    : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                }`}
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Blackout</span>
              </button>

              {/* Clear Text toggle */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleClearText(); }}
                className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold uppercase tracking-wider transition flex items-center space-x-1.5 cursor-pointer ${
                  room.isClearText
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                    : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Limpar</span>
              </button>

              {/* Close/Exit Presenter Modal */}
              <button
                onClick={() => setIsPresenterModeOpen(false)}
                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition cursor-pointer border border-red-500/20"
                title="Sair do Passador"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dual tap navigation panel container */}
          <div className="relative flex-1 flex flex-col justify-between items-center z-10 overflow-hidden">
            
            {/* Click & Tap Areas */}
            {/* Left Tap Zone */}
            <div 
              onClick={handlePresenterPrev}
              className="absolute left-0 top-0 bottom-0 w-1/2 cursor-pointer group flex items-center justify-start pl-4 sm:pl-8 z-10"
              title="Slide Anterior"
            >
              <div className="p-3 sm:p-5 rounded-full bg-white/0 group-hover:bg-white/5 group-active:bg-white/10 transition duration-200">
                <ChevronRight className="w-10 h-10 sm:w-14 sm:h-14 text-white/10 group-hover:text-white/40 group-active:text-white/60 rotate-180" />
              </div>
              <span className="absolute left-16 sm:left-24 bottom-12 text-[10px] sm:text-xs uppercase font-mono tracking-widest text-white/10 group-hover:text-white/30 select-none transition-opacity">
                ← Toque para voltar
              </span>
            </div>

            {/* Right Tap Zone */}
            <div 
              onClick={handlePresenterNext}
              className="absolute right-0 top-0 bottom-0 w-1/2 cursor-pointer group flex items-center justify-end pr-4 sm:pr-8 z-10"
              title="Próximo Slide"
            >
              <div className="p-3 sm:p-5 rounded-full bg-white/0 group-hover:bg-white/5 group-active:bg-white/10 transition duration-200">
                <ChevronRight className="w-10 h-10 sm:w-14 sm:h-14 text-white/10 group-hover:text-white/40 group-active:text-white/60" />
              </div>
              <span className="absolute right-16 sm:right-24 bottom-12 text-[10px] sm:text-xs uppercase font-mono tracking-widest text-white/10 group-hover:text-white/30 select-none transition-opacity">
                Avançar →
              </span>
            </div>

            {/* Central Slide Display (Visual replication of projector screen) */}
            <div className="w-full max-w-4xl flex-1 flex flex-col justify-center items-center text-center px-4 sm:px-8 relative pointer-events-none z-0">
              
              <div className="mb-4">
                <span className="px-3 py-1.5 bg-white/5 border border-white/10 text-[10px] sm:text-xs font-mono tracking-widest text-emerald-400 uppercase font-bold rounded-full">
                  {presenterInfo.typeLabel}
                </span>
              </div>

              <h2 className="text-lg sm:text-2xl font-serif italic text-white/50 mb-6 sm:mb-10 tracking-wide px-4">
                {presenterInfo.referenceText}
              </h2>

              {/* Slide Lyrics Content */}
              <div className="space-y-4 sm:space-y-6 min-h-[160px] sm:min-h-[220px] flex flex-col justify-center w-full px-2">
                {room.isBlackout ? (
                  <div className="space-y-2">
                    <p className="text-xl sm:text-2xl font-mono text-red-400 uppercase tracking-widest animate-pulse font-bold">
                      ● BLACKOUT ATIVO
                    </p>
                    <p className="text-xs sm:text-sm text-white/40">O projetor está exibindo uma tela inteiramente preta.</p>
                  </div>
                ) : room.isClearText ? (
                  <div className="space-y-2">
                    <p className="text-xl sm:text-2xl font-mono text-amber-400 uppercase tracking-widest animate-pulse font-bold">
                      ● TEXTO OCULTADO
                    </p>
                    <p className="text-xs sm:text-sm text-white/40">Fundo ativo exibido, mas o texto da letra foi limpo temporariamente.</p>
                  </div>
                ) : presenterInfo.currentSlideLines.length === 0 ? (
                  <p className="text-lg text-white/30 italic">
                    Nenhuma projeção ativa na sala no momento.
                  </p>
                ) : (
                  presenterInfo.currentSlideLines.map((line, idx) => (
                    <p 
                      key={idx} 
                      className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-serif italic font-medium leading-relaxed drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] text-[#FDFBF7]"
                    >
                      {line}
                    </p>
                  ))
                )}
              </div>

              {/* Progress Tracker (Slides Count dots) */}
              {presenterInfo.totalSlides > 0 && (
                <div className="mt-8 sm:mt-12 flex flex-col items-center space-y-2.5">
                  <span className="text-[10px] sm:text-xs font-mono text-white/40 uppercase tracking-widest font-bold">
                    Slide {presenterInfo.currentSlideIndex + 1} de {presenterInfo.totalSlides}
                  </span>
                  <div className="flex flex-wrap gap-1.5 justify-center max-w-sm">
                    {Array.from({ length: presenterInfo.totalSlides }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          i === presenterInfo.currentSlideIndex ? "w-6 bg-emerald-400" : "w-1.5 bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Next Slide Preview Box */}
            <div className="w-full max-w-2xl bg-white/5 border border-white/10 p-3 sm:p-4 rounded-2xl backdrop-blur-md text-center pointer-events-none relative z-20 mb-2">
              <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-emerald-400/80 font-bold block mb-1">
                👉 PRÓXIMO SLIDE:
              </span>
              <p className="text-xs sm:text-sm font-serif italic text-white/80 truncate px-4">
                {presenterInfo.nextSlidePreview}
              </p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
