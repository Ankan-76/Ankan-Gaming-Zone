/**
 * Modern Snake Game
 * Built with HTML5 Canvas & ES6
 */

// --- Constants & Config ---
const CANVAS_SIZE = 400;
const TILE_COUNT = 20;
const TILE_SIZE = CANVAS_SIZE / TILE_COUNT; // 20px
const INITIAL_SPEED = 150; // ms per frame
const SPEED_DECREMENT = 2; // Speed up by 2ms per food eaten
const MIN_SPEED = 60; // Max speed cap

// colors
const COLOR_SNAKE_HEAD = '#ffffff';
const COLOR_FOOD = '#ff00ff';
const COLOR_GRID = 'rgba(255,255,255,0.03)';

// --- DOM Elements ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const finalScoreEl = document.getElementById('finalScore');

// Screens
const startScreen = document.getElementById('startScreen');
const pauseScreen = document.getElementById('pauseScreen');
const gameOverScreen = document.getElementById('gameOverScreen');

// Buttons
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const resumeBtn = document.getElementById('resumeBtn');
const uiPauseBtn = document.getElementById('uiPauseBtn');

// Mobile Controls
const upBtn = document.getElementById('upBtn');
const downBtn = document.getElementById('downBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

// --- Game State ---
let state = {
    running: false,
    paused: false,
    score: 0,
    highScore: localStorage.getItem('snakeHighScore') || 0,
    speed: INITIAL_SPEED,
    lastTime: 0,
    timeAccumulator: 0,
    snake: [],
    velocity: { x: 0, y: 0 },
    nextVelocity: { x: 0, y: 0 }, // Prevent 180-degree turns
    food: { x: 0, y: 0 }
};

// Initialize High Score Display
highScoreEl.innerText = state.highScore;

// --- Game Logic ---

function initGame() {
    state.snake = [
        { x: 10, y: 10 },
        { x: 10, y: 11 },
        { x: 10, y: 12 }
    ];
    state.velocity = { x: 0, y: -1 }; // Start moving up
    state.nextVelocity = { x: 0, y: -1 };
    state.score = 0;
    state.speed = INITIAL_SPEED;
    state.running = true;
    state.paused = false;
    
    updateScoreUI();
    placeFood();
    
    // UI Resets
    startScreen.classList.remove('active');
    gameOverScreen.classList.remove('active');
    pauseScreen.classList.remove('active');
    
    // Start Loop
    state.lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function placeFood() {
    let valid = false;
    while (!valid) {
        state.food = {
            x: Math.floor(Math.random() * TILE_COUNT),
            y: Math.floor(Math.random() * TILE_COUNT)
        };
        
        // Ensure food doesn't spawn on snake
        valid = !state.snake.some(segment => 
            segment.x === state.food.x && segment.y === state.food.y
        );
    }
}

function update(deltaTime) {
    state.timeAccumulator += deltaTime;

    if (state.timeAccumulator > state.speed) {
        state.timeAccumulator = 0; // Reset timer
        
        // Apply queued velocity
        state.velocity = { ...state.nextVelocity };

        // Calculate new head position
        const head = { 
            x: state.snake[0].x + state.velocity.x, 
            y: state.snake[0].y + state.velocity.y 
        };

        // 1. Collision Detection (Walls)
        if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
            gameOver();
            return;
        }

        // 2. Collision Detection (Self)
        if (state.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            gameOver();
            return;
        }

        // Move Snake
        state.snake.unshift(head); // Add new head

        // 3. Check Food
        if (head.x === state.food.x && head.y === state.food.y) {
            state.score += 10;
            state.speed = Math.max(MIN_SPEED, state.speed - SPEED_DECREMENT);
            updateScoreUI();
            placeFood();
            // Don't pop tail (grow)
        } else {
            state.snake.pop(); // Remove tail
        }
    }
}

function draw() {
    // Clear Canvas
    ctx.fillStyle = '#0b1120'; // Match CSS background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grid (Optional, subtle)
    /*
    ctx.strokeStyle = COLOR_GRID;
    ctx.lineWidth = 0.5;
    for (let i = 0; i < TILE_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(i * TILE_SIZE, 0);
        ctx.lineTo(i * TILE_SIZE, CANVAS_SIZE);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * TILE_SIZE);
        ctx.lineTo(CANVAS_SIZE, i * TILE_SIZE);
        ctx.stroke();
    }
    */

    // Draw Food (Neon Glow)
    ctx.shadowBlur = 15;
    ctx.shadowColor = COLOR_FOOD;
    ctx.fillStyle = COLOR_FOOD;
    // Draw rounded rect for food
    const fX = state.food.x * TILE_SIZE + 2;
    const fY = state.food.y * TILE_SIZE + 2;
    ctx.fillRect(fX, fY, TILE_SIZE - 4, TILE_SIZE - 4);
    ctx.shadowBlur = 0; // Reset shadow

    // Draw Snake
    state.snake.forEach((segment, index) => {
        const isHead = index === 0;
        
        if (isHead) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = COLOR_SNAKE_HEAD;
            ctx.fillStyle = COLOR_SNAKE_HEAD;
        } else {
            ctx.shadowBlur = 0;
            // Animated rainbow effect
            const hue = (index * 15 + performance.now() / 10) % 360;
            ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        }

        const sX = segment.x * TILE_SIZE + 1;
        const sY = segment.y * TILE_SIZE + 1;
        ctx.fillRect(sX, sY, TILE_SIZE - 2, TILE_SIZE - 2);
    });
}

