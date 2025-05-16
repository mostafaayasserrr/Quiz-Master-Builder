// Dashboard JavaScript

// Initialize the dashboard
function initDashboard() {
  // Get current user
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  if (!currentUser) {
    window.location.href = "login.html"
    return
  }

  // Update user name
  const dashboardUserName = document.getElementById("dashboard-user-name")
  if (dashboardUserName) {
    dashboardUserName.textContent = currentUser.name
  }

  // Load dashboard stats
  loadDashboardStats()

  // Load user's quizzes
  loadUserQuizzes()

  // Load quiz history
  loadQuizHistory()

  // Load favorite quizzes
  loadFavoriteQuizzes()

  // Add event listeners to tabs
  const tabBtns = document.querySelectorAll(".tab-btn")
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Remove active class from all tabs and content
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"))
      document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"))

      // Add active class to clicked tab and corresponding content
      btn.classList.add("active")
      const tabId = btn.dataset.tab
      document.getElementById(`${tabId}-tab`).classList.add("active")
    })
  })
}

// Load dashboard stats
function loadDashboardStats() {
  // Get current user
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))

  // Get quiz history
  const quizHistory = JSON.parse(localStorage.getItem("quizHistory")) || []
  const userHistory = quizHistory.filter((h) => h.userId === currentUser.id)

  // Get quizzes
  const quizzes = JSON.parse(localStorage.getItem("quizzes")) || {}
  const userQuizzes = Object.values(quizzes).filter((q) => q.createdBy === currentUser.name)

  // Update stats
  document.getElementById("quizzes-taken").textContent = userHistory.length

  // Calculate average score
  let avgScore = 0
  if (userHistory.length > 0) {
    const totalScore = userHistory.reduce((sum, h) => sum + (h.score / h.totalQuestions) * 100, 0)
    avgScore = Math.round(totalScore / userHistory.length)
  }
  document.getElementById("avg-score").textContent = `${avgScore}%`

  // Update quizzes created
  document.getElementById("quizzes-created").textContent = userQuizzes.length
}

// Load user's quizzes
function loadUserQuizzes() {
  const myQuizzesGrid = document.getElementById("my-quizzes-grid")
  if (!myQuizzesGrid) return

  // Get current user
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))

  // Get quizzes
  const quizzes = JSON.parse(localStorage.getItem("quizzes")) || {}

  // Clear grid
  myQuizzesGrid.innerHTML = ""

  // Filter user's quizzes
  const userQuizzes = Object.entries(quizzes).filter(([_, quiz]) => quiz.createdBy === currentUser.name)

  if (userQuizzes.length === 0) {
    myQuizzesGrid.innerHTML = `
            <div class="empty-state">
                <p>You haven't created any quizzes yet.</p>
                <a href="create-quiz.html" class="btn btn-primary">Create Your First Quiz</a>
            </div>
        `
    return
  }

  // Render user's quizzes
  userQuizzes.forEach(([quizId, quiz]) => {
    const difficultyClass = getDifficultyClass(quiz.difficulty)

    const card = document.createElement("div")
    card.className = "quiz-card"
    card.innerHTML = `
            <div class="quiz-badge ${difficultyClass}">${capitalizeFirstLetter(quiz.difficulty)}</div>
            <h3>${quiz.title}</h3>
            <p>${quiz.description}</p>
            <div class="quiz-meta">
                <span><i class="fas fa-question-circle"></i> ${quiz.questions.length} Questions</span>
                <span><i class="fas fa-clock"></i> ${quiz.timeInMinutes} min</span>
            </div>
            <div class="quiz-actions">
                <button class="btn btn-primary start-quiz" data-quiz="${quizId}">Start Quiz</button>
                <button class="btn btn-outline edit-quiz" data-quiz="${quizId}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger delete-quiz" data-quiz="${quizId}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `

    myQuizzesGrid.appendChild(card)

    // Add event listeners
    card.querySelector(".start-quiz").addEventListener("click", () => {
      localStorage.setItem("selectedQuizId", quizId)
      window.location.href = "quiz.html"
    })

    card.querySelector(".edit-quiz").addEventListener("click", () => {
      localStorage.setItem("editQuizId", quizId)
      window.location.href = "create-quiz.html"
    })

    card.querySelector(".delete-quiz").addEventListener("click", () => {
      if (confirm(`Are you sure you want to delete "${quiz.title}"?`)) {
        deleteQuiz(quizId)
      }
    })
  })
}

