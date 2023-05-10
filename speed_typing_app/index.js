const RANDOM_QUOTE_API_URL = "http://api.quotable.io/random";

const [
  QUOTE_DISPLAY_ELEMENT,
  QUOTE_INPUT_ELEMENT,
  TIMER_ELEMENT,
  START_BUTTON,
  remainingCharactersElement,
] = [
  "quoteDisplay",
  "quoteInput",
  "timer",
  "startButton",
  "remainingCharacters",
].map((id) => document.getElementById(id));

let timerInterval;
let startTime;
let remainingCharacters = 0;

QUOTE_INPUT_ELEMENT.value = "";
START_BUTTON.addEventListener("click", startGame);

function displayGameHistory() {
  const gameHistory = JSON.parse(localStorage.getItem("gameHistory")) || [];
  const historyListElement = document.getElementById("gameHistory");

  // Remove any existing game history items from the list
  while (historyListElement.firstChild) {
    historyListElement.removeChild(historyListElement.firstChild);
  }

  // Generate HTML elements for each game in the history
  gameHistory.forEach((game) => {
    const listItemElement = document.createElement("li");
    const gameDetailsElement = document.createElement("p");
    gameDetailsElement.innerHTML = `Game ${game.gameNumber}: ${game.totalCharacters} characters, ${game.timeTaken} seconds, ${game.average} seconds for a char`;
    listItemElement.appendChild(gameDetailsElement);
    historyListElement.appendChild(listItemElement);
  });
}

function startGame() {
  renderNewQuote();
  startTimer();
  QUOTE_INPUT_ELEMENT.value = "";
  QUOTE_INPUT_ELEMENT.removeAttribute("readonly"); // enable input
  START_BUTTON.style.display = "none"; // enable input
}

QUOTE_INPUT_ELEMENT.addEventListener("input", () => {
  const arrayQuote = QUOTE_DISPLAY_ELEMENT.querySelectorAll("span");
  const arrayValue = QUOTE_INPUT_ELEMENT.value.split("");
  QUOTE_INPUT_ELEMENT.removeAttribute("readonly");
  let correct = true;
  arrayQuote.forEach((characterSpan, index) => {
    const character = arrayValue[index];
    if (character === null) {
      characterSpan.classList.remove("correct");
      characterSpan.classList.remove("incorrect");
      correct = false;
    } else if (character === characterSpan.innerText) {
      characterSpan.classList.add("correct");
      characterSpan.classList.remove("incorrect");
      remainingCharacters =
        QUOTE_DISPLAY_ELEMENT.innerText.length -
        arrayValue.slice(0, index + 1).join("").length;
      remainingCharactersElement.innerText = remainingCharacters;
    } else {
      characterSpan.classList.remove("correct");
      characterSpan.classList.add("incorrect");
      correct = false;
    }
    if (remainingCharacters < 0) {
      remainingCharacters = 0;
      remainingCharactersElement.innerText = remainingCharacters;
    }
  });

  if (correct) {
    clearInterval(timerInterval);
    START_BUTTON.style.display = "none";
    QUOTE_INPUT_ELEMENT.setAttribute("readonly", true);
    const timeTaken = getTimerTime() || 0;
    const totalCharactersOfQuote = QUOTE_DISPLAY_ELEMENT.innerText.length;
    QUOTE_DISPLAY_ELEMENT.innerHTML = `<h1>You Won in ${timeTaken} seconds!</h1>`;
    const restartButton = document.createElement("button");
    restartButton.innerText = "Restart";
    restartButton.addEventListener("click", () => {
      renderNewQuote();
      startTimer();
      QUOTE_INPUT_ELEMENT.removeAttribute("readonly");
    });
    QUOTE_DISPLAY_ELEMENT.appendChild(restartButton);
    let gameHistory = JSON.parse(localStorage.getItem("gameHistory")) || [];
    const currentGame = {
      gameNumber: gameHistory.length + 1,
      totalCharacters: totalCharactersOfQuote,
      timeTaken: timeTaken,
      average: (totalCharactersOfQuote / timeTaken).toFixed(2),
    };
    gameHistory.push(currentGame);
    localStorage.setItem("gameHistory", JSON.stringify(gameHistory));
    displayGameHistory();
  }
});

async function getRandomQuote() {
  const response = await fetch(RANDOM_QUOTE_API_URL);
  const data = await response.json();
  return data.content;
}

async function renderNewQuote() {
  clearInterval(timerInterval);
  const quote = await getRandomQuote();
  QUOTE_DISPLAY_ELEMENT.innerHTML = "";
  quote.split("").forEach((character) => {
    const characterSpan = document.createElement("span");
    characterSpan.innerText = character;
    QUOTE_DISPLAY_ELEMENT.appendChild(characterSpan);
  });
  QUOTE_INPUT_ELEMENT.value = "";
  QUOTE_INPUT_ELEMENT.removeAttribute("readonly");
  remainingCharacters =
    QUOTE_DISPLAY_ELEMENT.innerText.length -
    QUOTE_INPUT_ELEMENT.value.split("").length;
}

function startTimer() {
  TIMER_ELEMENT.innerText = 0;
  startTime = new Date();
  timerInterval = setInterval(() => {
    TIMER_ELEMENT.innerText = getTimerTime();
  }, 1000);
}

function getTimerTime() {
  return Math.floor((new Date() - startTime) / 1000);
}

displayGameHistory();
