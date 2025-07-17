let digits = [];
let expression = "";
let usedDigits = [];
let timer = 60;
let score = 0;
let gameInterval;
let lastInputType = ""; 
let usedExpressions = [];


const digitsContainer = document.getElementById("digits");
const expressionDisplay = document.getElementById("expression");
const timerDisplay = document.getElementById("timer");
const scoreDisplay = document.getElementById("score");
const messageDisplay = document.getElementById("message");
const gameOverScreen = document.getElementById("game-over");
const finalScoreDisplay = document.getElementById("final-score");

function startGame() {
    digits = generateRandomDigits();
    expression = "";
    usedDigits = [];
    timer = 60;
    score = 0;
    lastInputType = "";

    digitsContainer.innerHTML = "";
    digits.forEach((num, index) => {
        let btn = document.createElement("button");
        btn.textContent = num;
        btn.classList.add("digit-btn");
        btn.dataset.index = index;
        btn.addEventListener("click", () => addDigit(num, btn));
        digitsContainer.appendChild(btn);
    });

    expressionDisplay.textContent = "";
    scoreDisplay.textContent = score;
    messageDisplay.textContent = "";
    gameOverScreen.style.display = "none";

    clearInterval(gameInterval);
    gameInterval = setInterval(updateTimer, 1000);
}

function generateRandomDigits() {
    let arr = [];
    for (let i = 0; i < 4; i++) {
        arr.push(Math.floor(Math.random() * 9) + 1);
    }
    return arr;
}

function addDigit(num, btn) {
    if (lastInputType === "number") return;

    expression += num;
    expressionDisplay.textContent = expression;

    usedDigits.push(btn.dataset.index);
    btn.disabled = true;

    lastInputType = "number";
}

document.querySelectorAll(".op-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        if (lastInputType !== "number") return;

        let op = btn.textContent;
        if (op === "x²") {
            expression += "**2";
        } else if (op === "√") {
            expression += "Math.sqrt(";
        } else if (op === "×") {
            expression += "*";
        } else if (op === "÷") {
            expression += "/";
        } else {
            expression += op;
        }

        expressionDisplay.textContent = expression;
        lastInputType = "operator";
    });
});

document.getElementById("clear").addEventListener("click", () => {
    expression = "";
    expressionDisplay.textContent = "";
    usedDigits = [];
    lastInputType = "";
    document.querySelectorAll(".digit-btn").forEach(btn => btn.disabled = false);
});

document.getElementById("submit").addEventListener("click", () => {
    const trimmedExpression = expression.trim();

    try {
        const result = eval(trimmedExpression);

        if (result === 10 && usedDigits.length === 4) {
            if (usedExpressions.includes(trimmedExpression)) {
                messageDisplay.textContent = "⚠ Already used!";
                messageDisplay.className = "message incorrect";
            } else {
                messageDisplay.textContent = "✅ Correct!";
                messageDisplay.className = "message correct";
                score++;
                scoreDisplay.textContent = score;
                usedExpressions.push(trimmedExpression);
            }
        } else {
            messageDisplay.textContent = "❌ Incorrect!";
            messageDisplay.className = "message incorrect";
        }
    } catch {
        messageDisplay.textContent = "⚠ Invalid expression!";
        messageDisplay.className = "message incorrect";
    }

    // Reset for next attempt
    expression = "";
    expressionDisplay.textContent = "";
    usedDigits = [];
    lastInputType = "";
    document.querySelectorAll(".digit-btn").forEach(btn => btn.disabled = false);
});


function updateTimer() {
    timer--;
    timerDisplay.textContent = timer;
    if (timer <= 0) {
        clearInterval(gameInterval);
        endGame();
    }
}

function endGame() {
    finalScoreDisplay.textContent = score;
    gameOverScreen.style.display = "block";
}

// Keyboard interaction
document.addEventListener("keydown", function (e) {
    const key = e.key;

    // Backspace = remove last
    if (key === "Backspace" && expression.length > 0) {
        expression = expression.slice(0, -1);
        expressionDisplay.textContent = expression;

        if (usedDigits.length > 0) {
            const lastBtnIndex = usedDigits.pop();
            const btn = document.querySelector(`.digit-btn[data-index="${lastBtnIndex}"]`);
            if (btn) btn.disabled = false;
        }

        lastInputType = "";
        return;
    }

    // Enter = submit
    if (key === "Enter") {
        document.getElementById("submit").click();
        return;
    }

    // Digit input (0-9)
    if (/^[0-9]$/.test(key)) {
        if (lastInputType === "number") return;

        const digitButtons = Array.from(document.querySelectorAll('.digit-btn'));
        const availableBtn = digitButtons.find(btn => btn.textContent === key && !btn.disabled);

        if (availableBtn) {
            expression += key;
            expressionDisplay.textContent = expression;

            usedDigits.push(availableBtn.dataset.index);
            availableBtn.disabled = true;
            lastInputType = "number";
        }
        return;
    }

    // Operators
    if (['+', '-', '*', '/'].includes(key)) {
        if (lastInputType !== "number") return;

        expression += key;
        expressionDisplay.textContent = expression;
        lastInputType = "operator";
        return;
    }

    // Power (^ = square)
    if (key === "^") {
        if (lastInputType !== "number") return;

        expression += "**2";
        expressionDisplay.textContent = expression;
        lastInputType = "operator";
        return;
    }

    // Square root (r = root)
    if (key.toLowerCase() === "r") {
        if (lastInputType === "number") return;

        expression += "Math.sqrt(";
        expressionDisplay.textContent = expression;
        lastInputType = "operator";
        return;
    }
});

startGame();
