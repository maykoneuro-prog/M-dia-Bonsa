import React, { useState, useEffect } from "react";
import { Room, Song } from "./types";
import { 
  initOrCreateRoom, 
  listenToRoom, 
  seedDefaultSongsIfEmpty 
} from "./lib/dbService";
import WelcomeScreen from "./components/WelcomeScreen";
import LeaderDashboard from "./components/LeaderDashboard";
import CongregationView from "./components/CongregationView";
import ProjectionScreen from "./components/ProjectionScreen";
import { RefreshCw } from "lucide-react";

export default function App() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomName, setRoomName] = useState("");
  const [role, setRole] = useState<"leader" | "congregation" | "projection" | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize and check URL parameters on load for easy QR Code joins!
  useEffect(() => {
    // Seed default songs if database is fresh
    seedDefaultSongsIfEmpty();

    const params = new URLSearchParams(window.location.search);
    const urlRoom = params.get("room") || params.get("roomId");
    const urlRole = params.get("role");

    if (urlRoom) {
      const cleanRoomId = urlRoom.trim().toUpperCase();
      setRoomId(cleanRoomId);
      
      if (urlRole === "projection") {
        setRole("projection");
      } else if (urlRole === "leader") {
        setRole("leader");
      } else {
        setRole("congregation"); // Default to congregation if scanning QR code or clicking link
      }
    } else {
      // Direct access - default to single stable room "BOM-SAMARITANO" as leader
      setRoomId("BOM-SAMARITANO");
      setRole("leader");
    }
  }, []);

  // Listen to Firestore room updates in real-time when roomId is set
  useEffect(() => {
    if (!roomId) {
      setCurrentRoom(null);
      return;
    }

    setIsLoading(true);
    // Listen to changes
    const unsubscribe = listenToRoom(roomId, (roomData) => {
      setIsLoading(false);
      if (roomData) {
        setCurrentRoom(roomData);
        setRoomName(roomData.name);
      } else {
        // If room doesn't exist yet (e.g. from joining a manual code),
        // we can initialize it if the user is a leader, or show an error
        console.warn(`Sala ${roomId} não encontrada.`);
        if (role === "leader") {
          initOrCreateRoom(roomId, roomName || "Culto Bom Samaritano").then(() => {
            // Firestore will trigger the listener again with the newly created room!
          });
        } else {
          setCurrentRoom({
            id: roomId,
            name: "Culto Bom Samaritano",
            activeSongId: null,
            activeSlideIndex: 0,
            isBlackout: false,
            isClearText: false,
            updatedAt: null
          });
        }
      }
    });

    return () => unsubscribe();
  }, [roomId, role]);

  // Handle Leader creating a room
  const handleCreateRoom = async (generatedRoomId: string, name: string) => {
    setIsLoading(true);
    setRoomName(name);
    setRoomId(generatedRoomId);
    setRole("leader");
    
    // Write room to database
    await initOrCreateRoom(generatedRoomId, name);
    
    // Add parameters to URL to make it bookmarkable/sharable without hard refreshes
    const newUrl = `${window.location.origin}?room=${generatedRoomId}&role=leader`;
    window.history.pushState({ path: newUrl }, "", newUrl);
  };

  // Handle Leader managing an existing room
  const handleManageRoom = (enteredRoomId: string) => {
    const cleanId = enteredRoomId.trim().toUpperCase();
    setRoomId(cleanId);
    setRole("leader");

    const newUrl = `${window.location.origin}?room=${cleanId}&role=leader`;
    window.history.pushState({ path: newUrl }, "", newUrl);
  };

  // Handle Congregation entering a code
  const handleJoinRoom = (enteredRoomId: string) => {
    const cleanId = enteredRoomId.trim().toUpperCase();
    setRoomId(cleanId);
    setRole("congregation");

    const newUrl = `${window.location.origin}?room=${cleanId}&role=congregation`;
    window.history.pushState({ path: newUrl }, "", newUrl);
  };

  // Handle opening projection screen directly
  const handleOpenProjection = (enteredRoomId: string) => {
    const cleanId = enteredRoomId.trim().toUpperCase();
    setRoomId(cleanId);
    setRole("projection");

    const newUrl = `${window.location.origin}?room=${cleanId}&role=projection`;
    window.history.pushState({ path: newUrl }, "", newUrl);
  };

  // Handle disconnecting / returning to welcome page
  const handleDisconnect = () => {
    setRoomId(null);
    setRole(null);
    setCurrentRoom(null);
    // Clear URL parameters cleanly
    const cleanUrl = window.location.origin;
    window.history.pushState({ path: cleanUrl }, "", cleanUrl);
  };

  if (isLoading && !currentRoom) {
    return (
      <div className="min-h-screen bg-natural-bg flex flex-col justify-center items-center font-sans text-natural-text">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="w-8 h-8 text-natural-sage animate-spin" />
          <p className="text-xs font-semibold uppercase tracking-widest text-natural-sage/70">
            Carregando Sincronização...
          </p>
        </div>
      </div>
    );
  }

  // Router dispatcher
  if (roomId && role === "leader" && currentRoom) {
    return (
      <LeaderDashboard 
        room={currentRoom} 
        songs={[]} // Songs are synchronized inside the dashboard component
        onDisconnect={handleDisconnect} 
      />
    );
  }

  if (roomId && role === "congregation" && currentRoom) {
    return (
      <CongregationView 
        room={currentRoom} 
        onDisconnect={handleDisconnect} 
      />
    );
  }

  if (roomId && role === "projection" && currentRoom) {
    return (
      <ProjectionScreen 
        room={currentRoom} 
        onDisconnect={handleDisconnect} 
      />
    );
  }

  // Default to main landing selection page
  return (
    <WelcomeScreen 
      onCreateRoom={handleCreateRoom} 
      onJoinRoom={handleJoinRoom} 
      onOpenProjection={handleOpenProjection}
      onManageRoom={handleManageRoom}
    />
  );
}