function gameLoop(timestamp) {
    if (!state.running) return;

    if (!state.paused) {
        const deltaTime = timestamp - state.lastTime;
        state.lastTime = timestamp;
        
        update(deltaTime);
        draw();
    } else {
        // Keeps time consistent when unpaused
        state.lastTime = timestamp; 
    }
    
    requestAnimationFrame(gameLoop);
}

function gameOver() {
    state.running = false;
    finalScoreEl.innerText = state.score;
    
    // Save High Score
    if (state.score > state.highScore) {
        state.highScore = state.score;
        localStorage.setItem('snakeHighScore', state.highScore);
        highScoreEl.innerText = state.highScore;
    }

    gameOverScreen.classList.add('active');
}

function togglePause() {
    if (!state.running || gameOverScreen.classList.contains('active')) return;
    
    state.paused = !state.paused;
    if (state.paused) {
        pauseScreen.classList.add('active');
    } else {
        pauseScreen.classList.remove('active');
        state.lastTime = performance.now(); // Reset time to prevent jumps
    }
}

function updateScoreUI() {
    scoreEl.innerText = state.score;
}

// --- Input Handling ---

function handleDirection(dx, dy) {
    // Prevent reversing direction
    if (state.velocity.x === 0 && dx !== 0) {
        state.nextVelocity = { x: dx, y: 0 };
    } else if (state.velocity.y === 0 && dy !== 0) {
        state.nextVelocity = { x: 0, y: dy };
    }
}

window.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowUp': e.preventDefault(); handleDirection(0, -1); break;
        case 'ArrowDown': e.preventDefault(); handleDirection(0, 1); break;
        case 'ArrowLeft': e.preventDefault(); handleDirection(-1, 0); break;
        case 'ArrowRight': e.preventDefault(); handleDirection(1, 0); break;
        case ' ': // Spacebar
            e.preventDefault();
            togglePause();
            break;
        case 'Escape': 
            togglePause(); 
            break;
    }
});

// Event Listeners
startBtn.addEventListener('click', initGame);
restartBtn.addEventListener('click', initGame);
resumeBtn.addEventListener('click', togglePause);
uiPauseBtn.addEventListener('click', togglePause);

// Mobile Controls Listeners
upBtn.addEventListener('mousedown', (e) => { e.preventDefault(); handleDirection(0, -1); });
downBtn.addEventListener('mousedown', (e) => { e.preventDefault(); handleDirection(0, 1); });
leftBtn.addEventListener('mousedown', (e) => { e.preventDefault(); handleDirection(-1, 0); });
rightBtn.addEventListener('mousedown', (e) => { e.preventDefault(); handleDirection(1, 0); });

// Touch support for buttons (prevent double tap zoom)
const addTouch = (elem, dx, dy) => {
    elem.addEventListener('touchstart', (e) => {
        e.preventDefault(); // prevents mouse emulation & scrolling
        handleDirection(dx, dy);
    }, { passive: false });
};

addTouch(upBtn, 0, -1);
addTouch(downBtn, 0, 1);
addTouch(leftBtn, -1, 0);
addTouch(rightBtn, 1, 0);

// Initial Draw
draw();