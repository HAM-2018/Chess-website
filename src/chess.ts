import { bestAIPlay } from "./miniMaxAI.js";

let gameOver = false;

export function initializeChessGame(singlePlayer: boolean) {
    const gameContainer = document.getElementById("gameContainer") as HTMLDivElement | null;

    if (!gameContainer) {
        console.error("Game container not found!");
        return;
    }

    // Clear existing content in gameContainer
    gameContainer.innerHTML = "";

    // Create the chess board and status bar elements
    const chessBoard = document.createElement("div");
    chessBoard.id = "chessBoard";
    gameContainer.appendChild(chessBoard);

    const checkStatusBar = document.createElement("div");
    checkStatusBar.id = "checkWarning";
    checkStatusBar.textContent = ""; 
    gameContainer.appendChild(checkStatusBar);

    const statusBar = document.createElement("div");
    statusBar.id = "statusBar";
    statusBar.textContent = "It's white's turn.";
    gameContainer.appendChild(statusBar);

    const boardState: (string | null)[][] = initializeBoard();
    let selectedCell: HTMLElement | null = null;
    let currentTurn: "white" | "black" = "white";
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const cell = document.createElement("div");
            cell.classList.add("chess-cell");
            cell.classList.add((row + col) % 2 === 0 ? "light-cell" : "dark-cell");
            cell.dataset.row = row.toString();
            cell.dataset.col = col.toString();
    
            const piece = boardState[row][col];
            if (piece) {
                const pieceElement = document.createElement("span");
                pieceElement.textContent = piece;
                const isWhite = ["♙", "♖", "♘", "♗", "♕", "♔"].includes(piece);
                pieceElement.classList.add("chess-piece", isWhite ? "white-piece" : "black-piece"); 
                cell.appendChild(pieceElement);
            }            
    
            cell.addEventListener("click", () => handleCellClick(row, col, cell));
            chessBoard.appendChild(cell);
        }
    }
    
    gameContainer.appendChild(chessBoard);

    function switchTurn(boardState: (string | null)[][]): void {
        currentTurn = currentTurn === "white" ? "black" : "white";
        console.log(`Turn switched. It's now ${currentTurn}'s turn.`);
    
        updateStatusBar(`It's ${currentTurn}'s turn.`);
        const isWhiteAI = false;
        if (singlePlayer && ((isWhiteAI && currentTurn === "white") || (!isWhiteAI && currentTurn === "black"))) {
            setTimeout(() => aiTurn(boardState, isWhiteAI), 500); // Slight delay for a smoother UI experience
        }
    }
    
    
    function handleCellClick(row: number, col: number, cell: HTMLElement): void {
        if (gameOver) return;
    
        const piece = boardState[row][col];
        console.log("Cell clicked:", { row, col, piece });
    
        if (!statusBar) {
            return;
        }
        // If no piece is selected, select one
        if (selectedCell === null) {
            if (piece && !isTurnValid(piece)) {
                updateStatusBar(`It's ${currentTurn}'s turn. You can't move the opponent's piece.`);
                return;
            }
    
            if (piece) {
                selectedCell = cell;
                selectedCell.style.outline = "2px solid red";
            }
        } else {
            const prevRow = parseInt(selectedCell.dataset.row!, 10);
            const prevCol = parseInt(selectedCell.dataset.col!, 10);
    
            if (prevRow === row && prevCol === col) {
                selectedCell.style.outline = "";
                selectedCell = null;
                return;
            }
    
            // Validate the move only if moving to a new square
            if (isValidMove(prevRow, prevCol, row, col, boardState)) {
                movePiece(prevRow, prevCol, row, col);
                switchTurn(boardState);
                selectedCell.style.outline = ""; 
                selectedCell = null;
            } else {
                updateStatusBar("Invalid move.");
            }
        }
    }
    
     function movePiece(fromRow: number, fromCol: number, toRow: number, toCol: number): void {
        const movingPiece = boardState[fromRow][fromCol] ?? "";
    
        //Ensure the piece retains its correct color
        const isWhite = ["♙", "♖", "♘", "♗", "♕", "♔"].includes(movingPiece);
    
        // Find the HTML elements
        const fromCell = document.querySelector(`[data-row="${fromRow}"][data-col="${fromCol}"]`) as HTMLElement;
        const toCell = document.querySelector(`[data-row="${toRow}"][data-col="${toCol}"]`) as HTMLElement;
    
        fromCell.innerHTML = "";

        const pieceElement = document.createElement("span");
        pieceElement.textContent = movingPiece;
        pieceElement.classList.add("chess-piece", isWhite ? "white-piece" : "black-piece");
    
        toCell.innerHTML = ""; 
        toCell.appendChild(pieceElement);
    
        boardState[toRow][toCol] = movingPiece;
        boardState[fromRow][fromCol] = null;
    
        const opponentKingPos = kingPosition(boardState, currentTurn !== "white");
        const whiteKing = kingPosition(boardState, true);
        const blackKing = kingPosition(boardState, false);

        let whiteKingCheck = false;
        let blackKingCheck = false;

        if(whiteKing){
            const [whiteKingRow, whiteKingCol] = whiteKing;
            whiteKingCheck = check(boardState, whiteKingRow, whiteKingCol, true);
        }
        if(blackKing){
            const [blackKingRow, blackKingCol] = blackKing;
            blackKingCheck = check(boardState, blackKingRow, blackKingCol, false);
        }
        if (whiteKingCheck){
            updateCheckWarning("White is In check!");
        } else if (blackKingCheck){
            updateCheckWarning("Black is in check!");
        } else {
            updateCheckWarning("");
        }
        if (whiteKingCheck && checkMate({ board: boardState, isWhite: true })) {
            updateCheckWarning("Checkmate! Black wins!");
            updateStatusBar("Game Over.");
            gameOver = true;
        } else if (blackKingCheck && checkMate({ board: boardState, isWhite: false })) {
            updateCheckWarning("Checkmate! White wins!");
            updateStatusBar("Game Over.");
            gameOver = true;
        }
        
    }

    function aiTurn(board: (string | null)[][], isWhiteAI: boolean): void {
        const depth = 3;
    
        const bestMove = bestAIPlay(board, depth, isWhiteAI);
    
        if (bestMove) {
            const [fromRow, fromCol, toRow, toCol] = bestMove;
    
            movePiece(fromRow, fromCol, toRow, toCol); 
    
            console.log(`AI moved from (${fromRow}, ${fromCol}) to (${toRow}, ${toCol})`);
        } else {
            console.log("AI has no valid moves.");
        }
    
        switchTurn(boardState);
    }
    
    function updateStatusBar(message: string): void {
        const statusBar = document.getElementById("statusBar");
        if (!statusBar) return;
    
        console.log("Updating main status bar:", message);
        statusBar.textContent = message;
    }

    function updateCheckWarning(message: string): void {
        const checkWarning = document.getElementById("checkWarning");
        if (!checkWarning) return;
        console.log("Check status updated:", message);
        checkWarning.textContent = message;
    
        if (!message.includes("Checkmate") && message !== "") {
            setTimeout(() => {
                if (checkWarning.textContent === message && !gameOver) {
                    checkWarning.textContent = "";
                }
            }, 5000);
        }
    }

    function isTurnValid(piece: string): boolean {
        const whitePieces = new Set(["♙", "♖", "♘", "♗", "♕", "♔"]);
        const blackPieces = new Set(["♟", "♜", "♞", "♝", "♛", "♚"]);
    
        if (!whitePieces.has(piece) && !blackPieces.has(piece)) {
            return false;
        }
    
        return (currentTurn === "white" && whitePieces.has(piece)) ||
               (currentTurn === "black" && blackPieces.has(piece));
    }
    
}

    function initializeBoard(): (string | null)[][] {

        return [
            ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
            ["♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟"],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            ["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
            ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"],
        ];
    }


    function isSameSide(piece1: string, piece2: string): boolean {
        const whitePieces = new Set(["♙", "♖", "♘", "♗", "♕", "♔"]);
        const isWhite = (piece: string) => whitePieces.has(piece);
        return isWhite(piece1) === isWhite(piece2);
    }

    function isValidMove(
        fromRow: number,
        fromCol: number,
        toRow: number,
        toCol: number,
        board: (string | null)[][],
        skipCheck = false
    ): boolean {
        const piece = board[fromRow][fromCol];
        if (!piece) return false;
    
        const target = board[toRow][toCol];
        if (target && isSameSide(piece, target)) return false;
    
        const whitePieces = new Set(["♙", "♖", "♘", "♗", "♕", "♔"]);
        const isWhite = whitePieces.has(piece);
    
        // Simulate the move
        const temp = board[toRow][toCol];
        board[toRow][toCol] = board[fromRow][fromCol];
        board[fromRow][fromCol] = null;
    
        if (!skipCheck) {
            const kingPos = kingPosition(board, isWhite);
            if (kingPos) {
                const [kingRow, kingCol] = kingPos;
                if (check(board, kingRow, kingCol, isWhite)) {
                    // Undo the move
                    board[fromRow][fromCol] = board[toRow][toCol];
                    board[toRow][toCol] = temp;
                    return false; // king is in check
                }
            }
        }
        // Undo move after validation
        board[fromRow][fromCol] = board[toRow][toCol];
        board[toRow][toCol] = temp;

        switch (piece) {
            case "♙":
                return validatePawnMove(fromRow, fromCol, toRow, toCol, board, true);
            case "♟":
                return validatePawnMove(fromRow, fromCol, toRow, toCol, board, false);
            case "♖":
            case "♜":
                return validateRookMove(fromRow, fromCol, toRow, toCol, board);
            case "♗":
            case "♝":
                return validateBishopMove(fromRow, fromCol, toRow, toCol, board);
            case "♘":
            case "♞":
                return validateKnightMove(fromRow, fromCol, toRow, toCol, board);
            case "♔":
            case "♚":
                return validateKingMove(fromRow, fromCol, toRow, toCol, board, isWhite);
            case "♕":
            case "♛":
                return validateQueenMove(fromRow, fromCol, toRow, toCol, board);
            default:
                return false;
        }
    }
    
    function generateMoves(
        fromRow: number,
        fromCol: number,
        board: (string | null)[][],
        isWhite: boolean
    ): [number, number][] {
        const moves: [number, number][] = [];
        for (let toRow = 0; toRow < 8; toRow++) {
            for (let toCol = 0; toCol < 8; toCol++) {
                if (isValidMove(fromRow, fromCol, toRow, toCol, board, true)) { //Skipcheck()` to prevent infinite recursion
                    moves.push([toRow, toCol]);
                }
            }
        }
        return moves;
    }
    
    function validatePawnMove(
        fromRow: number,
        fromCol: number,
        toRow: number,
        toCol: number,
        board: (string | null)[][],
        isWhite: boolean
    ): boolean {
        const direction = isWhite ? -1 : 1;
        const startRow = isWhite ? 6 : 1;

        // Diagonal capture
        if (
            Math.abs(toCol - fromCol) === 1 &&
            toRow === fromRow + direction &&
            board[toRow][toCol] !== null &&
            !isSameSide(board[fromRow][fromCol]!, board[toRow][toCol]!)
        ) {
            return true;
        }

        // Forward move
        if (toCol === fromCol && board[toRow][toCol] === null) {
            if (toRow === fromRow + direction) 
                return true;
        }
        // starting forward 2 spots
        if (
            fromRow === startRow &&
            toRow === fromRow + 2 * direction &&
            toCol === fromCol &&
            board[fromRow + direction][fromCol] === null &&
            board[toRow][toCol] === null
        ) {
            return true;
        }

        return false;
    }

    function validateRookMove(
        fromRow: number,
        fromCol: number,
        toRow: number,
        toCol: number,
        board: (string | null)[][]
    ): boolean {
        if (fromRow !== toRow && fromCol !== toCol) return false;

        const rowDir = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
        const colDir = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;

        let currentRow = fromRow + rowDir;
        let currentCol = fromCol + colDir;

        while (currentRow !== toRow || currentCol !== toCol) {
            if (board[currentRow][currentCol] !== null) return false;
            currentRow += rowDir;
            currentCol += colDir;
        }
        const target = board[toRow][toCol];
        if (target && isSameSide(board[fromRow][fromCol]!, target)) {
            return false;
        }

        return true;
    }

    function validateBishopMove(
        fromRow: number,
        fromCol: number,
        toRow: number,
        toCol: number,
        board: (string | null)[][]
    ): boolean {
        if (Math.abs(toRow - fromRow) !== Math.abs(toCol - fromCol)) return false;

        const rowDir = toRow > fromRow ? 1 : -1;
        const colDir = toCol > fromCol ? 1 : -1;

        let currentRow = fromRow + rowDir;
        let currentCol = fromCol + colDir;

        while (currentRow !== toRow || currentCol !== toCol) {
            if (board[currentRow][currentCol] !== null) return false;
            currentRow += rowDir;
            currentCol += colDir;
        }
        const target = board[toRow][toCol];
        if (target && isSameSide(board[fromRow][fromCol]!, target)) return false;

        return true;
    }

    function validateKnightMove(
        fromRow: number,
        fromCol: number,
        toRow: number,
        toCol: number,
        board: (string | null)[][]
    ): boolean {
        const knightMoves = [
            [2, 1], [2, -1], [-2, 1], [-2, -1],
            [1, 2], [1, -2], [-1, 2], [-1, -2],
        ];

        if (
            !knightMoves.some(
                ([rowOffset, colOffset]) =>
                    toRow === fromRow + rowOffset && toCol === fromCol + colOffset
            )
        ) {
            return false;
        }

        const target = board[toRow][toCol];
        if (target && isSameSide(board[fromRow][fromCol]!, target)) return false;

        return true;
    }
    function validateKingMove(
        fromRow: number,
        fromCol: number,
        toRow: number,
        toCol: number,
        board: (string | null)[][],
        isWhite: boolean
    ): boolean {
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
    
        // Ensure the move is within one square
        if (rowDiff > 1 || colDiff > 1) {
            return false;
        }
        // Check if the target square is empty or occupied by an opponent
        const target = board[toRow][toCol];
        if (target && isSameSide(board[fromRow][fromCol]!, target)) {
            return false; // Cannot capture a friendly piece
        }
        // Simulate the move and check if it places the king in check
        const temp = board[toRow][toCol];
        board[toRow][toCol] = board[fromRow][fromCol];
        board[fromRow][fromCol] = null;
    
        const isInCheck = check(board, toRow, toCol, isWhite);
    
        // Undo the move
        board[fromRow][fromCol] = board[toRow][toCol];
        board[toRow][toCol] = temp;
    
        return !isInCheck; 
    }
    function validateQueenMove (
        fromRow: number,
        fromCol: number,
        toRow: number,
        toCol: number,
        board: (string | null)[][]
    ) : boolean {

        if(validateBishopMove(fromRow, fromCol, toRow, toCol, board)){
            return true;
        }
        if (validateRookMove(fromRow, fromCol, toRow, toCol, board)){
            return true;
        }
        return false;
    }
    function kingPosition(board: (string | null)[][], isWhite: boolean): [number, number] | null {
        let kingSymbol = isWhite ? "♔" : "♚"; 
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (board[row][col] === kingSymbol) {
                    return [row, col]; //Return the first king found
                }
            }
        }
        console.error("ERROR: King not found on board!");
        return null;
    }
    
    function check(board: (string | null)[][], kingRow: number, kingCol: number, isWhite: boolean): boolean {
        console.log(`🔍 Checking if the king at [${kingRow}, ${kingCol}] is in check...`);
    
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
    
                if (piece && !isSameSide(piece, isWhite ? "♔" : "♚")) {
                    if (isValidMove(row, col, kingRow, kingCol, board, true)) {  
                        console.log(` King is under attack by ${piece} at [${row}, ${col}]`);
                        return true;
                    }
                }
            }
        }
    
        console.log(" King is safe.");
        return false;
    }
    
    function checkMate({ board, isWhite }: { board: (string | null)[][]; isWhite: boolean; }): boolean {
        const kingPos = kingPosition(board, isWhite);
        if (!kingPos) {
            console.error("ERROR: King not found in checkMate()!");
            return false; 
        }
        const [kingRow, kingCol] = kingPos;
    
        if (!check(board, kingRow, kingCol, isWhite)) {
            console.log("King is NOT in check. Not checkmate.");
            return false;
        }
    
        console.log(` King is in check at [${kingRow}, ${kingCol}].`);
    
        // Check if the king has any valid escape moves
        const directions = [
            [-1,-1], [-1,0], [0,-1], [1,-1], [-1,1], [1,1], [1,0], [0,1]
        ];
        for (const [dirRow, dirCol] of directions) {
            const newRow = dirRow + kingRow;
            const newCol = dirCol + kingCol;
    
            if (
                newRow >= 0 && newRow < 8 &&
                newCol >= 0 && newCol < 8 &&
                validateKingMove(kingRow, kingCol, newRow, newCol, board, isWhite) &&
                !check(board, newRow, newCol, isWhite)
            ) {
                console.log(` King can escape to [${newRow}, ${newCol}]. Not checkmate.`);
                return false; // King has a way out
            }
        }
        let hasDefensiveMove = false;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece && isSameSide(piece, isWhite ? "♔" : "♚")) {
                    const moves = generateMoves(row, col, board, isWhite);
                    
                    for (const [toRow, toCol] of moves) {
                        // Simulate the move
                        const temp = board[toRow][toCol];
                        board[toRow][toCol] = board[row][col];
                        board[row][col] = null;
    
                        const newKingPos = kingPosition(board, isWhite);
                        if (!newKingPos) throw new Error("King not found after move simulation");
                        const [newKingRow, newKingCol] = newKingPos;
    
                        const isStillInCheck = check(board, newKingRow, newKingCol, isWhite);
    
                        board[row][col] = board[toRow][toCol];
                        board[toRow][toCol] = temp;
    
                        if (!isStillInCheck) {
                            console.log(`Defensive move found! Moving ${piece} from [${row}, ${col}] to [${toRow}, ${toCol}]. Not checkmate.`);
                            hasDefensiveMove = true;
                        }
                    }
                }
            }
        }
    
        if (!hasDefensiveMove) {
            console.log(" Checkmate!
            return true;
        }
    
        return false;
    }
    
    export {isValidMove, generateMoves,};
    
    
    

      
      

      
      