// Load quiz history
function loadQuizHistory() {
  const historyList = document.getElementById("history-list")
  if (!historyList) return

  // Get current user
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))

  // Get quiz history
  const quizHistory = JSON.parse(localStorage.getItem("quizHistory")) || []
  const userHistory = quizHistory.filter((h) => h.userId === currentUser.id)

  // Get quizzes
  const quizzes = JSON.parse(localStorage.getItem("quizzes")) || {}

  // Clear list
  historyList.innerHTML = ""

  if (userHistory.length === 0) {
    historyList.innerHTML = `
            <div class="empty-state">
                <p>You haven't taken any quizzes yet.</p>
                <a href="index.html#featured" class="btn btn-primary">Browse Quizzes</a>
            </div>
        `
    return
  }

  // Sort history by date (newest first)
  userHistory.sort((a, b) => new Date(b.date) - new Date(a.date))

  // Render history
  userHistory.forEach((history) => {
    const quiz = quizzes[history.quizId]
    if (!quiz) return // Skip if quiz doesn't exist anymore

    const score = Math.round((history.score / history.totalQuestions) * 100)
    const scoreClass = score >= 70 ? "text-success" : score >= 40 ? "text-warning" : "text-danger"

    const historyItem = document.createElement("div")
    historyItem.className = "history-item"
    historyItem.innerHTML = `
            <div class="history-item-info">
                <h4>${quiz.title}</h4>
                <p>${formatDate(history.date)} • ${quiz.difficulty}</p>
            </div>
            <div class="history-item-score ${scoreClass}">
                ${history.score}/${history.totalQuestions} (${score}%)
            </div>
            <div class="history-item-actions">
                <button class="retry-quiz" data-quiz="${history.quizId}" title="Retry Quiz">
                    <i class="fas fa-redo"></i>
                </button>
                <button class="view-results" data-history="${history.id}" title="View Results">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        `

    historyList.appendChild(historyItem)

    // Add event listeners
    historyItem.querySelector(".retry-quiz").addEventListener("click", () => {
      localStorage.setItem("selectedQuizId", history.quizId)
      window.location.href = "quiz.html"
    })

    historyItem.querySelector(".view-results").addEventListener("click", () => {
      // In a real app, this would show detailed results
      alert("View results functionality would be implemented here.")
    })
  })
}

// Load favorite quizzes
function loadFavoriteQuizzes() {
  const favoritesGrid = document.getElementById("favorites-grid")
  if (!favoritesGrid) return

  // Get current user
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))

  // Get favorites
  const favorites = JSON.parse(localStorage.getItem("favorites")) || {}
  const userFavorites = favorites[currentUser.id] || []

  // Get quizzes
  const quizzes = JSON.parse(localStorage.getItem("quizzes")) || {}

  // Clear grid
  favoritesGrid.innerHTML = ""

  if (userFavorites.length === 0) {
    favoritesGrid.innerHTML = `
            <div class="empty-state">
                <p>You haven't favorited any quizzes yet.</p>
                <a href="index.html#featured" class="btn btn-primary">Browse Quizzes</a>
            </div>
        `
    return
  }

  // Render favorite quizzes
  userFavorites.forEach((quizId) => {
    const quiz = quizzes[quizId]
    if (!quiz) return // Skip if quiz doesn't exist anymore

    const difficultyClass = getDifficultyClass(quiz.difficulty)

    const card = document.createElement("div")
    card.className = "quiz-card"
    card.innerHTML = `
            <div class="quiz-badge ${difficultyClass}">${capitalizeFirstLetter(quiz.difficulty)}</div>
            <h3>${quiz.title}</h3>
            <p>${quiz.description}</p>
            <div class="quiz-meta">
                <span><i class="fas fa-question-circle"></i> ${quiz.questions.length} Questions</span>
                <span><i class="fas fa-clock"></i> ${quiz.timeInMinutes} min</span>
            </div>
            <div class="quiz-actions">
                <button class="btn btn-primary start-quiz" data-quiz="${quizId}">Start Quiz</button>
                <button class="btn btn-outline remove-favorite" data-quiz="${quizId}">
                    <i class="fas fa-heart"></i> Remove
                </button>
            </div>
        `

    favoritesGrid.appendChild(card)

    // Add event listeners
    card.querySelector(".start-quiz").addEventListener("click", () => {
      localStorage.setItem("selectedQuizId", quizId)
      window.location.href = "quiz.html"
    })

    card.querySelector(".remove-favorite").addEventListener("click", () => {
      removeFavorite(quizId)
    })
  })
}

// Delete a quiz
function deleteQuiz(quizId) {
  // Get quizzes
  const quizzes = JSON.parse(localStorage.getItem("quizzes")) || {}

  // Delete quiz
  delete quizzes[quizId]

  // Save quizzes
  localStorage.setItem("quizzes", JSON.stringify(quizzes))

  // Reload user's quizzes
  loadUserQuizzes()

  // Update stats
  loadDashboardStats()
}

// Remove a quiz from favorites
function removeFavorite(quizId) {
  // Get current user
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))

  // Get favorites
  const favorites = JSON.parse(localStorage.getItem("favorites")) || {}
  const userFavorites = favorites[currentUser.id] || []

  // Remove quiz from favorites
  const index = userFavorites.indexOf(quizId)
  if (index !== -1) {
    userFavorites.splice(index, 1)
  }

  // Save favorites
  favorites[currentUser.id] = userFavorites
  localStorage.setItem("favorites", JSON.stringify(favorites))

  // Reload favorite quizzes
  loadFavoriteQuizzes()
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// Get CSS class for difficulty badge
function getDifficultyClass(difficulty) {
  switch (difficulty) {
    case "beginner":
      return "bg-green-100 text-green-800"
    case "intermediate":
      return "bg-yellow-100 text-yellow-800"
    case "advanced":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

// Capitalize first letter of a string
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

// Run on page load
document.addEventListener("DOMContentLoaded", initDashboard)

