// Attack on Chaiwala - JavaScript version using HTML5 Canvas

// Place this in an HTML file with a <canvas id="gameCanvas"></canvas> element

const CELL_SIZE = 30;
const GRID_WIDTH = 50;
const GRID_HEIGHT = 25;
const SCREEN_WIDTH = CELL_SIZE * GRID_WIDTH;
const SCREEN_HEIGHT = CELL_SIZE * GRID_HEIGHT;

const canvas = document.getElementById('gameCanvas');
canvas.width = SCREEN_WIDTH;
canvas.height = SCREEN_HEIGHT;
const ctx = canvas.getContext('2d');

// Load images
const apa_img = new Image(); apa_img.src = 'apa.jpg';
const chaiwala_img = new Image(); chaiwala_img.src = 'chaiwala.jpg';
const trash_img = new Image(); trash_img.src = 'trash.jpg';
const shojon_img = new Image(); shojon_img.src = 'shojon.jpg';

// Game variables
let apa_pos, trashes, direction, chaiwala_pos, score, game_over, paused, speed;

function resetGame() {
    apa_pos = [Math.floor(GRID_WIDTH / 2), Math.floor(GRID_HEIGHT / 2)];
    trashes = [];
    direction = [0, 0];
    chaiwala_pos = [randInt(0, GRID_WIDTH - 1), randInt(0, GRID_HEIGHT - 1)];
    score = 0;
    game_over = false;
    paused = false;
    speed = 10;
}

function randInt(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
}

function drawGrid() {
    ctx.strokeStyle = '#CCCCCC';
    for (let x = 0; x <= SCREEN_WIDTH; x += CELL_SIZE) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, SCREEN_HEIGHT); ctx.stroke();
    }
    for (let y = 0; y <= SCREEN_HEIGHT; y += CELL_SIZE) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(SCREEN_WIDTH, y); ctx.stroke();
    }
}

function drawScore() {
    ctx.font = 'bold 28px Arial';
    // Shadow
    ctx.fillStyle = 'black';
    ctx.fillText(`Score: ${score}`, 13, 33);
    // Main text
    ctx.fillStyle = 'yellow';
    ctx.fillText(`Score: ${score}`, 10, 30);
}

function drawPaused() {
    ctx.font = 'bold 72px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText('Paused', SCREEN_WIDTH/2 - 117, SCREEN_HEIGHT/2 - 37);
    ctx.fillStyle = 'cyan';
    ctx.fillText('Paused', SCREEN_WIDTH/2 - 120, SCREEN_HEIGHT/2 - 40);
}

function drawGameOver() {
    ctx.font = 'bold 72px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText('Game Over!', SCREEN_WIDTH/2 - 177, SCREEN_HEIGHT/2 - 77);
    ctx.fillStyle = 'red';
    ctx.fillText('Game Over!', SCREEN_WIDTH/2 - 180, SCREEN_HEIGHT/2 - 80);
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText(`Score: ${score}`, SCREEN_WIDTH/2 - 78, SCREEN_HEIGHT/2 + 3);
    ctx.fillStyle = 'yellow';
    ctx.fillText(`Score: ${score}`, SCREEN_WIDTH/2 - 80, SCREEN_HEIGHT/2);
    ctx.fillStyle = 'black';
    ctx.fillText('Press R to Restart', SCREEN_WIDTH/2 - 138, SCREEN_HEIGHT/2 + 63);
    ctx.fillStyle = 'lime';
    ctx.fillText('Press R to Restart', SCREEN_WIDTH/2 - 140, SCREEN_HEIGHT/2 + 60);
}

function draw() {
    // Draw background
    ctx.drawImage(shojon_img, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    drawGrid();
    if (!game_over) {
        ctx.drawImage(apa_img, apa_pos[0] * CELL_SIZE, apa_pos[1] * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        for (let trash of trashes) {
            ctx.drawImage(trash_img, trash[0] * CELL_SIZE, trash[1] * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
        // If chaiwala overlaps with Apa or any trash, draw a black spot
        let overlap = (chaiwala_pos[0] === apa_pos[0] && chaiwala_pos[1] === apa_pos[1]) || trashes.some(t => t[0] === chaiwala_pos[0] && t[1] === chaiwala_pos[1]);
        if (overlap) {
            ctx.beginPath();
            ctx.arc(chaiwala_pos[0] * CELL_SIZE + CELL_SIZE/2, chaiwala_pos[1] * CELL_SIZE + CELL_SIZE/2, CELL_SIZE/3, 0, 2*Math.PI);
            ctx.fillStyle = 'black';
            ctx.fill();
        } else {
            ctx.drawImage(chaiwala_img, chaiwala_pos[0] * CELL_SIZE, chaiwala_pos[1] * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
        drawScore();
        if (paused) drawPaused();
    } else {
        drawGameOver();
    }
}

let lastMove = 0;
function gameLoop(ts) {
    if (!lastMove) lastMove = ts;
    let interval = 1000 / speed;
    if (!paused && !game_over && (direction[0] !== 0 || direction[1] !== 0) && ts - lastMove > interval) {
        lastMove = ts;
        let prev_head = [apa_pos[0], apa_pos[1]];
        apa_pos[0] += direction[0];
        apa_pos[1] += direction[1];
        // Wrap
        apa_pos[0] = (apa_pos[0] + GRID_WIDTH) % GRID_WIDTH;
        apa_pos[1] = (apa_pos[1] + GRID_HEIGHT) % GRID_HEIGHT;
        // Insert previous head at the start of the tail
        if (trashes.length) trashes = [prev_head].concat(trashes);
        // Check collisions with chaiwala
        if (apa_pos[0] === chaiwala_pos[0] && apa_pos[1] === chaiwala_pos[1]) {
            chaiwala_pos = [randInt(0, GRID_WIDTH - 1), randInt(0, GRID_HEIGHT - 1)];
            score++;
            // Increase speed moderately after each bunch of chaiwala
            let bump = score > 0 ? Math.floor(Math.log2(score + 1)) : 0;
            speed = 10 + bump * 2;
        } else {
            // Move: remove the last tail segment if not eating
            if (trashes.length) trashes.pop();
        }
        // If first chaiwala eaten, start tail
        if (trashes.length === 0 && score > 0) trashes = [prev_head];
        // Check self collision
        for (let trash of trashes) {
            if (apa_pos[0] === trash[0] && apa_pos[1] === trash[1]) game_over = true;
        }
    }
    draw();
    requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', function(e) {
    if (game_over && (e.key === 'r' || e.key === 'R')) { resetGame(); return; }
    if (e.key === 'e' || e.key === 'E') { paused = !paused; return; }
    if (e.key === 'r' || e.key === 'R') { resetGame(); return; }
    if (paused || game_over) return;
    if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && !(direction[0] === 0 && direction[1] === 1)) direction = [0, -1];
    else if ((e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') && !(direction[0] === 0 && direction[1] === -1)) direction = [0, 1];
    else if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && !(direction[0] === 1 && direction[1] === 0)) direction = [-1, 0];
    else if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && !(direction[0] === -1 && direction[1] === 0)) direction = [1, 0];
});

resetGame();
requestAnimationFrame(gameLoop);


