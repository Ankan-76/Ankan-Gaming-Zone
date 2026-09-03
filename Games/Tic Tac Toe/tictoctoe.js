document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration & State ---
    const WINNING_COMBINATIONS = [
        { indices: [0, 1, 2], type: 'row', index: 0 },
        { indices: [3, 4, 5], type: 'row', index: 1 },
        { indices: [6, 7, 8], type: 'row', index: 2 },
        { indices: [0, 3, 6], type: 'col', index: 0 },
        { indices: [1, 4, 7], type: 'col', index: 1 },
        { indices: [2, 5, 8], type: 'col', index: 2 },
        { indices: [0, 4, 8], type: 'diag', index: 0 },
        { indices: [2, 4, 6], type: 'diag', index: 1 }
    ];

    let gameState = ['', '', '', '', '', '', '', '', ''];
    let isGameActive = true;
    let currentPlayer = 'X'; // X starts
    let scores = { X: 0, O: 0 };
    let playerNames = { X: 'Ankan', O: 'Ram' };
    let moveHistory = [];
    let historyStep = -1;

    const STORAGE_KEY_PLAYER_NAMES = 'ticTacToePlayerNames';

    // --- DOM Elements ---
    const cells = document.querySelectorAll('.cell');
    const statusText = document.getElementById('currentTurn');
    const winningLine = document.getElementById('winningLine');
    const restartBtn = document.getElementById('restartBtn');
    const resetBtn = document.getElementById('resetBtn');
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    
    // Inputs & Labels
    const inputX = document.getElementById('playerX');
    const inputO = document.getElementById('playerO');
    const saveXBtn = document.getElementById('saveX');
    const saveOBtn = document.getElementById('saveO');
    
    const scoreNameX = document.getElementById('scoreNameX');
    const scoreNameO = document.getElementById('scoreNameO');
    const scoreValX = document.getElementById('scoreValX');
    const scoreValO = document.getElementById('scoreValO');

    // Toast
    const winnerToastEl = document.getElementById('winnerToast');
    const winnerToast = new bootstrap.Toast(winnerToastEl);
    const winnerText = document.getElementById('winnerText');

    // --- Initialization ---
    init();

    function init() {
        updateTurnIndicator();
        cells.forEach(cell => cell.addEventListener('click', handleCellClick));
        restartBtn.addEventListener('click', restartGame);
        resetBtn.addEventListener('click', resetEverything);
        
        undoBtn.addEventListener('click', undoMove);
        redoBtn.addEventListener('click', redoMove);
        saveXBtn.addEventListener('click', () => updatePlayerName('X'));
        saveOBtn.addEventListener('click', () => updatePlayerName('O'));
    }

    loadPlayerNames();

    // --- Game Logic ---
    function handleCellClick(e) {
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

        if (gameState[clickedCellIndex] !== '' || !isGameActive) {
            return;
        }

        // History Management
        if (historyStep < moveHistory.length - 1) {
            moveHistory = moveHistory.slice(0, historyStep + 1);
        }
        moveHistory.push({ index: clickedCellIndex, player: currentPlayer });
        historyStep++;

        handleCellPlayed(clickedCell, clickedCellIndex);
        handleResultValidation();
        updateUndoRedoState();
    }

    function handleCellPlayed(cell, index) {
        gameState[index] = currentPlayer;
        
        // Add visual element
        if(currentPlayer === 'X') {
            cell.innerHTML = '<i class="bi bi-x-lg"></i>';
            cell.classList.add('x');
        } else {
            cell.innerHTML = '<i class="bi bi-circle"></i>'; // Using circle instead of O for better look
            cell.classList.add('o');
        }
    }

    function handleResultValidation() {
        let roundWon = false;
        let winningCombo = null;

        for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
            const winCondition = WINNING_COMBINATIONS[i];
            let a = gameState[winCondition.indices[0]];
            let b = gameState[winCondition.indices[1]];
            let c = gameState[winCondition.indices[2]];

            if (a === '' || b === '' || c === '') {
                continue;
            }
            if (a === b && b === c) {
                roundWon = true;
                winningCombo = winCondition;
                break;
            }
        }

        if (roundWon) {
            endGame(true, winningCombo);
            return;
        }

        let roundDraw = !gameState.includes("");
        if (roundDraw) {
            endGame(false);
            return;
        }

        handlePlayerChange();
    }

    function handlePlayerChange() {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        updateTurnIndicator();
    }

    function updateTurnIndicator() {
        const name = playerNames[currentPlayer];
        statusText.innerText = `${name} (${currentPlayer})`;
        
        // Toggle class for color
        statusText.className = currentPlayer === 'X' ? 'fw-bold text-x' : 'fw-bold text-o';
        
        // Update the dot color in the pill
        const dot = document.querySelector('.turn-indicator .dot');
        dot.className = currentPlayer === 'X' ? 'dot bg-x me-2' : 'dot bg-o me-2';
    }

    function endGame(hasWinner, combo = null) {
        isGameActive = false;
        
        if (hasWinner) {
            scores[currentPlayer]++;
            updateScoreboard();
            drawWinningLine(combo);
            showToast(`${playerNames[currentPlayer]} (${currentPlayer}) takes the round!`);
            restartBtn.classList.add('shake');
        } else {
            showToast(`It's a draw! No winner this time.`);
        }
    }

    // --- Visuals: Draw Winning Line ---
    function drawWinningLine(combo) {
        const wrapper = winningLine.parentElement;
        const startCell = cells[combo.indices[0]];
        const endCell = cells[combo.indices[2]];

        // Get coordinates relative to the viewport
        const startRect = startCell.getBoundingClientRect();
        const endRect = endCell.getBoundingClientRect();
        const wrapperRect = wrapper.getBoundingClientRect();

        // Calculate centers relative to the wrapper
        const startX = (startRect.left - wrapperRect.left) + (startRect.width / 2);
        const startY = (startRect.top - wrapperRect.top) + (startRect.height / 2);
        const endX = (endRect.left - wrapperRect.left) + (endRect.width / 2);
        const endY = (endRect.top - wrapperRect.top) + (endRect.height / 2);

        // Calculate length and angle
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Extend line to cover full cells (distance is center-to-center)
        const extension = startRect.width; 
        const fullLength = distance + extension;

        // Adjust start position to center the line visually
        const rad = angle * (Math.PI / 180);
        const offsetX = (extension / 2) * Math.cos(rad);
        const offsetY = (extension / 2) * Math.sin(rad);

        const finalX = startX - offsetX;
        const finalY = startY - offsetY;

        winningLine.style.display = 'block';
        winningLine.style.backgroundColor = currentPlayer === 'X' ? 'var(--neon-blue)' : 'var(--neon-green)';
        winningLine.style.boxShadow = currentPlayer === 'X' ? '0 0 15px var(--neon-blue)' : '0 0 15px var(--neon-green)';

        winningLine.style.width = '0'; // Start at 0 for animation
        winningLine.style.transformOrigin = 'left center';
        winningLine.style.top = `${finalY}px`;
        winningLine.style.left = `${finalX}px`;
        winningLine.style.transform = `rotate(${angle}deg) translate(0, -50%)`;

        // Trigger animation
        setTimeout(() => {
            winningLine.style.width = `${fullLength}px`;
        }, 50);

        // Add win animation to cells
        combo.indices.forEach(index => {
            cells[index].classList.add('win-cell');
        });
    }

    // --- State Management ---
    function restartGame() {
        isGameActive = true;
        currentPlayer = 'X';
        gameState = ['', '', '', '', '', '', '', '', ''];
        moveHistory = [];
        historyStep = -1;
        updateTurnIndicator();
        
        // Reset Board Visuals
        cells.forEach(cell => {
            cell.innerHTML = '';
            cell.classList.remove('x', 'o', 'win-cell');
        });
        
        winningLine.style.width = '0';
        setTimeout(() => { winningLine.style.display = 'none'; }, 400);
        updateUndoRedoState();
        restartBtn.classList.remove('shake');
    }

    function updatePlayerName(player) {
        const input = player === 'X' ? inputX : inputO;
        const newName = input.value.trim();
        
        if (newName) {
            playerNames[player] = newName;
            updateScoreboardLabels();
            savePlayerNames();
            updateTurnIndicator();
            // Optional: Show a tiny feedback or toast
        }
    }

    function updateScoreboard() {
        scoreValX.innerText = scores.X;
        scoreValO.innerText = scores.O;
    }
    
    function updateScoreboardLabels() {
        scoreNameX.innerText = `${playerNames.X} (X)`;
        scoreNameO.innerText = `${playerNames.O} (O)`;
        scoreNameX.className = 'fw-bold text-x';
        scoreNameO.className = 'fw-bold text-o';
    }

    function savePlayerNames() {
        localStorage.setItem(STORAGE_KEY_PLAYER_NAMES, JSON.stringify(playerNames));
    }

    function loadPlayerNames() {
        const storedNames = localStorage.getItem(STORAGE_KEY_PLAYER_NAMES);
        if (storedNames)
            playerNames = JSON.parse(storedNames);
    }

    function resetEverything() {
        scores = { X: 0, O: 0 };
        playerNames = { X: 'Ankan', O: 'Ram' };
        inputX.value = 'Ankan';
        inputO.value = 'Ram';
        updateScoreboard();
        updateScoreboardLabels();
        restartGame();
    }
    
    function showToast(message) {
        winnerText.innerText = message;
        winnerToast.show();
    }

    // --- Undo / Redo Logic ---
    function undoMove() {
        if (historyStep < 0 || !isGameActive) return;

        const lastMove = moveHistory[historyStep];

        // Revert Board State
        gameState[lastMove.index] = '';
        const cell = cells[lastMove.index];
        cell.innerHTML = '';
        cell.classList.remove('x', 'o');

        historyStep--;
        currentPlayer = lastMove.player; // Switch back to the player who made the move
        updateTurnIndicator();
        updateUndoRedoState();
    }

    function redoMove() {
        if (historyStep >= moveHistory.length - 1) return;

        historyStep++;
        const nextMove = moveHistory[historyStep];

        currentPlayer = nextMove.player;
        // Apply the move
        handleCellPlayed(cells[nextMove.index], nextMove.index);
        // Validate result (this will switch player if game continues)
        handleResultValidation();
        
        updateUndoRedoState();
    }

    function updateUndoRedoState() {
        undoBtn.disabled = historyStep < 0 || !isGameActive;
        redoBtn.disabled = historyStep >= moveHistory.length - 1;
    }
});