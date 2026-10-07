const cells = document.querySelectorAll(".cell");

const gameContainer = document.getElementById("game-container");
const introModal = document.getElementById("intro-modal");

const loadingStatus = document.getElementById("loading-status");
const startGameButton = document.getElementById("start-game");

const gameStatus = document.getElementById("game-status");

const playerScoreElement = document.getElementById("player-score");
const drawScoreElement = document.getElementById("draw-score");
const aiScoreElement = document.getElementById("ai-score");

const newRoundButton = document.getElementById("new-round");
const resetMatchButton = document.getElementById("reset-match");

const resultModal = document.getElementById("result-modal");
const resultIcon = document.getElementById("result-icon");
const resultTitle = document.getElementById("result-title");
const resultMessage = document.getElementById("result-message");

const playAgainButton = document.getElementById("play-again");
const closeResultButton = document.getElementById("close-result");

const resetModal = document.getElementById("reset-modal");
const confirmResetButton = document.getElementById("confirm-reset");
const cancelResetButton = document.getElementById("cancel-reset");

let board = Array(9).fill(null);

let currentTurn = "player";
let gameActive = true;

let playerScore = 0;
let aiScore = 0;
let drawScore = 0;

const winningPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    [0, 4, 8],
    [2, 4, 6]
];


// Render the current board values
function renderBoard() {
    cells.forEach((cell, index) => {
        cell.textContent = "";

        cell.classList.remove(
            "player",
            "ai",
            "winner"
        );

        cell.disabled = false;

        if (board[index] === "X") {
            cell.textContent = "X";
            cell.classList.add("player");
        }

        if (board[index] === "O") {
            cell.textContent = "O";
            cell.classList.add("ai");
        }

        if (!gameActive || board[index]) {
            cell.disabled = true;
        }
    });
}


// Update the scoreboard
function matchScore() {
    playerScoreElement.textContent = playerScore;
    drawScoreElement.textContent = drawScore;
    aiScoreElement.textContent = aiScore;
}


// Update the message above the board
function updateStatus() {
    if (!gameActive) {
        return;
    }

    if (currentTurn === "player") {
        gameStatus.textContent = "Your turn";
    } else {
        gameStatus.textContent = "AI is thinking...";
    }
}


// Find the winning combination
function getWinningPattern(symbol) {
    return winningPatterns.find(pattern => {
        return pattern.every(index => board[index] === symbol);
    });
}


// Check if a player has won
function checkWinner(symbol) {
    return Boolean(getWinningPattern(symbol));
}


// Check if all cells are filled
function checkDraw() {
    return board.every(cell => cell !== null);
}


// Check the result after every move
function checkGameResult() {
    if (checkWinner("X")) {
        endRound("player");
        return true;
    }

    if (checkWinner("O")) {
        endRound("ai");
        return true;
    }

    if (checkDraw()) {
        endRound("draw");
        return true;
    }

    return false;
}


// Update the scores
function updateMatchScore(result) {
    if (result === "player") {
        playerScore++;
    }

    if (result === "ai") {
        aiScore++;
    }

    if (result === "draw") {
        drawScore++;
    }

    matchScore();
}


// Highlight the winning cells
function highlightWinningCells(symbol) {
    const winningPattern = getWinningPattern(symbol);

    if (!winningPattern) {
        return;
    }

    winningPattern.forEach(index => {
        cells[index].classList.add("winner");
    });
}


// Add a small visual effect when a move is made
function animateMove(cell) {
    cell.style.transform = "scale(0.9)";

    setTimeout(() => {
        cell.style.transform = "";
    }, 150);
}


// Show the AI thinking state
function showAIThinking() {
    gameStatus.textContent = "AI is thinking...";
}


// Get available cells
function getEmptyCells() {
    return board
        .map((value, index) => value === null ? index : null)
        .filter(index => index !== null);
}


// Check whether a move would win the game
function wouldWin(index, symbol) {
    board[index] = symbol;

    const result = checkWinner(symbol);

    board[index] = null;

    return result;
}


// Find a winning move
function findWinningMove(symbol) {
    const emptyCells = getEmptyCells();

    for (const index of emptyCells) {
        if (wouldWin(index, symbol)) {
            return index;
        }
    }

    return null;
}


// Choose the AI move
function getAIMove() {
    const emptyCells = getEmptyCells();

    if (emptyCells.length === 0) {
        return null;
    }

    // Try to win first
    const winningMove = findWinningMove("O");

    if (winningMove !== null) {
        return winningMove;
    }

    // Block the player from winning
    const blockingMove = findWinningMove("X");

    if (blockingMove !== null) {
        return blockingMove;
    }

    // Take the center if it is available
    if (board[4] === null) {
        return 4;
    }

    // Prefer a random corner
    const corners = [0, 2, 6, 8]
        .filter(index => board[index] === null);

    if (corners.length > 0) {
        return corners[
            Math.floor(Math.random() * corners.length)
        ];
    }

    // Use any remaining empty cell
    return emptyCells[
        Math.floor(Math.random() * emptyCells.length)
    ];
}


