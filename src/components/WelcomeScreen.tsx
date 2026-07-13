import React, { useState } from "react";
import { Users, Presentation, Shield, ArrowRight, Music } from "lucide-react";
import { motion } from "motion/react";

interface WelcomeScreenProps {
  onCreateRoom: (roomId: string, name: string) => void;
  onJoinRoom: (roomId: string) => void;
  onOpenProjection: (roomId: string) => void;
  onManageRoom: (roomId: string) => void;
}

export default function WelcomeScreen({ onCreateRoom, onJoinRoom, onOpenProjection, onManageRoom }: WelcomeScreenProps) {
  const [role, setRole] = useState<"welcome" | "leader" | "congregation" | "projection">("welcome");
  const [leaderMode, setLeaderMode] = useState<"create" | "join">("create");
  const [roomCode, setRoomCode] = useState("");
  const [churchName, setChurchName] = useState("Bom Samaritano");
  const [error, setError] = useState("");

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!churchName.trim()) {
      setError("Por favor, digite o nome da congregação.");
      return;
    }
    // Generate a random 4-digit code
    const generatedCode = "BOMS-" + Math.floor(1000 + Math.random() * 9000);
    onCreateRoom(generatedCode, churchName);
  };

  const handleLeaderManage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) {
      setError("Por favor, digite o código da sala.");
      return;
    }
    const cleanCode = roomCode.trim().toUpperCase();
    onManageRoom(cleanCode);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) {
      setError("Por favor, digite o código da sala.");
      return;
    }
    const cleanCode = roomCode.trim().toUpperCase();
    if (role === "projection") {
      onOpenProjection(cleanCode);
    } else {
      onJoinRoom(cleanCode);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-natural-bg text-natural-text flex flex-col justify-center items-center p-4 selection:bg-natural-sage selection:text-white font-sans">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#EAE6DD]/60 via-natural-bg to-natural-bg pointer-events-none" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-md bg-white border border-natural-border p-8 rounded-2xl shadow-xl"
        id="welcome-card"
      >
        {/* App Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-natural-sage text-white rounded-xl mb-4 shadow-sm">
            <Music className="w-8 h-8" />
          </div>
          <h1 className="text-xs tracking-[0.2em] uppercase font-bold text-natural-sage opacity-80">
            Boletim Digital
          </h1>
          <p className="text-2xl font-serif italic text-[#2D2D2A] mt-1">
            Bom Samaritano
          </p>
          <p className="text-xs text-natural-text/60 mt-2 font-medium">
            Letras de louvores sincronizadas em tempo real
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        {role === "welcome" && (
          <div className="space-y-4">
            <button
              onClick={() => { setRole("congregation"); setError(""); }}
              className="w-full flex items-center justify-between p-4 bg-white hover:bg-natural-bg border border-natural-border hover:border-natural-sage/30 rounded-xl transition duration-200 text-left group cursor-pointer"
              id="btn-role-member"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#F0EEE6] text-natural-sage rounded-lg group-hover:bg-natural-sage group-hover:text-white transition duration-200">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-natural-text text-sm">Acompanhar Culto</p>
                  <p className="text-xs text-natural-text/50">Ver letras no celular em tempo real</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-natural-sage/40 group-hover:text-natural-sage transition transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => { setRole("leader"); setError(""); }}
              className="w-full flex items-center justify-between p-4 bg-white hover:bg-natural-bg border border-natural-border hover:border-natural-sage/30 rounded-xl transition duration-200 text-left group cursor-pointer"
              id="btn-role-leader"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#F0EEE6] text-natural-sage rounded-lg group-hover:bg-natural-sage group-hover:text-white transition duration-200">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-natural-text text-sm">Painel do Líder / Ministro</p>
                  <p className="text-xs text-natural-text/50">Controlar projeção e adicionar louvores</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-natural-sage/40 group-hover:text-natural-sage transition transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => { setRole("projection"); setError(""); }}
              className="w-full flex items-center justify-between p-4 bg-white hover:bg-natural-bg border border-natural-border hover:border-natural-sage/30 rounded-xl transition duration-200 text-left group cursor-pointer"
              id="btn-role-projection"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#F0EEE6] text-natural-sage rounded-lg group-hover:bg-natural-sage group-hover:text-white transition duration-200">
                  <Presentation className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-natural-text text-sm">Tela de Projeção (Chromecast)</p>
                  <p className="text-xs text-natural-text/50">Datashow / Tela grande para a igreja</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-natural-sage/40 group-hover:text-natural-sage transition transform group-hover:translate-x-1" />
            </button>
          </div>
        )}

        {role === "leader" && (
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex border-b border-natural-border pb-1 mb-4">
              <button
                type="button"
                onClick={() => { setLeaderMode("create"); setError(""); }}
                className={`flex-1 pb-2 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition cursor-pointer ${
                  leaderMode === "create"
                    ? "border-natural-sage text-natural-sage"
                    : "border-transparent text-natural-text/40 hover:text-natural-text/60"
                }`}
              >
                Criar Nova Sala
              </button>
              <button
                type="button"
                onClick={() => { setLeaderMode("join"); setError(""); }}
                className={`flex-1 pb-2 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition cursor-pointer ${
                  leaderMode === "join"
                    ? "border-natural-sage text-natural-sage"
                    : "border-transparent text-natural-text/40 hover:text-natural-text/60"
                }`}
              >
                Gerenciar Existente
              </button>
            </div>

            {leaderMode === "create" ? (
              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-natural-sage uppercase tracking-wider mb-2">
                    Nome da Congregação / Culto
                  </label>
                  <input
                    type="text"
                    value={churchName}
                    onChange={(e) => setChurchName(e.target.value)}
                    placeholder="Ex: Bom Samaritano Central"
                    className="w-full px-4 py-3 bg-white border border-natural-border rounded-xl focus:outline-none focus:border-natural-sage text-natural-text placeholder-natural-text/40 transition text-sm"
                    required
                  />
                </div>
                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setRole("welcome")}
                    className="flex-1 px-4 py-3 bg-natural-cream hover:bg-natural-cream-hover border border-natural-border text-natural-sage rounded-xl transition text-sm font-semibold cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-natural-sage hover:bg-natural-sage-hover text-white rounded-xl transition text-sm font-bold flex items-center justify-center space-x-1 cursor-pointer shadow-sm"
                    id="btn-submit-create-room"
                  >
                    <span>Criar Sala</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLeaderManage} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-natural-sage uppercase tracking-wider mb-2">
                    Código da Sala
                  </label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    placeholder="Ex: BOMS-1234"
                    className="w-full px-4 py-3 bg-white border border-natural-border rounded-xl focus:outline-none focus:border-natural-sage text-natural-text placeholder-natural-text/40 text-center tracking-widest font-mono text-lg uppercase transition"
                    required
                  />
                </div>
                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setRole("welcome")}
                    className="flex-1 px-4 py-3 bg-natural-cream hover:bg-natural-cream-hover border border-natural-border text-natural-sage rounded-xl transition text-sm font-semibold cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-natural-sage hover:bg-natural-sage-hover text-white rounded-xl transition text-sm font-bold flex items-center justify-center space-x-1 cursor-pointer shadow-sm"
                    id="btn-submit-manage-room"
                  >
                    <span>Gerenciar Sala</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {(role === "congregation" || role === "projection") && (
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-natural-sage uppercase tracking-wider mb-2">
                Código da Sala
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="Ex: BOMS-1234"
                className="w-full px-4 py-3 bg-white border border-natural-border rounded-xl focus:outline-none focus:border-natural-sage text-natural-text placeholder-natural-text/40 text-center tracking-widest font-mono text-lg uppercase transition"
                required
              />
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setRole("welcome")}
                className="flex-1 px-4 py-3 bg-natural-cream hover:bg-natural-cream-hover border border-natural-border text-natural-sage rounded-xl transition text-sm font-semibold cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-natural-sage hover:bg-natural-sage-hover text-white rounded-xl transition text-sm font-bold flex items-center justify-center space-x-1 cursor-pointer shadow-sm"
                id="btn-submit-join-room"
              >
                <span>{role === "projection" ? "Abrir Tela" : "Entrar Sinc"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 text-center border-t border-natural-border/60 pt-4">
          <p className="text-[10px] text-natural-sage/50 font-mono tracking-wider uppercase font-semibold">
            BOLETIM DIGITAL BOM SAMARITANO &copy; 2026
          </p>
        </div>
      </motion.div>
    </div>
  );
}
