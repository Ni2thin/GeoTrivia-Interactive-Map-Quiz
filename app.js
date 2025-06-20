// Fetching the question data
fetch("questions.json")
    .then((response) => response.json())
    .then((data) => initializeQuiz(data));

let score = 0;
let currentQuestionIndex = 0;
let questions = [];
let mode = 'classic';
let timer = null;
let timeLeft = 10;
let streak = 0;
let maxStreak = 0;

// Sound effects
let correctSound, wrongSound, completeSound;
if (typeof window !== 'undefined') {
    correctSound = new Audio('https://cdn.pixabay.com/audio/2022/07/26/audio_124bfae5b2.mp3'); // short correct
    wrongSound = new Audio('https://cdn.pixabay.com/audio/2022/07/26/audio_124bfae5b2.mp3'); // can use same or different
    completeSound = new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_115b9b6e7b.mp3'); // quiz complete
}

function playSound(sound) {
    if (sound && typeof sound.play === 'function') {
        sound.currentTime = 0;
        sound.play();
    }
}

function fadeInQuestion() {
    const q = document.getElementById('question-container');
    if (q) {
        q.classList.remove('fade-in');
        void q.offsetWidth; // trigger reflow
        q.classList.add('fade-in');
    }
}

function updateModeInfo() {
    const modeInfo = document.getElementById('mode-info');
    if (mode === 'timed') {
        modeInfo.textContent = `Time left: ${timeLeft}s`;
    } else if (mode === 'streak') {
        modeInfo.textContent = `Current Streak: ${streak} | Max Streak: ${maxStreak}`;
    } else {
        modeInfo.textContent = '';
    }
}

function setMode(newMode) {
    mode = newMode;
    resetGame();
}

function resetGame() {
    score = 0;
    currentQuestionIndex = 0;
    streak = 0;
    maxStreak = 0;
    if (timer) clearInterval(timer);
    timeLeft = 10;
    document.getElementById('score').textContent = score;
    updateModeInfo();
    if (questions.length > 0) displayQuestion();
}

if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
        const modeSelector = document.getElementById('mode-selector');
        if (modeSelector) {
            modeSelector.addEventListener('change', function (e) {
                setMode(e.target.value);
            });
        }
        // Add click and touch support for inlined SVG
        const svg = document.querySelector('.map-container svg');
        if (svg) {
            svg.addEventListener('click', function (e) {
                if (e.target.tagName === 'path') {
                    handleRegionClick(e.target);
                }
            });
            // Touch support
            svg.addEventListener('touchstart', function (e) {
                const touch = e.touches[0];
                const target = document.elementFromPoint(touch.clientX, touch.clientY);
                if (target && target.tagName === 'path') {
                    handleRegionClick(target);
                }
            });
        }
    });
}

function initializeQuiz(data) {
    questions = data;
    resetGame();
}

// Display the current question
function displayQuestion() {
    const questionContainer = document.getElementById("question");
    questionContainer.textContent = questions[currentQuestionIndex].question;
    fadeInQuestion();
    if (mode === 'timed') {
        timeLeft = 10;
        updateModeInfo();
        if (timer) clearInterval(timer);
        timer = setInterval(() => {
            timeLeft--;
            updateModeInfo();
            if (timeLeft <= 0) {
                clearInterval(timer);
                alert('Time is up!');
                nextQuestion();
            }
        }, 1000);
    } else {
        updateModeInfo();
        if (timer) clearInterval(timer);
    }
}

// Handle region click
if (typeof window !== 'undefined' && document.getElementById("world-map")) {
    document.getElementById("world-map").addEventListener("load", function () {
        const svgDoc = this.contentDocument;
        // Make SVG responsive
        const svg = svgDoc && svgDoc.querySelector('svg');
        if (svg) {
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '100%');
            svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
            svg.style.width = '100%';
            svg.style.height = '100%';
            svg.style.maxWidth = '100vw';
            svg.style.maxHeight = '70vh';
            svg.style.display = 'block';
        }
        svgDoc.addEventListener("click", (e) => {
            if (e.target.tagName === "path") {
                handleRegionClick(e.target);
            }
        });
    });
}

function handleRegionClick(region) {
    const answer = questions[currentQuestionIndex].answer;
    if (mode === 'timed' && timer) clearInterval(timer);
    if (region.id === answer) {
        playSound(correctSound);
        score++;
        document.getElementById("score").textContent = score;
        region.classList.add("highlight");
        if (mode === 'streak') {
            streak++;
            if (streak > maxStreak) maxStreak = streak;
        }
        nextQuestion();
    } else {
        playSound(wrongSound);
        if (mode === 'streak') {
            streak = 0;
        }
        alert("Wrong answer! Try again.");
        updateModeInfo();
    }
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        displayQuestion();
    } else {
        if (mode === 'timed' && timer) clearInterval(timer);
        playSound(completeSound);
        alert("Quiz complete! Your final score is: " + score + (mode === 'streak' ? ` | Max Streak: ${maxStreak}` : ''));
    }
}

// Export functions for testing if in Node.js
typeof module !== 'undefined' && module.exports && (module.exports = {
    initializeQuiz,
    displayQuestion,
    handleRegionClick,
    nextQuestion,
    get currentQuestionIndex() { return currentQuestionIndex; },
    set currentQuestionIndex(val) { currentQuestionIndex = val; },
    get questions() { return questions; },
    set questions(val) { questions = val; }
});
