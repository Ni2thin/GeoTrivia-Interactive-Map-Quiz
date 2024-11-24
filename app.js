// Fetching the question data
fetch("questions.json")
    .then((response) => response.json())
    .then((data) => initializeQuiz(data));

let score = 0;
let currentQuestionIndex = 0;
let questions = [];

function initializeQuiz(data) {
    questions = data;
    displayQuestion();
}

// Display the current question
function displayQuestion() {
    const questionContainer = document.getElementById("question");
    questionContainer.textContent = questions[currentQuestionIndex].question;
}

// Handle region click
document.getElementById("world-map").addEventListener("load", function () {
    const svgDoc = this.contentDocument;

    svgDoc.addEventListener("click", (e) => {
        if (e.target.tagName === "path") {
            handleRegionClick(e.target);
        }
    });
});

function handleRegionClick(region) {
    const answer = questions[currentQuestionIndex].answer;

    if (region.id === answer) {
        score++;
        document.getElementById("score").textContent = score;
        region.classList.add("highlight");
        nextQuestion();
    } else {
        alert("Wrong answer! Try again.");
    }
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        displayQuestion();
    } else {
        alert("Quiz complete! Your final score is: " + score);
    }
}
