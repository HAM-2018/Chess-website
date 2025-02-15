import {isValidMove, generateMoves, } from "./chess.js";

// Piece values
const pieceValues: Record<string, number> = {
    "♙": 1, "♖": 5, "♘": 3, "♗": 3, "♕": 9, "♔": 100,
    "♟": -1, "♜": -5, "♞": -3, "♝": -3, "♛": -9, "♚": -100
};

// sum pieces

export function sumPieces (board: (string | null)[][]): number{
    let score = 0;

    for(let row = 0; row < 8; row++){
        for(let col = 0; col < 8; col++){
            const piece = board[row][col];
            if (piece){
                score += pieceValues[piece] || 0;
            }
        }
    }
    return score;
}
// Find the best score and minimize recursion
export function miniMax(
    board: (string | null)[][],
    depth: number,
    isMax: boolean,
    a: number,
    b: number
): { score: number, move: [number, number, number, number] | null } {
    
    if (depth === 0) {
        return { score: sumPieces(board), move: null };
    }

    let bestMove: [number, number, number, number] | null = null;
    let maxScore = isMax ? -Infinity : Infinity;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];

            if (piece && ((isMax && pieceValues[piece] > 0) || (!isMax && pieceValues[piece] < 0))) {
                const moves = generateMoves(row, col, board, isMax);

                for (const [toRow, toCol] of moves) {
                    const tempMove = board[toRow][toCol];
                    board[toRow][toCol] = board[row][col];
                    board[row][col] = null;

                    const result = miniMax(board, depth - 1, !isMax, a, b);
                    const score = result.score; // Extract score

                    // Undo the move
                    board[row][col] = board[toRow][toCol];
                    board[toRow][toCol] = tempMove;

                    // Track the best move
                    if (isMax) {
                        if (score > maxScore) {
                            maxScore = score;
                            bestMove = [row, col, toRow, toCol]; // Store best move
                        }
                        a = Math.max(a, maxScore);
                    } else {
                        if (score < maxScore) {
                            maxScore = score;
                            bestMove = [row, col, toRow, toCol]; 
                        }
                        b = Math.min(b, maxScore);
                    }
                    if (b <= a) break;
                }
            }
        }
    }
    
    return { score: maxScore, move: bestMove }; // Always return an object
}


export function bestAIPlay(board: (string | null)[][], depth: number, isMax: boolean): [number, number, number, number] | null {
    const { move } = miniMax(board, depth, isMax, -Infinity, Infinity);
    return move;
}