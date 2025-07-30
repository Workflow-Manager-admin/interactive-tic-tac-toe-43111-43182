import React, { useState, useEffect } from 'react';
import './App.css';

/* Color Palette & Theme
   primary: #4F8EF7 (blue)
   accent:  #F7B32B (yellow-accent)
   secondary: #ffffff (white bg)
   Modern, minimalistic, light
*/

const COLOR_PRIMARY = "#4F8EF7";
const COLOR_ACCENT = "#F7B32B";
const COLOR_BG = "#ffffff";
const COLOR_CELL = "#f5f7fa";
const COLOR_BORDER = "#e0e3ea";
const COLOR_TEXT = "#20232a";
const COLOR_WIN = COLOR_ACCENT;

const AI_DELAY_MS = 450;

// --- Tic Tac Toe AI (Minimax, depth-1 for BEST UX) ---
function getBestAIMove(board, player) {
  // 'player': "O" (AI)
  const opponent = player === "X" ? "O" : "X";
  const emptyIndices = board
    .map((cell, i) => (cell === null ? i : null))
    .filter(i => i !== null);

  // First: check winning move for self
  for (const idx of emptyIndices) {
    const copy = [...board];
    copy[idx] = player;
    if (calculateWinner(copy)?.winner === player) {
      return idx;
    }
  }
  // Second: block opponent's win
  for (const idx of emptyIndices) {
    const copy = [...board];
    copy[idx] = opponent;
    if (calculateWinner(copy)?.winner === opponent) {
      return idx;
    }
  }
  // Third: prefer center/corners
  if (emptyIndices.includes(4)) return 4;
  const corners = [0, 2, 6, 8].filter(i => emptyIndices.includes(i));
  if (corners.length > 0) return corners[0];

  // Take random remaining cell
  return emptyIndices.length > 0
    ? emptyIndices[Math.floor(Math.random() * emptyIndices.length)]
    : null;
}

