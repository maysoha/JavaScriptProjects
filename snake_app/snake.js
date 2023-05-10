const BOARD = document.getElementById("board");
const CONTEXT = BOARD.getContext("2d");
const SOUND_EAT = new Audio("/sounds/eat_sound.mp3");
const SOUND_GAMEOVER = new Audio("/sounds/gameover.mp3");
const SNAKE_PARTS = [];
const TILE_COUNT = 20;
const TILLE_SIZE = BOARD.width / TILE_COUNT - 2;
const OBSTACLE1_IMAGE = new Image();
const OBSTACLE2_IMAGE = new Image();
OBSTACLE1_IMAGE.addEventListener("load", drawGame);
OBSTACLE2_IMAGE.addEventListener("load", drawGame);
OBSTACLE1_IMAGE.src = "/images/obstacle1.png";
OBSTACLE2_IMAGE.src = "/images/obstacle2.png";
OBSTACLE1_IMAGE.removeEventListener("load", drawGame);
OBSTACLE2_IMAGE.removeEventListener("load", drawGame);

const FRUIT_IMAGES = [
  "/images/fruits/fruit1.png",
  "/images/fruits/fruit2.png",
  "/images/fruits/fruit3.png",
  "/images/fruits/fruit4.png",
  "/images/fruits/fruit5.png",
  "/images/fruits/fruit6.png",
];

let fruitImage = new Image();
fruitImage.addEventListener("load", drawGame);
fruitImage.src = FRUIT_IMAGES[0];
fruitImage.removeEventListener("load", drawGame);

