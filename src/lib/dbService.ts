import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  addDoc, 
  query, 
  orderBy, 
  serverTimestamp,
  onSnapshot,
  where,
  deleteDoc
} from "firebase/firestore";
import { db } from "../firebase";
import { Song, Room, Service, Announcement } from "../types";

// Preloaded beautiful classic songs to populate the database on first load
export const DEFAULT_SONGS: Omit<Song, "id">[] = [
  {
    title: "Porque Ele Vive",
    artist: "Harpa Cristã",
    slides: [
      { type: "Estrofe", lines: ["Deus enviou Seu Filho amado", "Para morrer em meu lugar", "Na cruz sofreu por meus pecados", "Mas o sepulcro vazio está"] },
      { type: "Coro", lines: ["Porque Ele vive, posso crer no amanhã", "Porque Ele vive, temor não há", "Mas eu bem sei, eu sei, que a minha vida", "Está nas mãos do meu Jesus, que vivo está"] },
      { type: "Estrofe", lines: ["E quando, enfim, chegar a hora", "Em que a morte enfrentarei", "Sem medo, então, terei vitória", "Irei à Glória, ao meu Jesus que vivo está"] },
      { type: "Coro", lines: ["Porque Ele vive, posso crer no amanhã", "Porque Ele vive, temor não há", "Mas eu bem sei, eu sei, que a minha vida", "Está nas mãos do meu Jesus, que vivo está"] }
    ]
  },
  {
    title: "Grandioso És Tu",
    artist: "Harpa Cristã",
    slides: [
      { type: "Estrofe", lines: ["Senhor meu Deus, quando eu maravilhado", "Contemplo a Tua imensa criação", "A terra e o céu em glória coroado", "E as obras de Tuas divinas mãos"] },
      { type: "Coro", lines: ["Então minh'alma canta a Ti, Senhor", "Grandioso és Tu! Grandioso és Tu!", "Então minh'alma canta a Ti, Senhor", "Grandioso és Tu! Grandioso és Tu!"] },
      { type: "Estrofe", lines: ["E quando penso que Tu não poupaste", "Teu próprio Filho, o Salvador Jesus", "Que por amor de mim na cruz morrendo", "Sofreu a pena de uma terrível cruz"] },
      { type: "Coro", lines: ["Então minh'alma canta a Ti, Senhor", "Grandioso és Tu! Grandioso és Tu!", "Então minh'alma canta a Ti, Senhor", "Grandioso és Tu! Grandioso és Tu!"] }
    ]
  },
  {
    title: "Alvo Mais Que a Neve",
    artist: "Harpa Cristã",
    slides: [
      { type: "Estrofe", lines: ["Tu, que sobre a amarga cruz", "Teu sangue derramaste", "Purifica-me, Jesus", "Pois Tu já me resgataste"] },
      { type: "Coro", lines: ["Alvo mais que a neve!", "Alvo mais que a neve!", "Sim, nesse sangue lavado", "Mais alvo que a neve serei."] },
      { type: "Estrofe", lines: ["Quão mui longe de Ti andei", "Mas agora eu volto a Ti", "Teu perdão eu alcancei", "E feliz agora estou em Ti"] },
      { type: "Coro", lines: ["Alvo mais que a neve!", "Alvo mais que a neve!", "Sim, nesse sangue lavado", "Mais alvo que a neve serei."] }
    ]
  }
];

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: false,
      isAnonymous: false,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Helper to seed database with classic hinos if empty
