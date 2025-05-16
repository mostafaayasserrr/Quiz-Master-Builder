// Quiz JavaScript

// Quiz state
let quiz = null
let currentQuestionIndex = 0
let selectedOptionIndex = null
let score = 0
let answers = []
let timer = null
let timeRemaining = 0

// Initialize the quiz
function initQuiz() {
  // Get current user
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  if (!currentUser) {
    window.location.href = "login.html"
    return
  }

  // Get selected quiz ID
  const quizId = localStorage.getItem("selectedQuizId")
  if (!quizId) {
    window.location.href = "index.html"
    return
  }

  // Get quizzes
  const quizzes = JSON.parse(localStorage.getItem("quizzes")) || {}

  // Get selected quiz
  quiz = quizzes[quizId]
  if (!quiz) {
    window.location.href = "index.html"
    return
  }

  // Reset quiz state
  currentQuestionIndex = 0
  selectedOptionIndex = null
  score = 0
  answers = []

  // Update UI
  updateQuizUI()

  // Start timer
  timeRemaining = quiz.timeInMinutes * 60
  updateTimerDisplay()
  if (timer) clearInterval(timer)
  timer = setInterval(updateTimer, 1000)

  // Add event listener to next button
  document.getElementById("next-btn").addEventListener("click", handleNextQuestion)

  // Add event listeners to retry and home buttons
  document.getElementById("retry-btn").addEventListener("click", () => {
    document.getElementById("results-container").classList.add("hidden")
    document.getElementById("quiz-container").classList.remove("hidden")
    initQuiz()
  })

  document.getElementById("home-btn").addEventListener("click", () => {
    window.location.href = "dashboard.html"
  })
}

// Update the quiz UI
function updateQuizUI() {
  // Update quiz title
  document.getElementById("quiz-title").textContent = quiz.title

  // Update question count
  document.getElementById("current-question").textContent =
    `Question ${currentQuestionIndex + 1} of ${quiz.questions.length}`

  // Update progress bar
  document.getElementById("quiz-progress").style.width =
    `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`

  // Get current question
  const question = quiz.questions[currentQuestionIndex]

  // Update question text
  document.getElementById("question-text").textContent = question.question

  // Clear options container
  const optionsContainer = document.getElementById("options-container")
  optionsContainer.innerHTML = ""

  // Add options
  question.options.forEach((option, index) => {
    const optionElement = document.createElement("div")
    optionElement.className = "option"
    optionElement.innerHTML = `
            <input type="radio" name="quiz-option" id="option-${index}" class="option-radio">
            <label for="option-${index}">${option}</label>
        `

    optionElement.addEventListener("click", () => {
      selectOption(index)
    })

    optionsContainer.appendChild(optionElement)
  })

  // Reset selected option
  selectedOptionIndex = null

  // Disable next button
  document.getElementById("next-btn").disabled = true

  // Hide feedback
  document.getElementById("feedback-container").classList.add("hidden")
}

// Select an option
function selectOption(index) {
  // Update selected option
  selectedOptionIndex = index

  // Update UI
  const options = document.querySelectorAll(".option")
  options.forEach((option, i) => {
    if (i === index) {
      option.classList.add("selected")
    } else {
      option.classList.remove("selected")
    }
  })

  // Enable next button
  document.getElementById("next-btn").disabled = false
}

// Handle next question button
function handleNextQuestion() {
  // Get current question
  const question = quiz.questions[currentQuestionIndex]

  // Check if answer is correct
  const isCorrect = selectedOptionIndex === question.correctAnswer

  // Update score
  if (isCorrect) {
    score++
  }

  // Save answer
  answers.push({
    question: question.question,
    userAnswer: question.options[selectedOptionIndex],
    correctAnswer: question.options[question.correctAnswer],
    isCorrect,
  })

  // Show feedback
  showFeedback(isCorrect)

  // Disable next button during feedback
  document.getElementById("next-btn").disabled = true

  // Move to next question after delay
  setTimeout(() => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      currentQuestionIndex++
      updateQuizUI()
    } else {
      endQuiz()
    }
  }, 1500)
}

// Show feedback
function showFeedback(isCorrect) {
  const feedbackContainer = document.getElementById("feedback-container")
  const feedbackContent = document.getElementById("feedback-content")

  if (isCorrect) {
    feedbackContainer.className = "correct"
    feedbackContent.innerHTML = '<i class="fas fa-check-circle"></i> Correct!'
  } else {
    feedbackContainer.className = "incorrect"
    feedbackContent.innerHTML = `<i class="fas fa-times-circle"></i> Incorrect! The correct answer is: ${quiz.questions[currentQuestionIndex].options[quiz.questions[currentQuestionIndex].correctAnswer]}`
  }

  feedbackContainer.classList.remove("hidden")
}

// Update timer
function updateTimer() {
  if (timeRemaining <= 0) {
    clearInterval(timer)
    endQuiz()
    return
  }

  timeRemaining--
  updateTimerDisplay()
}

// Update timer display
function updateTimerDisplay() {
  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60
  document.getElementById("time-left").textContent =
    `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

  // Add warning class when time is running low
  if (timeRemaining < 60) {
    document.getElementById("timer").classList.add("text-danger")
  } else {
    document.getElementById("timer").classList.remove("text-danger")
  }
}

// End the quiz
function endQuiz() {
  // Clear timer
  clearInterval(timer)

  // Hide quiz container
  document.getElementById("quiz-container").classList.add("hidden")

  // Show results container
  document.getElementById("results-container").classList.remove("hidden")

  // Update results
  document.getElementById("results-summary").textContent = `You scored ${score} out of ${quiz.questions.length}`

  // Calculate percentage
  const percentage = Math.round((score / quiz.questions.length) * 100)
  document.getElementById("score-percent").textContent = `${percentage}%`

  // Update question summary
  const questionSummary = document.getElementById("question-summary")
  questionSummary.innerHTML = ""

  answers.forEach((answer, index) => {
    const questionItem = document.createElement("div")
    questionItem.className = `question-item ${answer.isCorrect ? "correct" : "incorrect"}`

    questionItem.innerHTML = `
            <div class="question-header">
                <i class="fas fa-${answer.isCorrect ? "check" : "times"}-circle ${answer.isCorrect ? "correct" : "incorrect"}"></i>
                <div class="question-title">${index + 1}. ${answer.question}</div>
            </div>
            <div class="question-answer ${answer.isCorrect ? "correct" : "incorrect"}">
                Your answer: ${answer.userAnswer}
            </div>
            ${!answer.isCorrect ? `<div class="question-answer correct">Correct answer: ${answer.correctAnswer}</div>` : ""}
        `

    questionSummary.appendChild(questionItem)
  })

  // Save quiz result
  saveQuizResult()
}

// Save quiz result
function saveQuizResult() {
  // Get current user
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))

  // Get selected quiz ID
  const quizId = localStorage.getItem("selectedQuizId")

  // Create result object
  const result = {
    id: Date.now().toString(),
    userId: currentUser.id,
    quizId,
    score,
    totalQuestions: quiz.questions.length,
    answers,
    date: new Date().toISOString(),
  }

  // Get quiz history
  const quizHistory = JSON.parse(localStorage.getItem("quizHistory")) || []

  // Add result to history
  quizHistory.push(result)

  // Save history
  localStorage.setItem("quizHistory", JSON.stringify(quizHistory))
}

// Run on page load
document.addEventListener("DOMContentLoaded", initQuiz)

