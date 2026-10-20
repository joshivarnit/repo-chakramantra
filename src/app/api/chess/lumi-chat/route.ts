import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { findFamousGameByQuery } from "@/components/chess/famous-games";

interface LumiChatRequest {
  message: string;
  fen?: string;
  lastMove?: string;
  bestMove?: string;
  evalCentipawns?: number;
  opening?: string;
  turn?: "w" | "b";
  isCheck?: boolean;
  isGameOver?: boolean;
  history?: Array<{ role: "user" | "lumi"; text: string }>;
}

export async function POST(req: NextRequest) {
  try {
    const body: LumiChatRequest = await req.json();
    const {
      message,
      fen,
      lastMove,
      bestMove,
      evalCentipawns,
      opening,
      turn,
      isCheck,
      isGameOver,
      history = [],
    } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Check if user requested loading or exploring a famous historical match / move
    const matched = findFamousGameByQuery(message);
    if (matched) {
      const moveNum = matched.moveNumber;
      const moveDesc = moveNum ? `move ${moveNum}` : 'the starting position';
      let commentary = `✨ Loading **${matched.game.white} vs. ${matched.game.black}** from the ${matched.game.event} at **${moveDesc}** directly onto the board!\n\n${matched.game.description}`;

      if (apiKey && apiKey !== "your_actual_key_here") {
        try {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
          const prompt = `You are Lumi, the wise and encouraging AI chess companion for ChakraChess.
The user asked: "${message}".
We are setting up this historical championship match directly onto the player's board:
- Match: ${matched.game.white} vs ${matched.game.black} (${matched.game.event}, ${matched.game.year})
- Target Move: ${moveNum || 1}
- PGN: ${matched.game.pgn}

Write a concise, 2-paragraph storytelling response confirming that you have loaded the match onto the board at move ${moveNum || 1}. Describe the strategic tension of the position at this move and invite them to explore candidate moves or play from here.
Start with: "✨ Loading ${matched.game.white} vs. ${matched.game.black} (${matched.game.event}) at move ${moveNum || 1} onto the board!"`;

          const aiRes = await model.generateContent(prompt);
          const aiText = aiRes.response.text().trim();
          if (aiText) {
            commentary = aiText;
          }
        } catch {
          // fallback to default commentary
        }
      }

      const moveIdx = matched.moveIndex !== undefined ? matched.moveIndex : (matched.moveNumber ? matched.moveNumber * 2 - 1 : 0);

      return NextResponse.json({
        reply: commentary,
        action: {
          type: "load_game",
          pgn: matched.game.pgn,
          moveNumber: matched.moveNumber,
          moveIndex: moveIdx,
          title: `${matched.game.white} vs. ${matched.game.black} (${matched.game.year})`,
        },
        source: "famous-game-match",
      });
    }

    // Build position context
    const turnStr = turn === "w" ? "White to move" : "Black to move";
    const evalStr =
      evalCentipawns !== undefined
        ? `${evalCentipawns > 0 ? "+" : ""}${(evalCentipawns / 100).toFixed(2)}`
        : "unrated";

    const boardContext = `
CURRENT CHESS POSITION CONTEXT:
- FEN: ${fen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"}
- Turn: ${turnStr}
- Current Opening: ${opening || "Standard Chess Position"}
- Last Move Played: ${lastMove || "None (Game Start)"}
- Stockfish Evaluation: ${evalStr}
- Suggested Best Move: ${bestMove || "Developing pieces towards center"}
- Is In Check: ${isCheck ? "YES" : "NO"}
- Is Game Over: ${isGameOver ? "YES" : "NO"}
`.trim();

    // If Gemini key is available, call Gemini
    if (apiKey && apiKey !== "your_actual_key_here") {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          systemInstruction: `You are Lumi, a wise, encouraging, warm, and highly skilled AI chess companion inside ChakraChess on Chakramantra.
Your personality is insightful, gentle, witty, and passionate about the beauty of chess.
You give actionable, easy-to-understand strategic and tactical advice based on the provided chess position context.
Keep your answers engaging, concise (1 to 3 short paragraphs max), and clear.
Use subtle chess emojis (✨, ♟️, ♞, 👑, 🛡️, 💡) when fitting.
Never be condescending; celebrate smart moves and provide gentle guidance after mistakes.`,
        });

        // Format recent history for conversation
        const conversationContext = history
          .slice(-6)
          .map((h) => `${h.role === "user" ? "Player" : "Lumi"}: ${h.text}`)
          .join("\n");

        const prompt = `${boardContext}

${conversationContext ? `RECENT CONVERSATION:\n${conversationContext}\n` : ""}
Player asks Lumi: "${message}"

Respond directly to the player as Lumi:`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();

        if (responseText) {
          return NextResponse.json({
            reply: responseText,
            source: "gemini",
          });
        }
      } catch (geminiError) {
        console.warn("Gemini API call failed, falling back to local Lumi engine:", geminiError);
      }
    }

    // Intelligent local fallback if Gemini is offline / rate limited
    const fallbackReply = generateLocalLumiReply(message, {
      fen,
      lastMove,
      bestMove,
      evalCentipawns,
      opening,
      turn,
      isCheck,
      isGameOver,
    });

    return NextResponse.json({
      reply: fallbackReply,
      source: "local-fallback",
    });
  } catch (err: unknown) {
    console.error("Lumi chat error:", err);
    return NextResponse.json(
      {
        reply: "✨ I felt a tiny flutter in the astral ether! Whatever move you make next, trust your intuition and keep your pieces active.",
        source: "error-fallback",
      },
      { status: 200 }
    );
  }
}