export async function seedDefaultSongsIfEmpty() {
  const songsCol = collection(db, "songs");
  try {
    const snapshot = await getDocs(songsCol);
    if (snapshot.empty) {
      console.log("Banco de músicas vazio! Populando com músicas padrão...");
      for (const song of DEFAULT_SONGS) {
        await addDoc(songsCol, {
          ...song,
          createdAt: serverTimestamp()
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, "songs");
  }
}

// Get all songs from library
export async function getSongsFromLibrary(): Promise<Song[]> {
  const songsCol = collection(db, "songs");
  try {
    const snapshot = await getDocs(songsCol);
    const songsList: Song[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      songsList.push({
        id: docSnap.id,
        title: data.title || "Sem Título",
        artist: data.artist || "Desconhecido",
        slides: data.slides || []
      });
    });
    return songsList;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, "songs");
    return [];
  }
}

// Add song to Firestore library
export async function addSongToLibrary(song: Omit<Song, "id">): Promise<string> {
  const songsCol = collection(db, "songs");
  try {
    const docRef = await addDoc(songsCol, {
      ...song,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "songs");
    throw error;
  }
}

// Delete song from Firestore library
export async function deleteSongFromLibrary(songId: string): Promise<void> {
  const songDocRef = doc(db, "songs", songId);
  try {
    await deleteDoc(songDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `songs/${songId}`);
    throw error;
  }
}

// Update song in Firestore library
export async function updateSongInLibrary(songId: string, song: Partial<Omit<Song, "id">>): Promise<void> {
  const songDocRef = doc(db, "songs", songId);
  try {
    await updateDoc(songDocRef, {
      ...song,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `songs/${songId}`);
    throw error;
  }
}

// Create or update room session state
export async function initOrCreateRoom(roomId: string, name: string): Promise<void> {
  const roomDocRef = doc(db, "rooms", roomId.toUpperCase());
  try {
    const roomSnap = await getDoc(roomDocRef);

    if (!roomSnap.exists()) {
      await setDoc(roomDocRef, {
        id: roomId.toUpperCase(),
        name: name,
        activeSongId: null,
        activeSlideIndex: 0,
        isBlackout: false,
        isClearText: false,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `rooms/${roomId.toUpperCase()}`);
  }
}

// Update active song and active slide on room
export async function updateRoomActiveState(
  roomId: string, 
  songId: string | null, 
  slideIndex: number
): Promise<void> {
  const roomDocRef = doc(db, "rooms", roomId.toUpperCase());
  try {
    await updateDoc(roomDocRef, {
      activeSongId: songId,
      activeSlideIndex: slideIndex,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId.toUpperCase()}`);
  }
}

// Update room display configurations (blackout/clearText)
export async function updateRoomDisplaySettings(
  roomId: string,
  settings: { isBlackout?: boolean; isClearText?: boolean }
): Promise<void> {
  const roomDocRef = doc(db, "rooms", roomId.toUpperCase());
  try {
    await updateDoc(roomDocRef, {
      ...settings,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId.toUpperCase()}`);
  }
}

// Listen to room modifications in real-time
export function listenToRoom(roomId: string, callback: (room: Room | null) => void) {
  const roomDocRef = doc(db, "rooms", roomId.toUpperCase());
  return onSnapshot(roomDocRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      callback({
        id: data.id,
        name: data.name || "Sala de Culto",
        activeSongId: data.activeSongId,
        activeSlideIndex: data.activeSlideIndex ?? 0,
        isBlackout: data.isBlackout ?? false,
        isClearText: data.isClearText ?? false,
        updatedAt: data.updatedAt,
        activeAnnouncementType: data.activeAnnouncementType || "none",
        activeAnnouncementIndex: data.activeAnnouncementIndex ?? 0,
        activeProjectionType: data.activeProjectionType || "none",
        activeScriptureReference: data.activeScriptureReference || "",
        activeScriptureText: data.activeScriptureText || [],
        activeScriptureIndex: data.activeScriptureIndex ?? 0,
        pixKey: data.pixKey || "",
        pixName: data.pixName || ""
      });
    } else {
      callback(null);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, `rooms/${roomId.toUpperCase()}`);
  });
}

// Listen to list of songs in real-time
export function listenToSongs(callback: (songs: Song[]) => void) {
  const songsCol = collection(db, "songs");
  return onSnapshot(songsCol, (snapshot) => {
    const list: Song[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        title: data.title || "Sem Título",
        artist: data.artist || "Desconhecido",
        slides: data.slides || []
      });
    });
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, "songs");
  });
}

