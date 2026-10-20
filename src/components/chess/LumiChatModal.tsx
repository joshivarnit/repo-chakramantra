"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Send,
  Sparkles,
  Bot,
  Lightbulb,
  Shield,
  Target,
  BookOpen,
  Heart,
  RotateCcw,
  Maximize2,
  Minimize2,
} from "lucide-react";

export interface LumiBoardAction {
  type: string;
  pgn?: string;
  fen?: string;
  moveNumber?: number;
  moveIndex?: number;
  title?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "lumi";
  text: string;
  timestamp: number;
  action?: LumiBoardAction;
}

interface LumiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  fen: string;
  lastMove?: string;
  bestMove?: string;
  evalCentipawns?: number;
  opening?: string;
  turn?: "w" | "b";
  isCheck?: boolean;
  isGameOver?: boolean;
  onLumiSpeechUpdate?: (text: string) => void;
  onExecuteAction?: (action: LumiBoardAction) => void;
}

const PRESET_PROMPTS = [
  { label: "🏆 Magnus vs Anand 2014 Move 12", prompt: "Load magnus vs Viswanathan World Chess Championship 2014 match move 12" },
  { label: "💡 Best Move", prompt: "What is the best move here and why?" },
  { label: "🎯 Strategy", prompt: "What strategic plan should I follow in this position?" },
  { label: "👑 King Safety", prompt: "How safe is my king right now?" },
  { label: "🛡️ Threats", prompt: "Are there any hidden tactical threats against me?" },
  { label: "📖 Opening", prompt: "Can you explain this opening and key ideas?" },
];

export default function LumiChatModal({
  isOpen,
  onClose,
  fen,
  lastMove,
  bestMove,
  evalCentipawns,
  opening,
  turn,
  isCheck,
  isGameOver,
  onLumiSpeechUpdate,
  onExecuteAction,
}: LumiChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial",
      role: "lumi",
      text: "✨ Greetings! I am Lumi, your chess companion. Ask me anything about our current position, strategy, king safety, or tactical plans!",
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, messages, loading]);

  if (!isOpen) return null;

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: trimmed,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const res = await fetch("/api/chess/lumi-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          fen,
          lastMove,
          bestMove,
          evalCentipawns,
          opening,
          turn,
          isCheck,
          isGameOver,
          history: messages.slice(-6).map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      if (!res.ok) throw new Error("Failed to reach Lumi");
      const data = await res.json();
      const replyText = data.reply || "✨ Play with grace and trust your piece coordination!";

      if (data.action && onExecuteAction) {
        onExecuteAction(data.action);
      }

      const lumiMsg: ChatMessage = {
        id: `l-${Date.now()}`,
        role: "lumi",
        text: replyText,
        timestamp: Date.now(),
        action: data.action,
      };

      setMessages((prev) => [...prev, lumiMsg]);
      if (onLumiSpeechUpdate) {
        onLumiSpeechUpdate(replyText);
      }
    } catch (err) {
      console.warn("Lumi chat error:", err);
      const fallbackMsg: ChatMessage = {
        id: `l-${Date.now()}`,
        role: "lumi",
        text: "✨ Trust the harmony of your pieces. Look to control the center and safeguard your king!",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputText);
    }
  };

  const evalFormatted =
    evalCentipawns !== undefined
      ? `${evalCentipawns > 0 ? "+" : ""}${(evalCentipawns / 100).toFixed(2)}`
      : "0.00";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl bg-[#12131c] border border-amber-500/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh] h-[640px]">
        {/* Glow Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-amber-950/20 via-[#151724] to-purple-950/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-2xl overflow-hidden border-2 border-amber-400/40 shadow-lg shadow-amber-500/20 shrink-0">
              <Image
                src="/lumi-companion.jpg"
                alt="Lumi AI Companion"
                fill
                sizes="44px"
                loading="eager"
                className="object-cover"
              />
              <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-black animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-heading font-extrabold text-white text-base sm:text-lg">
                  Lumi
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-400/15 border border-amber-400/30 text-amber-300">
                  AI Chess Companion
                </span>
              </div>
              <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>
                  {opening || "Standard Position"} • Eval:{" "}
                  <strong className="text-amber-300 font-mono">{evalFormatted}</strong>
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setMessages([
                  {
                    id: "reset",
                    role: "lumi",
                    text: "✨ Fresh board, fresh minds! What shall we analyze together?",
                    timestamp: Date.now(),
                  },
                ]);
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all text-xs"
              title="Clear conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
              title="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Board Status Strip */}
        <div className="px-4 py-2 bg-black/30 border-b border-white/5 flex items-center justify-between text-[11px] text-gray-400 overflow-x-auto whitespace-nowrap scrollbar-none">
          <div className="flex items-center gap-2">
            <span>Turn: <strong className="text-white">{turn === "w" ? "White" : "Black"}</strong></span>
            {bestMove && (
              <span>• Engine Best: <strong className="text-emerald-400 font-mono">{bestMove}</strong></span>
            )}
            {isCheck && <span className="text-rose-400 font-bold">• IN CHECK</span>}
          </div>
          <span className="text-purple-300">ChakraChess Live</span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl overflow-hidden border border-amber-400/30 shrink-0 mt-0.5">
                    <Image
                      src="/lumi-companion.jpg"
                      alt="Lumi"
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    isUser
                      ? "bg-purple-600 text-white rounded-tr-none font-medium"
                      : "bg-[#1a1c2b] border border-white/10 text-gray-200 rounded-tl-none whitespace-pre-line"
                  }`}
                >
                  <div>{msg.text}</div>

                  {msg.action && (
                    <div className="mt-3 p-3 rounded-xl bg-amber-500/15 border border-amber-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                        <div>
                          <div className="font-bold text-amber-200 text-xs">
                            ⚡ Board Action: {msg.action.title}
                          </div>
                          {msg.action.moveNumber && (
                            <div className="text-[11px] text-amber-300/80">
                              Position active at Move {msg.action.moveNumber}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={onClose}
                        className="px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-all shadow-md shrink-0 self-start sm:self-auto flex items-center gap-1 cursor-pointer"
                        title="Close chat and view the position on board"
                      >
                        <span>View on Board</span>
                        <span>♟️</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 justify-start items-center text-xs text-amber-300">
              <div className="w-8 h-8 rounded-xl overflow-hidden border border-amber-400/30 shrink-0">
                <Image
                  src="/lumi-companion.jpg"
                  alt="Lumi"
                  width={32}
                  height={32}
                  className="object-cover"
                />
              </div>
              <div className="bg-[#1a1c2b] border border-white/10 rounded-2xl rounded-tl-none p-3 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span className="italic">Lumi is listening to the pieces whisper...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-white/5 bg-[#0e0f17] overflow-x-auto scrollbar-none flex items-center gap-1.5">
          {PRESET_PROMPTS.map((item, i) => (
            <button
              key={i}
              onClick={() => sendMessage(item.prompt)}
              disabled={loading}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-amber-500/15 border border-white/10 hover:border-amber-400/40 text-[11px] font-medium text-gray-300 hover:text-amber-200 whitespace-nowrap transition-all disabled:opacity-50"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-[#12131c]">
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask Lumi anything about this position..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="w-full pl-4 pr-12 py-3 bg-[#1a1c2b] border border-white/10 rounded-2xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/60 shadow-inner"
            />
            <button
              onClick={() => sendMessage(inputText)}
              disabled={!inputText.trim() || loading}
              className="absolute right-2 p-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-gray-800 disabled:text-gray-600 text-slate-950 font-bold transition-all shadow-md shadow-amber-500/20"
              title="Send to Lumi"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
