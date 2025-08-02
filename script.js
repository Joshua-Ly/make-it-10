const TOTAL_TIME = 300; // seconds 
let timer = TOTAL_TIME;
let score = 0;
let digits = [];
let expression = "";
let usedDigits = [];
let usedExpressions = [];
let gameInterval;
let lastInputType = "";

const timerDisplay      = document.getElementById('timer');
const scoreDisplay      = document.getElementById('score');
const digitsContainer   = document.getElementById('digits');
const expressionDisplay = document.getElementById('expression');
const messageDisplay    = document.getElementById('message');
const gameOverScreen    = document.getElementById('game-over');
const finalScoreDisplay = document.getElementById('final-score');

const soundClick      = document.getElementById('sound-click');
const soundCorrect    = document.getElementById('sound-correct');
const soundIncorrect  = document.getElementById('sound-incorrect');

function startGame() {
  clearInterval(gameInterval);
  timer = TOTAL_TIME;
  score = 0;
  updateTimerDisplay();
  scoreDisplay.textContent = score;
  messageDisplay.textContent = '';
  messageDisplay.className = 'message';
  gameOverScreen.style.display = 'none';
  loadNewDigits();
  gameInterval = setInterval(tick, 1000);
}

// Countdown tick
function tick() {
  timer--;
  if (timer <= 0) {
    endGame();
  } else {
    updateTimerDisplay();
  }
}

function updateTimerDisplay() {
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2,'0')}`;
}

// Load a fresh set of 4 random digits
function loadNewDigits() {
  digits = Array.from({ length: 4 }, () => Math.floor(Math.random() * 9) + 1);
  expression = '';
  usedDigits = [];
  usedExpressions = [];
  lastInputType = '';
  expressionDisplay.textContent = '';
  renderDigits();
}

// Render digit buttons
function renderDigits() {
  digitsContainer.innerHTML = '';
  digits.forEach((n, idx) => {
    const btn = document.createElement('button');
    btn.textContent = n;
    btn.classList.add('digit-btn');
    btn.dataset.index = idx;
    btn.addEventListener('click', () => { soundClick.play(); addDigit(n, btn); });
    digitsContainer.appendChild(btn);
  });
}

// Add a digit to the expression
function addDigit(num, btn) {
  if (lastInputType === 'number') return;
  expression += num;
  usedDigits.push(btn.dataset.index);
  btn.disabled = true;
  expressionDisplay.textContent = expression;
  lastInputType = 'number';
}

// Operator buttons
document.querySelectorAll('.op-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    soundClick.play();
    if (lastInputType !== 'number') return;
    const op = btn.textContent;
    if (op === 'ₓʸ')       expression += '**';
    else if (op === '√')  expression += 'Math.sqrt(';
    else if (op === '×')  expression += '*';
    else if (op === '÷')  expression += '/';
    else                  expression += op;
    expressionDisplay.textContent = expression;
    lastInputType = 'operator';
  });
});

// Clear button
document.getElementById('clear').addEventListener('click', () => {
  soundClick.play();
  expression = '';
  usedDigits = [];
  expressionDisplay.textContent = '';
  lastInputType = '';
  document.querySelectorAll('.digit-btn').forEach(b => b.disabled = false);
});

// Submit button
document.getElementById('submit').addEventListener('click', () => {
  soundClick.play();
  const expr = expression.trim();
  try {
    const result = eval(expr);
    if (result === 10 && usedDigits.length === 4 && !usedExpressions.includes(expr)) {
      soundCorrect.play();
      score++;
      scoreDisplay.textContent = score;
      usedExpressions.push(expr);
      messageDisplay.textContent = '✅ Correct!';
      messageDisplay.className = 'message correct';
      setTimeout(() => { messageDisplay.textContent = ''; messageDisplay.className = 'message'; }, 2000);
      loadNewDigits();
    } else {
      soundIncorrect.play();
      messageDisplay.textContent = '❌ Incorrect!';
      messageDisplay.className = 'message incorrect';
      setTimeout(() => { messageDisplay.textContent = ''; messageDisplay.className = 'message'; }, 2000);
    }
  } catch {
    soundIncorrect.play();
    messageDisplay.textContent = '⚠ Invalid!';
    messageDisplay.className = 'message incorrect';
    setTimeout(() => { messageDisplay.textContent = ''; messageDisplay.className = 'message'; }, 2000);
  }
  expression = '';
  usedDigits = [];
  lastInputType = '';
});

// End game when timer hits zero
function endGame() {
  clearInterval(gameInterval);
  finalScoreDisplay.textContent = score;
  gameOverScreen.style.display = 'block';
}

// Keyboard support
document.addEventListener('keydown', e => {
  const key = e.key;
  if (key === 'Backspace' && expression.length > 0) {
    soundClick.play();
    // only re-enable a digit if last input was a number
    if (lastInputType === 'number') {
      const lastIdx = usedDigits.pop();
      const btn = document.querySelector(`.digit-btn[data-index="${lastIdx}"]`);
      if (btn) btn.disabled = false;
    }
    expression = expression.slice(0, -1);
    expressionDisplay.textContent = expression;
    // update lastInputType based on remaining expression
    if (!expression) lastInputType = '';
    else {
      const lc = expression.slice(-1);
      lastInputType = /[0-9]/.test(lc) ? 'number' : 'operator';
    }
    return;
  }
  if (key === 'Enter') { document.getElementById('submit').click(); return; }
  if (/^[0-9]$/.test(key)) {
    if (lastInputType === 'number') return;
    const btn = Array.from(document.querySelectorAll('button.digit-btn'))
      .find(b => b.textContent === key && !b.disabled);
    if (btn) { soundClick.play(); addDigit(+key, btn); }
    return;
  }
  if (['+', '-', '*', '/'].includes(key)) {
    if (lastInputType !== 'number') return;
    soundClick.play();
    expression += key;
    expressionDisplay.textContent = expression;
    lastInputType = 'operator';
    return;
  }
  if (key === '^' && lastInputType === 'number') {
    soundClick.play();
    expression += '**2';
    expressionDisplay.textContent = expression;
    lastInputType = 'operator';
    return;
  }
  if (key.toLowerCase() === 'r' && lastInputType !== 'number') {
    soundClick.play();
    expression += 'Math.sqrt(';
    expressionDisplay.textContent = expression;
    lastInputType = 'operator';
  }
});

startGame();