// Create a new worship service
export async function createService(roomId: string, title: string, date: string): Promise<string> {
  const servicesCol = collection(db, "services");
  try {
    const newDocRef = doc(servicesCol);
    const id = newDocRef.id;
    await setDoc(newDocRef, {
      id,
      roomId: roomId.toUpperCase(),
      title,
      date,
      isActive: false,
      items: [],
      createdAt: serverTimestamp()
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "services");
    throw error;
  }
}

// Update a worship service (e.g. rename, change date, or change items)
export async function updateService(serviceId: string, updates: Partial<Omit<Service, "id">>): Promise<void> {
  const serviceDocRef = doc(db, "services", serviceId);
  try {
    await updateDoc(serviceDocRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `services/${serviceId}`);
  }
}

// Delete a worship service
export async function deleteService(serviceId: string): Promise<void> {
  const serviceDocRef = doc(db, "services", serviceId);
  try {
    await deleteDoc(serviceDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `services/${serviceId}`);
  }
}

// Activate a worship service (making all others in that room inactive)
export async function setActiveService(roomId: string, activeServiceId: string | null): Promise<void> {
  const servicesCol = collection(db, "services");
  try {
    const q = query(servicesCol, where("roomId", "==", roomId.toUpperCase()));
    const snapshot = await getDocs(q);
    for (const docSnap of snapshot.docs) {
      const isThisActive = docSnap.id === activeServiceId;
      if (docSnap.data().isActive !== isThisActive) {
        await updateDoc(docSnap.ref, {
          isActive: isThisActive,
          updatedAt: serverTimestamp()
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `services_activation/${roomId}`);
  }
}

// Listen to services under a specific room in real-time
export function listenToServices(roomId: string, callback: (services: Service[]) => void) {
  const servicesCol = collection(db, "services");
  const q = query(servicesCol, where("roomId", "==", roomId.toUpperCase()));
  return onSnapshot(q, (snapshot) => {
    const list: Service[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        roomId: data.roomId,
        title: data.title || "Culto Sem Nome",
        date: data.date || "",
        isActive: data.isActive ?? false,
        items: data.items || []
      });
    });
    // Sort services by date descending
    list.sort((a, b) => b.date.localeCompare(a.date));
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, "services");
  });
}

// Listen to announcements for a specific room in real-time
export function listenToAnnouncements(roomId: string, callback: (announcements: Announcement[]) => void) {
  const annCol = collection(db, "announcements");
  const q = query(annCol, where("roomId", "==", roomId.toUpperCase()));
  return onSnapshot(q, (snapshot) => {
    const list: Announcement[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        roomId: data.roomId,
        type: data.type || "pre-service",
        title: data.title || "Aviso",
        lines: data.lines || [],
        order: data.order ?? 0,
        imageUrl: data.imageUrl || ""
      });
    });
    // Sort by order ascending
    list.sort((a, b) => a.order - b.order);
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, "announcements");
  });
}

