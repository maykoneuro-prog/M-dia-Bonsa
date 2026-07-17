export interface Slide {
  type: string; // e.g., "Estrofe", "Coro", "Ponte", "Ministração"
  lines: string[];
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  slides: Slide[];
  createdAt?: any;
}

export interface Room {
  id: string;
  name: string;
  activeSongId: string | null;
  activeSlideIndex: number;
  isBlackout: boolean; // Turns projection screen completely black
  isClearText: boolean; // Hides text but keeps design
  updatedAt: any;
  activeAnnouncementType?: "none" | "pre-service" | "post-service";
  activeAnnouncementIndex?: number;
  activeProjectionType?: "song" | "announcement" | "scripture" | "offering" | "none";
  activeScriptureReference?: string;
  activeScriptureText?: string[]; // Array of strings, each is a slide/paragraph
  activeScriptureIndex?: number;
  pixKey?: string;
  pixName?: string;
}

export interface ServiceItem {
  id: string; // unique ID within the service (e.g. UUID or timestamp)
  songId: string;
  songTitle: string;
  songArtist: string;
  liturgyCategory: string;
}

export interface Service {
  id: string;
  roomId: string;
  title: string; // e.g., "Culto 01", "Culto de Domingo - Manhã"
  date: string; // "YYYY-MM-DD"
  isActive: boolean; // Only one service is active in a room at any time
  items: ServiceItem[];
  createdAt?: any;
}

export interface Announcement {
  id: string;
  roomId: string;
  type: "pre-service" | "post-service";
  title: string;
  lines: string[];
  order: number;
  imageUrl?: string;
  createdAt?: any;
}

export const LITURGY_CATEGORIES = [
  "Avisos antes do culto",
  "Processional",
  "Sentença Introdutória",
  "Confissão de pecados",
  "Momento de louvor",
  "Leitura da Palavra",
  "Louvor",
  "Palavra",
  "Louvor pós palavra",
  "Ofertório",
  "Pai Nosso",
  "Louvor ceia",
  "Parabéns",
  "Recessional"
] as const;
