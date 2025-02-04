import { initializeChessGame } from './chess.js';

let gameMode: "1-Player" | "2-Player" | null = null;
let singlePlayer = false;

document.addEventListener('DOMContentLoaded', () => {
    const startMenu = document.getElementById("startMenu") as HTMLDivElement;
    const singlePlayerButton = document.getElementById("singlePlayerButton") as HTMLDivElement;
    const twoPlayerButton = document.getElementById("twoPlayerButton") as HTMLDivElement;
    console.log('DOM fully loaded and parsed. Waiting for game mode selection...');

    singlePlayerButton.addEventListener("click", () => {
        singlePlayer = true;
        gameMode = "1-Player";
        startGame();
    });

    twoPlayerButton.addEventListener("click", () => {
        singlePlayer = false;
        gameMode = "2-Player";
        startGame();
    });

    function startGame() {
        startMenu.classList.add("hidden");

        const chessBoard = document.getElementById('chessBoard');
        if (!chessBoard) {
            console.error('#chessBoard not found in DOM!');
            return;
        }

        // Fade-in effect on load
        chessBoard.style.opacity = "0";
        
        console.log(`Starting game in mode: ${gameMode} (singlePlayer=${singlePlayer})`);
        initializeChessGame(singlePlayer); // 

        setTimeout(() => {
            chessBoard.style.transition = "opacity 1s ease-in-out";
            chessBoard.style.opacity = "1";
        }, 100);
    }
});

    