function generateLocalLumiReply(
  userMsg: string,
  context: {
    fen?: string;
    lastMove?: string;
    bestMove?: string;
    evalCentipawns?: number;
    opening?: string;
    turn?: "w" | "b";
    isCheck?: boolean;
    isGameOver?: boolean;
  }
): string {
  const q = userMsg.toLowerCase();
  const { lastMove, bestMove, evalCentipawns, opening, turn, isCheck, isGameOver } = context;

  if (isGameOver) {
    return "🏆 What a match! The dust has settled over the board. Take a moment to review the game history or run 'Analyze Game' to see every turning point!";
  }

  if (isCheck) {
    return "⚠️ Your king is under direct fire! Look for a way to block the check, capture the attacking piece, or step into a secure square.";
  }

  if (q.includes("best move") || q.includes("what should i play") || q.includes("recommend") || q.includes("what to do") || q.includes("next move")) {
    if (bestMove) {
      return `💡 The board suggests considering **${bestMove}**. It maintains good piece coordination and pressure while keeping your tactical foundation solid.`;
    }
    return `✨ Focus on coordinating your minor pieces, controlling the central squares (e4, d4, e5, d5), and tucking your king into safe castled shelter!`;
  }

  if (q.includes("king") || q.includes("safety") || q.includes("castle")) {
    return "👑 King safety is the heart of strategy! If you haven't castled yet, look for a calm tempo to tuck your sovereign away behind a sturdy pawn shield.";
  }

  if (q.includes("plan") || q.includes("strategy") || q.includes("idea")) {
    const evalScore = evalCentipawns ? (evalCentipawns / 100).toFixed(1) : "balanced";
    return `🎯 With the evaluation sitting around **${evalScore}**, your top priority is piece harmony. Activate your least active piece, contest the open files with rooks, and look for weak enemy outposts.`;
  }

  if (q.includes("opening") || q.includes("what opening")) {
    if (opening) {
      return `📖 We are navigating the **${opening}**! Play natural developing moves and aim for solid pawn structures before launching major attacks.`;
    }
    return "📖 Every great journey starts with classical principles: control the central squares, develop knights before bishops, and don't move the same piece twice without purpose!";
  }

  if (q.includes("threat") || q.includes("danger") || q.includes("attack") || q.includes("hanging")) {
    return "🛡️ Scan the board for undefended pieces! Before launching your own assault, make sure none of your pawns or pieces are sitting on undefended lines.";
  }

  if (q.includes("cheer") || q.includes("confidence") || q.includes("nervous") || q.includes("help me win")) {
    return "✨ You've got this! Chess is a dance of patience and imagination. Breathe, survey all 64 squares, and trust your ideas.";
  }

  if (lastMove) {
    return `✨ After ${lastMove}, the initiative is shifting! Watch how the diagonals open up and seek harmonious harmony between your rooks and queen.`;
  }

  return "✨ Every piece on this board has a story to tell. Ask me about your position, king safety, the best tactical plan, or opening ideas!";
}