class SnakePart {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

let speed = 10;
let snakeX = 10;
let snakeY = 10;
let fruitX = 5;
let fruitY = 5;
let velocityX = 0;
let velocityY = 0;
let tailLength = 2;
let score = 0;
let level = 1;
let obstacle1X;
let obstacle1Y;
let obstacle2X;
let obstacle2Y;
let isGamePaused = false;
let scoreHistory;

window.onload = function () {
  const resetButton = document.getElementById("reset-button");
  scoreHistory = JSON.parse(localStorage.getItem("scoreHistory")) || [];
  updateLocalStorage();

  resetButton.addEventListener("click", () => {
    localStorage.clear();
    scoreHistory = [];
    updateLocalStorage();
  });
};

document.addEventListener("keydown", gamePaused);

document.addEventListener("keydown", gamePaused);

let imagesLoaded = 0;
const totalImages = FRUIT_IMAGES.length + 2;

loadImages();
loadScoreHistory();
drawGame();

function loadImages() {
  FRUIT_IMAGES.forEach((imageUrl) => {
    const image = new Image();
    image.src = imageUrl;
    image.onload = () => {
      checkAllImagesLoaded();
    };
  });
}

function checkAllImagesLoaded() {
  imagesLoaded++;
  if (imagesLoaded === totalImages) {
    drawGame();
  }
}

function resetVariables() {
  SNAKE_PARTS.length = 0;
  speed = 10;
  snakeX = 10;
  snakeY = 10;
  fruitX = 5;
  fruitY = 5;
  velocityX = 0;
  velocityY = 0;
  tailLength = 2;
  score = 0;
  level = 1;
  obstacle1X = undefined;
  obstacle1Y = undefined;
  obstacle2X = undefined;
  obstacle2Y = undefined;
}

function restartGame() {
  document.removeEventListener("keydown", restartGame);
  document.addEventListener("keydown", gamePaused);
  scoreHistory.push("Level: " + level + ", Score: " + score);
  localStorage.setItem("scoreHistory", JSON.stringify(scoreHistory));
  updateLocalStorage();
  resetVariables();
  clearScreen();
  drawGame();
}

function drawPauseScreen() {
  clearScreen();
  CONTEXT.fillStyle = "white";
  CONTEXT.font = "45px Courier New";
  CONTEXT.fillText("Paused", BOARD.width / 4 + 20, BOARD.height / 2 - 50);
  CONTEXT.font = "20px Courier New";
  CONTEXT.fillText(
    "Press space key to resume",
    BOARD.width / 8,
    BOARD.height / 2 + 50
  );
}

function drawGame() {
  if (isGamePaused) {
    drawPauseScreen();
    return;
  }
  updateSnakePosition();
  if (isGameOver()) {
    document.removeEventListener("keydown", gamePaused);
    document.addEventListener("keydown", restartGame);
    return;
  }
  clearScreen();
  checkAppleCollison();
  drawScore();
  drawLevel();
  drawSnake();
  drawFruit();
  if (level > 3) {
    drawObstacle1();
  }
  if (level > 6) {
    drawObstacle2();
  }
  if (level > 9) {
    speed = 15;
  }
  setTimeout(drawGame, 1000 / speed);
}

function isGameOver() {
  let isGameOver = false;
  if (velocityX === 0 && velocityY === 0) {
    return false;
  }
  //SNAKE HIT OBSTACLE
  if (
    (obstacle1X === snakeX && obstacle1Y === snakeY) ||
    (obstacle2X === snakeX && obstacle2Y === snakeY)
  ) {
    isGameOver = true;
  }

  //SNAKE HIT THE WALLS
  else if (
    snakeX < 0 ||
    snakeX === TILE_COUNT ||
    snakeY < 0 ||
    snakeY === TILE_COUNT
  ) {
    isGameOver = true;
  }

  //SNAKE HIT HIMSELF
  else
    for (let i = 0; i < SNAKE_PARTS.length; ++i) {
      let part = SNAKE_PARTS[i];
      if (part.x === snakeX && part.y === snakeY) {
        isGameOver = true;
        break;
      }
    }

  if (isGameOver) {
    SOUND_GAMEOVER.play();
    clearScreen();
    CONTEXT.fillStyle = "white";
    CONTEXT.font = "45px Courier New";
    CONTEXT.fillText("Game Over!", BOARD.width / 6, BOARD.height / 2 - 50);
    CONTEXT.font = "bold 30px Courier New";
    CONTEXT.fillText(`Score: ${score}`, BOARD.width / 3, BOARD.height / 2 + 10);
    CONTEXT.font = "bold 20px Courier New";
    CONTEXT.fillText(
      `Press any key to restart`,
      BOARD.width / 8,
      BOARD.height / 2 + 40
    );
  }
  return isGameOver;
}

function clearScreen() {
  CONTEXT.fillStyle = "#3e3819";
  CONTEXT.fillRect(0, 0, BOARD.width, BOARD.height);
}

function updateSnakePosition() {
  snakeX += velocityX;
  snakeY += velocityY;
}

function drawSnake() {
  CONTEXT.fillStyle = "green";
  for (let i = 0; i < SNAKE_PARTS.length; ++i) {
    let part = SNAKE_PARTS[i];
    CONTEXT.fillRect(
      part.x * TILE_COUNT,
      part.y * TILE_COUNT,
      TILLE_SIZE,
      TILLE_SIZE
    );
  }

  SNAKE_PARTS.push(new SnakePart(snakeX, snakeY)); //add where the head was
  if (SNAKE_PARTS.length > tailLength) {
    SNAKE_PARTS.shift(); //remove the first item in the list (oldest item)
  }

  CONTEXT.fillStyle = "orange";
  CONTEXT.fillRect(
    snakeX * TILE_COUNT,
    snakeY * TILE_COUNT,
    TILLE_SIZE,
    TILLE_SIZE
  );
}

function drawFruit() {
  CONTEXT.drawImage(
    fruitImage,
    fruitX * TILE_COUNT,
    fruitY * TILE_COUNT,
    TILLE_SIZE,
    TILLE_SIZE
  );
}

function drawObstacle1() {
  CONTEXT.drawImage(
    OBSTACLE1_IMAGE,
    obstacle1X * TILE_COUNT,
    obstacle1Y * TILE_COUNT,
    TILLE_SIZE,
    TILLE_SIZE
  );
}

function drawObstacle2() {
  CONTEXT.drawImage(
    OBSTACLE2_IMAGE,
    obstacle2X * TILE_COUNT,
    obstacle2Y * TILE_COUNT,
    TILLE_SIZE,
    TILLE_SIZE
  );
}

function drawScore() {
  CONTEXT.fillStyle = "white";
  CONTEXT.font = "15px Courier New";
  CONTEXT.fillText(`Score: ${score}`, BOARD.width - 90, 20);
}

function drawLevel() {
  CONTEXT.fillStyle = "white";
  CONTEXT.font = "15px Courier New";
  CONTEXT.fillText(`Level: ${level}`, BOARD.width - 390, 20);
}

function checkAppleCollison() {
  if (fruitX === snakeX && fruitY === snakeY) {
    SOUND_EAT.play();
    const COORDINATE_APPLE = getRandomCoordinates();
    fruitX = COORDINATE_APPLE.x;
    fruitY = COORDINATE_APPLE.y;
    ++tailLength;
    ++score;
    if (score > localStorage.getItem("highestScore")) {
      localStorage.setItem("highestScore", score);
    }
    if (level > 3) {
      const COORDINATE_OBSTACLE1 = getRandomCoordinates();
      obstacle1X = COORDINATE_OBSTACLE1.x;
      obstacle1Y = COORDINATE_OBSTACLE1.y;
    }
    if (level > 6) {
      const COORDINATE_OBSTACLE2 = getRandomCoordinates();
      obstacle2X = COORDINATE_OBSTACLE2.x;
      obstacle2Y = COORDINATE_OBSTACLE2.y;
    }
    if (0 == score % 5) {
      ++level;
    }
    generateRandomFruit();
  }
}

document.body.addEventListener("keydown", keyDown);

function keyDown(event) {
  switch (event.code) {
    case "ArrowUp":
      if (velocityY !== 1) {
        velocityX = 0;
        velocityY = -1;
      }
      break;
    case "ArrowDown":
      if (velocityY !== -1) {
        velocityX = 0;
        velocityY = 1;
      }
      break;
    case "ArrowLeft":
      if (velocityX !== 1) {
        velocityX = -1;
        velocityY = 0;
      }
      break;
    case "ArrowRight":
      if (velocityX !== -1) {
        velocityX = 1;
        velocityY = 0;
      }
      break;
  }
}

function getRandomCoordinates() {
  let x, y;
  do {
    x = Math.floor(Math.random() * TILE_COUNT);
    y = Math.floor(Math.random() * TILE_COUNT);
  } while (
    x < 0 ||
    x === TILE_COUNT ||
    y < 0 ||
    y === TILE_COUNT ||
    (x === snakeX && y === snakeY) ||
    (x === obstacle1X && y === obstacle1Y) ||
    (x === obstacle2X && y === obstacle2Y) ||
    (x === fruitX && y === fruitY) ||
    (fruitX === obstacle1X && fruitY === obstacle1Y) ||
    (fruitX === obstacle2X && fruitY === obstacle2Y) ||
    getDistance(
      snakeX * TILE_COUNT,
      snakeY * TILE_COUNT,
      obstacle1X * TILE_COUNT,
      obstacle1Y * TILE_COUNT
    ) <= 7 ||
    getDistance(
      snakeX * TILE_COUNT,
      snakeY * TILE_COUNT,
      obstacle2X * TILE_COUNT,
      obstacle2Y * TILE_COUNT
    ) <= 7 ||
    getDistance(
      fruitX * TILE_COUNT,
      fruitY * TILE_COUNT,
      obstacle1X * TILE_COUNT,
      obstacle1Y * TILE_COUNT
    ) <= 4 ||
    getDistance(
      fruitX * TILE_COUNT,
      fruitY * TILE_COUNT,
      obstacle2X * TILE_COUNT,
      obstacle2Y * TILE_COUNT
    ) <= 4
  );
  return { x, y };
}

function getDistance(point1X, point1Y, point2X, point2Y) {
  return Math.round(
    Math.sqrt((point1X - point2X) ** 2 + (point1Y - point2Y) ** 2)
  );
}

function gamePaused(event) {
  if (event.key === " ") {
    isGamePaused = !isGamePaused;
    drawGame();
  }
}

function generateRandomFruit() {
  let randomIndex = Math.floor(Math.random() * FRUIT_IMAGES.length);
  fruitImage.src = FRUIT_IMAGES[randomIndex];
}

function loadScoreHistory() {
  // Load the score history array from localStorage
  let scoreHistoryStr = localStorage.getItem("scoreHistory");
  if (scoreHistoryStr) {
    scoreHistory = JSON.parse(scoreHistoryStr);
  }
}

function updateLocalStorage() {
  let highestScoreElem = document.getElementById("highest-score");
  let scoreHistoryElem = document.getElementById("score-history");
  highestScoreElem.textContent = localStorage.getItem("highestScore") || 0;
  scoreHistoryElem.textContent = JSON.parse(
    localStorage.getItem("scoreHistory") || "[]"
  ).join(", ");
  let scoreHistoryText = "";
  for (let i = scoreHistory.length - 1; i > -1; --i) {
    scoreHistoryText += "<li>" + scoreHistory[i] + "</li>";
  }

  scoreHistoryElem.innerHTML = "<ul>" + scoreHistoryText + "</ul>";
}