// Start the AI move
function startAIMove() {
    currentTurn = "ai";

    renderBoard();
    showAIThinking();

    setTimeout(() => {
        handleAIMove();
    }, 650);
}


// Handle the AI move
function handleAIMove() {
    if (!gameActive) {
        return;
    }

    const move = getAIMove();

    if (move === null) {
        return;
    }

    board[move] = "O";

    animateMove(cells[move]);

    currentTurn = "player";

    renderBoard();

    if (checkGameResult()) {
        return;
    }

    updateStatus();
}


// Handle the player's move
function handlePlayerMovement(index) {
    if (!gameActive) {
        return;
    }

    if (currentTurn !== "player") {
        return;
    }

    if (board[index] !== null) {
        return;
    }

    board[index] = "X";

    animateMove(cells[index]);

    renderBoard();

    if (checkGameResult()) {
        return;
    }

    startAIMove();
}


// End the current round
function endRound(result) {
    gameActive = false;

    updateMatchScore(result);

    if (result === "player") {
        gameStatus.textContent = "You won the round";
        highlightWinningCells("X");
    }

    if (result === "ai") {
        gameStatus.textContent = "AI won the round";
        highlightWinningCells("O");
    }

    if (result === "draw") {
        gameStatus.textContent = "Round ended in a draw";
    }

    renderBoard();

    setTimeout(() => {
        showResultModal(result);
    }, 500);
}


// Show the result modal
function showResultModal(result) {
    if (result === "player") {
        resultIcon.innerHTML = `
            <i class="fa-solid fa-trophy"></i>
        `;

        resultTitle.textContent = "You Win!";

        resultMessage.textContent =
            "Great move. You connected three in a row.";
    }

    if (result === "ai") {
        resultIcon.innerHTML = `
            <i class="fa-solid fa-robot"></i>
        `;

        resultTitle.textContent = "AI Wins";

        resultMessage.textContent =
            "The AI got three in a row. Try again.";
    }

    if (result === "draw") {
        resultIcon.innerHTML = `
            <i class="fa-solid fa-handshake"></i>
        `;

        resultTitle.textContent = "It's a Draw";

        resultMessage.textContent =
            "Neither side could find a winning combination.";
    }

    resultModal.classList.add("show");
}


// Close the result modal
function closeResultModal() {
    resultModal.classList.remove("show");
}


// Start a new round
function startNewRound() {
    closeResultModal();

    board = Array(9).fill(null);

    currentTurn = "player";
    gameActive = true;

    renderBoard();
    updateStatus();
}


// Show the reset confirmation
function showResetModal() {
    resetModal.classList.add("show");
}


// Hide the reset confirmation
function hideResetModal() {
    resetModal.classList.remove("show");
}


// Reset the entire match
function resetMatch() {
    playerScore = 0;
    aiScore = 0;
    drawScore = 0;

    board = Array(9).fill(null);

    currentTurn = "player";
    gameActive = true;

    matchScore();
    renderBoard();
    updateStatus();

    hideResetModal();
    closeResultModal();
}


// Intro loading sequence
const loadingMessages = [
    "INITIALIZING GAME",
    "PREPARING BOARD",
    "CONNECTING AI",
    "READY TO PLAY"
];

let loadingIndex = 0;

const loadingInterval = setInterval(() => {
    loadingIndex++;

    if (loadingIndex < loadingMessages.length) {
        loadingStatus.textContent =
            loadingMessages[loadingIndex];
    }
}, 700);


// Show the start button after loading
setTimeout(() => {
    clearInterval(loadingInterval);

    loadingStatus.textContent = "READY TO PLAY";

    startGameButton.classList.add("show");
}, 2800);


// Start the actual game
startGameButton.addEventListener("click", () => {
    introModal.classList.add("hide");

    setTimeout(() => {
        gameContainer.classList.add("show");
    }, 500);
});


// Handle board clicks
cells.forEach(cell => {
    cell.addEventListener("click", () => {
        const index = Number(cell.dataset.index);

        handlePlayerMovement(index);
    });
});


// Start another round
newRoundButton.addEventListener("click", () => {
    startNewRound();
});


// Play again from the result modal
playAgainButton.addEventListener("click", () => {
    startNewRound();
});


// Close the result modal
closeResultButton.addEventListener("click", () => {
    closeResultModal();
});


// Open reset confirmation
resetMatchButton.addEventListener("click", () => {
    showResetModal();
});


// Confirm match reset
confirmResetButton.addEventListener("click", () => {
    resetMatch();
});


// Cancel match reset
cancelResetButton.addEventListener("click", () => {
    hideResetModal();
});


// Close modals when clicking outside
resultModal.addEventListener("click", event => {
    if (event.target === resultModal) {
        closeResultModal();
    }
});

resetModal.addEventListener("click", event => {
    if (event.target === resetModal) {
        hideResetModal();
    }
});


// Prepare the game
renderBoard();
matchScore();
updateStatus();