// Add an announcement
export async function addAnnouncement(announcement: Omit<Announcement, "id">): Promise<string> {
  const annCol = collection(db, "announcements");
  try {
    const docRef = await addDoc(annCol, {
      ...announcement,
      roomId: announcement.roomId.toUpperCase(),
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "announcements");
    throw error;
  }
}

// Update an announcement
export async function updateAnnouncement(annId: string, updates: Partial<Omit<Announcement, "id">>): Promise<void> {
  const annDocRef = doc(db, "announcements", annId);
  try {
    await updateDoc(annDocRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `announcements/${annId}`);
  }
}

// Delete an announcement
export async function deleteAnnouncement(annId: string): Promise<void> {
  const annDocRef = doc(db, "announcements", annId);
  try {
    await deleteDoc(annDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `announcements/${annId}`);
  }
}

// Sync current announcement projection state in Room
export async function updateRoomAnnouncementState(
  roomId: string,
  type: "none" | "pre-service" | "post-service",
  index: number
): Promise<void> {
  const roomDocRef = doc(db, "rooms", roomId.toUpperCase());
  try {
    await updateDoc(roomDocRef, {
      activeAnnouncementType: type,
      activeAnnouncementIndex: index,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId.toUpperCase()}/announcementState`);
  }
}

// Seed defaults if empty
export async function seedDefaultAnnouncementsIfEmpty(roomId: string): Promise<void> {
  const annCol = collection(db, "announcements");
  try {
    const q = query(annCol, where("roomId", "==", roomId.toUpperCase()));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      console.log(`Announcements empty for room ${roomId}. Seeding defaults...`);
      const defaults: Omit<Announcement, "id">[] = [
        // Pre-service loops (loop_mode)
        {
          roomId: roomId.toUpperCase(),
          type: "pre-service",
          title: "Início em breve",
          lines: ["Seja bem-vindo!", "Nosso culto iniciará em breve.", "Prepare o seu coração para adorar!"],
          order: 1
        },
        {
          roomId: roomId.toUpperCase(),
          type: "pre-service",
          title: "Aviso de Imagem",
          lines: ["Aviso de Uso de Imagem", "Este culto é transmitido ao vivo e gravado.", "Se não deseja que sua imagem seja divulgada,", "por favor fale com nossa equipe de mídia."],
          order: 2
        },
        {
          roomId: roomId.toUpperCase(),
          type: "pre-service",
          title: "Celular Silencioso",
          lines: ["Celulares no Silencioso", "Por favor, silencie o seu aparelho celular.", "Este momento é especial para ouvirmos", "atentamente a voz de Deus."],
          order: 3
        },
        {
          roomId: roomId.toUpperCase(),
          type: "pre-service",
          title: "Redes Sociais",
          lines: ["Siga-nos nas Redes", "Acompanhe nossa programação semanal", "e fique por dentro de todas as novidades!", "@bomsamaritano"],
          order: 4
        },
        // Post-service slides
        {
          roomId: roomId.toUpperCase(),
          type: "post-service",
          title: "Dízimos e Ofertas",
          lines: ["Dízimos e Ofertas", "Adore ao Senhor também com suas primícias.", "Chave Pix: pix@bomsamaritano.com", "Deus ama ao que dá com alegria!"],
          order: 1
        },
        {
          roomId: roomId.toUpperCase(),
          type: "post-service",
          title: "Pequenos Grupos",
          lines: ["Pequenos Grupos (PG)", "Toda quarta-feira nos lares às 20:00.", "Participe de uma comunidade de fé", "e comunhão mais perto de você!"],
          order: 2
        },
        {
          roomId: roomId.toUpperCase(),
          type: "post-service",
          title: "Rede de Jovens",
          lines: ["Rede de Jovens - Sábado", "Neste sábado às 19:30!", "Traga um amigo para uma noite", "de louvor, palavra e muita comunhão."],
          order: 3
        }
      ];
      
      for (const item of defaults) {
        await addDoc(annCol, {
          ...item,
          createdAt: serverTimestamp()
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `announcements/seed/${roomId}`);
  }
}

// Update room scripture projection state
export async function updateRoomScriptureState(
  roomId: string,
  reference: string,
  textSlides: string[],
  activeIndex: number
): Promise<void> {
  const roomDocRef = doc(db, "rooms", roomId.toUpperCase());
  try {
    await updateDoc(roomDocRef, {
      activeProjectionType: "scripture",
      activeScriptureReference: reference,
      activeScriptureText: textSlides,
      activeScriptureIndex: activeIndex,
      // Clear active song and announcements to prevent overlapping
      activeSongId: null,
      activeAnnouncementType: "none",
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId.toUpperCase()}/scriptureState`);
  }
}

// Update room offering projection state
export async function updateRoomOfferingState(
  roomId: string,
  pixKey: string,
  pixName: string
): Promise<void> {
  const roomDocRef = doc(db, "rooms", roomId.toUpperCase());
  try {
    await updateDoc(roomDocRef, {
      activeProjectionType: "offering",
      pixKey,
      pixName,
      // Clear active song and announcements to prevent overlapping
      activeSongId: null,
      activeAnnouncementType: "none",
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId.toUpperCase()}/offeringState`);
  }
}

// Generic function to switch active projection type
export async function updateRoomProjectionType(
  roomId: string,
  projectionType: "song" | "announcement" | "scripture" | "offering" | "none"
): Promise<void> {
  const roomDocRef = doc(db, "rooms", roomId.toUpperCase());
  try {
    const updates: any = {
      activeProjectionType: projectionType,
      updatedAt: serverTimestamp()
    };
    if (projectionType !== "song") {
      updates.activeSongId = null;
    }
    if (projectionType !== "announcement") {
      updates.activeAnnouncementType = "none";
    }
    await updateDoc(roomDocRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId.toUpperCase()}/projectionType`);
  }
}
