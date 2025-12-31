const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');
const playerScoreElem = document.getElementById('player-score');
const aiScoreElem = document.getElementById('ai-score');

// Game objects
const Paddle = function(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.speed = 8;
};

const Ball = function(x, y, radius) {
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.speed = 6;
  this.dx = this.speed * (Math.random() > 0.5 ? 1 : -1);
  this.dy = this.speed * (Math.random() * 2 - 1);
};

let player = new Paddle(20, canvas.height/2-40, 10, 80);
let ai = new Paddle(canvas.width-30, canvas.height/2-40, 10, 80);
let ball = new Ball(canvas.width/2, canvas.height/2, 10);

let playerScore = 0, aiScore = 0;
let upPressed = false, downPressed = false;

// Handle paddle movement by keyboard
document.addEventListener('keydown', function(e) {
  if(e.key === "ArrowUp") upPressed = true;
  if(e.key === "ArrowDown") downPressed = true;
});
document.addEventListener('keyup', function(e) {
  if(e.key === "ArrowUp") upPressed = false;
  if(e.key === "ArrowDown") downPressed = false;
});

// Handle paddle movement by mouse
canvas.addEventListener('mousemove', function(e) {
  // Calculate mouse y relative to canvas
  const rect = canvas.getBoundingClientRect();
  const mouseY = e.clientY - rect.top;
  player.y = mouseY - player.height/2;
  clampPlayerPos();
});

// Prevent paddles from going outside the game area
function clampPlayerPos() {
  if(player.y < 0) player.y = 0;
  if(player.y + player.height > canvas.height)
    player.y = canvas.height - player.height;
}
function clampAiPos() {
  if(ai.y < 0) ai.y = 0;
  if(ai.y + ai.height > canvas.height)
    ai.y = canvas.height - ai.height;
}

function resetBall() {
  ball.x = canvas.width/2;
  ball.y = canvas.height/2;
  ball.dx = ball.speed * (Math.random() > 0.5 ? 1 : -1);
  ball.dy = ball.speed * (Math.random() * 2 - 1);
}

function drawRect(x, y, w, h, color='#fff') {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawBall(ball, color='#fff') {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}

function drawNet() {
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 2;
  for(let i=0; i<canvas.height; i+=40) {
    ctx.beginPath();
    ctx.moveTo(canvas.width/2, i);
    ctx.lineTo(canvas.width/2, i+20);
    ctx.stroke();
  }
}

function update() {
  // Player paddle move by arrow keys
  if(upPressed) player.y -= player.speed;
  if(downPressed) player.y += player.speed;
  clampPlayerPos();

  // AI paddle movement: follow ball, but with some smoothing and error
  let target = ball.y - ai.height/2;
  ai.y += (target - ai.y) * 0.08;
  clampAiPos();

  // Ball movement
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Wall collision
  if(ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
    ball.dy = -ball.dy;
    // Clamp ball within bounds to avoid sticking
    ball.y = Math.max(ball.radius, Math.min(ball.y, canvas.height - ball.radius));
  }

  // Paddle collision detection
  // Player
  if(ball.x - ball.radius < player.x + player.width &&
     ball.y > player.y && ball.y < player.y + player.height) {
    ball.dx = Math.abs(ball.dx);
    // Add spin depending where ball hits paddle
    let hitPos = (ball.y - player.y - player.height/2)/(player.height/2);
    ball.dy += hitPos * 2;
  }
  // AI
  if(ball.x + ball.radius > ai.x &&
     ball.y > ai.y && ball.y < ai.y + ai.height) {
    ball.dx = -Math.abs(ball.dx);
    let hitPos = (ball.y - ai.y - ai.height/2)/(ai.height/2);
    ball.dy += hitPos * 2;
  }

  // Score check
  if(ball.x < 0) {
    aiScore++;
    aiScoreElem.textContent = aiScore;
    resetBall();
  }
  if(ball.x > canvas.width) {
    playerScore++;
    playerScoreElem.textContent = playerScore;
    resetBall();
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawNet();
  drawRect(player.x, player.y, player.width, player.height);
  drawRect(ai.x, ai.y, ai.width, ai.height);
  drawBall(ball);
}

function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

resetBall();
gameLoop();