// --- Calculate winner/win positions ---
function calculateWinner(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  for (let [a, b, c] of lines) {
    if (
      board[a] && board[a] === board[b] && board[a] === board[c]
    ) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  // If no winner and board full, it's a draw
  if (board.every(cell => cell !== null)) {
    return { draw: true };
  }
  return null;
}

// --- Main Game ---
function App() {
  // "human" or "ai"
  const [mode, setMode] = useState("human");
  // 'X' or 'O'
  const [playerStarts, setPlayerStarts] = useState("X");
  // Game state
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [status, setStatus] = useState("playing"); // "playing" | "won" | "draw"
  const [winLine, setWinLine] = useState([]);
  // Scoreboard
  const [score, setScore] = useState({ X: 0, O: 0, Draw: 0 });

  // For showing who is human (in AI mode, "X" is always human)
  const isHumanTurn =
    mode === "human"
      ? true
      : (xIsNext && playerStarts === "X") || (!xIsNext && playerStarts === "O");

  // Effect: check for game over
  useEffect(() => {
    const res = calculateWinner(board);
    if (res?.winner) {
      setStatus("won");
      setWinLine(res.line);
      setScore(prev => ({
        ...prev,
        [res.winner]: prev[res.winner] + 1
      }));
    } else if (res?.draw) {
      setStatus("draw");
      setScore(prev => ({
        ...prev,
        Draw: prev.Draw + 1
      }));
    }
  }, [board]);

  // Effect: handle AI move (only when needed)
  useEffect(() => {
    if (
      mode === "ai" &&
      status === "playing" &&
      !isHumanTurn
    ) {
      // Find best move for AI ("O" if playerStarts "X", else "X")
      const aiPlayer = xIsNext ? "X" : "O";
      const move = getBestAIMove(board, aiPlayer);
      if (typeof move === "number") {
        const timer = setTimeout(() => {
          handleCellClick(move, true);
        }, AI_DELAY_MS);
        return () => clearTimeout(timer);
      }
    }
    // eslint-disable-next-line
  }, [xIsNext, board, status, mode, playerStarts]);

  // PUBLIC_INTERFACE
  function handleCellClick(idx, isAI = false) {
    if (board[idx] !== null || status !== "playing") return;
    // In AI mode, block human click if not their turn
    if (mode === "ai" && !isAI && !isHumanTurn) return;
    const curr = xIsNext ? "X" : "O";
    const newBoard = [...board];
    newBoard[idx] = curr;
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  }

  // PUBLIC_INTERFACE
  function resetBoard(newStarter = playerStarts) {
    setBoard(Array(9).fill(null));
    setXIsNext(newStarter === "X");
    setStatus("playing");
    setWinLine([]);
    setPlayerStarts(newStarter);
  }

  // PUBLIC_INTERFACE
  function handleNewGame(selMode) {
    setMode(selMode);
    setPlayerStarts("X"); // Always let human start as X
    setScore({ X: 0, O: 0, Draw: 0 });
    resetBoard("X");
  }

  // PUBLIC_INTERFACE
  function handleRestartGame() {
    // Alternate starter if human vs human, always X for AI
    let nextStarter;
    if (mode === "ai") {
      nextStarter = "X";
    } else {
      nextStarter = playerStarts === "X" ? "O" : "X";
    }
    resetBoard(nextStarter);
  }

  // PUBLIC_INTERFACE
  function getStatusText() {
    if (status === "won") {
      return `Winner: ${xIsNext ? "O" : "X"}`;
    }
    if (status === "draw") {
      return "It's a draw!";
    }
    if (mode === "ai" && !isHumanTurn) {
      return "AI thinking...";
    }
    return `Turn: ${xIsNext ? "X" : "O"}`;
  }

  // Theme adoption (for color variables in index.html <head> or App.css)
  // Could be further improved, color variables injected in App.css

  // Accessible game symbol rendering
  function CellSymbol({ value }) {
    if (value === "X")
      return (
        <span
          style={{
            color: COLOR_PRIMARY,
            fontWeight: 700,
            fontSize: "2.2rem"
          }}
        >
          X
        </span>
      );
    if (value === "O")
      return (
        <span
          style={{
            color: COLOR_ACCENT,
            fontWeight: 700,
            fontSize: "2.2rem"
          }}
        >
          O
        </span>
      );
    return "";
  }

  // PUBLIC_INTERFACE
  function GameBoard() {
    return (
      <div className="ttt-grid">
        {board.map((value, i) => {
          let highlight = false;
          if (status === "won" && winLine.includes(i)) highlight = true;
          return (
            <button
              className="ttt-cell"
              key={i}
              aria-label={`Cell ${i + 1} ${value ? value : ""}`}
              onClick={() => handleCellClick(i)}
              disabled={
                board[i] !== null ||
                status !== "playing" ||
                (mode === "ai" && !isHumanTurn)
              }
              style={{
                backgroundColor: highlight ? COLOR_WIN + "33" : COLOR_CELL,
                borderColor: highlight ? COLOR_WIN : COLOR_BORDER,
                color: highlight
                  ? COLOR_WIN
                  : value === "X"
                  ? COLOR_PRIMARY
                  : value === "O"
                  ? COLOR_ACCENT
                  : COLOR_TEXT,
                boxShadow: highlight
                  ? "0 0 0 3px " + COLOR_WIN + "77"
                  : "0 1px 4px #e6e6e6"
              }}
            >
              <CellSymbol value={value} />
            </button>
          );
        })}
      </div>
    );
  }

  // PUBLIC_INTERFACE
  function Scoreboard() {
    // Show either "You"/"AI" or "Player X"/"Player O"
    let labels =
      mode === "ai"
        ? {
            X: "You (X)",
            O: "AI (O)",
            Draw: "Draws"
          }
        : { X: "Player X", O: "Player O", Draw: "Draws" };
    return (
      <div className="ttt-scoreboard">
        <div>
          <span className="sb-x" style={{ color: COLOR_PRIMARY }}>
            {labels.X}
          </span>
          <span className="sb-score">{score.X}</span>
        </div>
        <div>
          <span className="sb-o" style={{ color: COLOR_ACCENT }}>
            {labels.O}
          </span>
          <span className="sb-score">{score.O}</span>
        </div>
        <div>
          <span className="sb-draw" style={{ color: "#888" }}>
            {labels.Draw}
          </span>
          <span className="sb-score">{score.Draw}</span>
        </div>
      </div>
    );
  }

  // PUBLIC_INTERFACE
  function ModeSelector() {
    return (
      <div className="ttt-mode">
        <button
          className={`ttt-btn ${mode === "human" ? "active" : ""}`}
          onClick={() => handleNewGame("human")}
          tabIndex={0}
        >
          Human vs Human
        </button>
        <button
          className={`ttt-btn ${mode === "ai" ? "active" : ""}`}
          onClick={() => handleNewGame("ai")}
          tabIndex={0}
        >
          Play vs AI
        </button>
      </div>
    );
  }

  // Render app
  return (
    <div
      className="ttt-app"
      style={{
        backgroundColor: COLOR_BG,
        minHeight: "100vh"
      }}
    >
      <div className="ttt-container">
        <h1 className="ttt-title">Tic Tac Toe</h1>
        <ModeSelector />
        <div className="ttt-score-container">
          <Scoreboard />
        </div>
        <div className="ttt-status" aria-live="polite">
          {getStatusText()}
        </div>
        <GameBoard />
        <div className="ttt-actions">
          <button
            className="ttt-btn ttt-reset"
            onClick={handleRestartGame}
            tabIndex={0}
            style={{
              marginTop: 8
            }}
          >
            {status === "playing"
              ? "Restart"
              : "New Round"}
          </button>
        </div>
        <footer className="ttt-footer">
          <span>
            <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
              React
            </a>{" "}
            Tic Tac Toe &nbsp; | &nbsp; <span style={{ color: COLOR_ACCENT }}>Minimal, Modern UI</span>
          </span>
        </footer>
      </div>
    </div>
  );
}

export default App;
