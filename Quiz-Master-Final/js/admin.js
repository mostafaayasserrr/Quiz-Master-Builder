import { Chart } from "@/components/ui/chart"
// Admin Dashboard JavaScript

// Initialize the admin dashboard
function initAdminDashboard() {
  // Get current user
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  if (!currentUser || !currentUser.isAdmin) {
    window.location.href = "index.html"
    return
  }

  // Load admin stats
  loadAdminStats()

  // Load quizzes
  loadQuizzes()

  // Load users
  loadUsers()

  // Load categories
  loadCategories()

  // Initialize charts
  initCharts()

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

  // Add event listener to add user button
  document.getElementById("add-user-btn").addEventListener("click", () => {
    document.getElementById("add-user-modal").classList.remove("hidden")
  })

  // Add event listener to add category button
  document.getElementById("add-category-btn").addEventListener("click", () => {
    document.getElementById("add-category-modal").classList.remove("hidden")
  })

  // Add event listeners to close modal buttons
  document.querySelectorAll(".close-modal").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".modal").forEach((modal) => {
        modal.classList.add("hidden")
      })
    })
  })

  // Add event listener to add user form
  document.getElementById("add-user-form").addEventListener("submit", (e) => {
    e.preventDefault()
    addUser()
  })

  // Add event listener to add category form
  document.getElementById("add-category-form").addEventListener("submit", (e) => {
    e.preventDefault()
    addCategory()
  })
}

// Load admin stats
function loadAdminStats() {
  // Get users
  const users = JSON.parse(localStorage.getItem("users")) || []

  // Get quizzes
  const quizzes = JSON.parse(localStorage.getItem("quizzes")) || {}

  // Get quiz history
  const quizHistory = JSON.parse(localStorage.getItem("quizHistory")) || []

  // Update stats
  document.getElementById("total-users").textContent = users.length
  document.getElementById("total-quizzes").textContent = Object.keys(quizzes).length
  document.getElementById("quiz-attempts").textContent = quizHistory.length
}

// Load quizzes
function loadQuizzes() {
  const quizzesTable = document.querySelector("#quizzes-table tbody")
  if (!quizzesTable) return

  // Get quizzes
  const quizzes = JSON.parse(localStorage.getItem("quizzes")) || {}

  // Clear table
  quizzesTable.innerHTML = ""

  // Render quizzes
  Object.entries(quizzes).forEach(([quizId, quiz]) => {
    const row = document.createElement("tr")
    row.innerHTML = `
            <td>${quiz.title}</td>
            <td>${capitalizeFirstLetter(quiz.category)}</td>
            <td>${capitalizeFirstLetter(quiz.difficulty)}</td>
            <td>${quiz.questions.length}</td>
            <td>${quiz.createdBy}</td>
            <td>${formatDate(quiz.createdAt)}</td>
            <td>
                <div class="table-actions">
                    <button class="view-quiz" data-quiz="${quizId}" title="View Quiz">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="edit-quiz" data-quiz="${quizId}" title="Edit Quiz">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-quiz delete" data-quiz="${quizId}" title="Delete Quiz">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `

    quizzesTable.appendChild(row)

    // Add event listeners
    row.querySelector(".view-quiz").addEventListener("click", () => {
      localStorage.setItem("selectedQuizId", quizId)
      window.location.href = "quiz.html"
    })

    row.querySelector(".edit-quiz").addEventListener("click", () => {
      localStorage.setItem("editQuizId", quizId)
      window.location.href = "create-quiz.html"
    })

    row.querySelector(".delete-quiz").addEventListener("click", () => {
      if (confirm(`Are you sure you want to delete "${quiz.title}"?`)) {
        deleteQuiz(quizId)
      }
    })
  })
}

// Load users
function loadUsers() {
  const usersTable = document.querySelector("#users-table tbody")
  if (!usersTable) return

  // Get users
  const users = JSON.parse(localStorage.getItem("users")) || []

  // Get quiz history
  const quizHistory = JSON.parse(localStorage.getItem("quizHistory")) || []

  // Get quizzes
  const quizzes = JSON.parse(localStorage.getItem("quizzes")) || {}

  // Clear table
  usersTable.innerHTML = ""

  // Render users
  users.forEach((user) => {
    // Count quizzes taken
    const quizzesTaken = quizHistory.filter((h) => h.userId === user.id).length

    // Count quizzes created
    const quizzesCreated = Object.values(quizzes).filter((q) => q.createdBy === user.name).length

    const row = document.createElement("tr")
    row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.isAdmin ? "Admin" : "User"}</td>
            <td>${quizzesTaken}</td>
            <td>${quizzesCreated}</td>
            <td>${formatDate(user.joinDate)}</td>
            <td>
                <div class="table-actions">
                    <button class="edit-user" data-user="${user.id}" title="Edit User">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-user delete" data-user="${user.id}" title="Delete User">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `

    usersTable.appendChild(row)

    // Add event listeners
    row.querySelector(".edit-user").addEventListener("click", () => {
      editUser(user.id)
    })

    row.querySelector(".delete-user").addEventListener("click", () => {
      if (confirm(`Are you sure you want to delete user "${user.name}"?`)) {
        deleteUser(user.id)
      }
    })
  })
}

// Load categories
function loadCategories() {
  const categoriesGrid = document.getElementById("admin-categories-grid")
  if (!categoriesGrid) return

  // Get categories
  const categories = [
    { id: "web-development", name: "Web Development", icon: "fa-code", description: "HTML, CSS, JavaScript and more" },
    { id: "science", name: "Science", icon: "fa-flask", description: "Physics, Chemistry, Biology" },
    { id: "geography", name: "Geography", icon: "fa-globe-americas", description: "Countries, Capitals, Landmarks" },
    { id: "mathematics", name: "Mathematics", icon: "fa-calculator", description: "Algebra, Geometry, Calculus" },
    { id: "general-knowledge", name: "General Knowledge", icon: "fa-book", description: "Trivia, Facts, History" },
  ]

  // Clear grid
  categoriesGrid.innerHTML = ""

  // Render categories
  categories.forEach((category) => {
    const card = document.createElement("div")
    card.className = "category-admin-card"
    card.innerHTML = `
            <div class="category-icon">
                <i class="fas ${category.icon}"></i>
            </div>
            <h3>${category.name}</h3>
            <p>${category.description}</p>
            <div class="card-actions">
                <button class="btn btn-outline edit-category" data-category="${category.id}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger delete-category" data-category="${category.id}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `

    categoriesGrid.appendChild(card)

    // Add event listeners
    card.querySelector(".edit-category").addEventListener("click", () => {
      editCategory(category.id)
    })

    card.querySelector(".delete-category").addEventListener("click", () => {
      if (confirm(`Are you sure you want to delete category "${category.name}"?`)) {
        deleteCategory(category.id)
      }
    })
  })
}

// Initialize charts
function initCharts() {
  // Get quizzes
  const quizzes = JSON.parse(localStorage.getItem("quizzes")) || {}

  // Get quiz history
  const quizHistory = JSON.parse(localStorage.getItem("quizHistory")) || []

  // Popular quizzes chart
  const popularQuizzesChart = document.getElementById("popular-quizzes-chart")
  if (popularQuizzesChart) {
    // Count quiz attempts
    const quizAttempts = {}
    quizHistory.forEach((history) => {
      quizAttempts[history.quizId] = (quizAttempts[history.quizId] || 0) + 1
    })

    // Sort quizzes by attempts
    const sortedQuizzes = Object.entries(quizAttempts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    // Create chart data
    const labels = sortedQuizzes.map(([quizId]) => quizzes[quizId]?.title || "Unknown Quiz")
    const data = sortedQuizzes.map(([_, attempts]) => attempts)

    new Chart(popularQuizzesChart, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Number of Attempts",
            data,
            backgroundColor: "rgba(79, 70, 229, 0.8)",
            borderColor: "rgba(79, 70, 229, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
            },
          },
        },
      },
    })
  }

  // User activity chart
  const userActivityChart = document.getElementById("user-activity-chart")
  if (userActivityChart) {
    // Group history by date
    const activityByDate = {}
    quizHistory.forEach((history) => {
      const date = history.date.split("T")[0]
      activityByDate[date] = (activityByDate[date] || 0) + 1
    })

    // Get last 7 days
    const dates = []
    const activity = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateString = date.toISOString().split("T")[0]

      dates.push(formatDate(dateString))
      activity.push(activityByDate[dateString] || 0)
    }

    new Chart(userActivityChart, {
      type: "line",
      data: {
        labels: dates,
        datasets: [
          {
            label: "Quiz Attempts",
            data: activity,
            backgroundColor: "rgba(16, 185, 129, 0.2)",
            borderColor: "rgba(16, 185, 129, 1)",
            borderWidth: 2,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
            },
          },
        },
      },
    })
  }

  // Category distribution chart
  const categoryDistributionChart = document.getElementById("category-distribution-chart")
  if (categoryDistributionChart) {
    // Count quizzes by category
    const quizzesByCategory = {}
    Object.values(quizzes).forEach((quiz) => {
      quizzesByCategory[quiz.category] = (quizzesByCategory[quiz.category] || 0) + 1
    })

    // Create chart data
    const labels = Object.keys(quizzesByCategory).map((category) => capitalizeFirstLetter(category))
    const data = Object.values(quizzesByCategory)

    new Chart(categoryDistributionChart, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: [
              "rgba(79, 70, 229, 0.8)",
              "rgba(16, 185, 129, 0.8)",
              "rgba(245, 158, 11, 0.8)",
              "rgba(239, 68, 68, 0.8)",
              "rgba(107, 114, 128, 0.8)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    })
  }
}

// Add a new user
function addUser() {
  // Get form data
  const name = document.getElementById("new-user-name").value
  const email = document.getElementById("new-user-email").value
  const password = document.getElementById("new-user-password").value
  const role = document.getElementById("new-user-role").value

  // Get users
  const users = JSON.parse(localStorage.getItem("users")) || []

  // Check if email already exists
  if (users.some((u) => u.email === email)) {
    alert("Email already exists. Please use a different email.")
    return
  }

  // Create new user
  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password,
    isAdmin: role === "admin",
    joinDate: new Date().toISOString(),
  }

  // Add user to users array
  users.push(newUser)

  // Save users
  localStorage.setItem("users", JSON.stringify(users))

  // Close modal
  document.getElementById("add-user-modal").classList.add("hidden")

  // Reset form
  document.getElementById("add-user-form").reset()

  // Reload users
  loadUsers()

  // Update stats
  loadAdminStats()

  alert("User added successfully!")
}

// Edit a user
function editUser(userId) {
  // In a real app, this would open a modal with user data
  alert("Edit user functionality would be implemented here.")
}

// Delete a user
function deleteUser(userId) {
  // Get users
  const users = JSON.parse(localStorage.getItem("users")) || []

  // Find user index
  const userIndex = users.findIndex((u) => u.id === userId)

  if (userIndex === -1) return

  // Remove user
  users.splice(userIndex, 1)

  // Save users
  localStorage.setItem("users", JSON.stringify(users))

  // Reload users
  loadUsers()

  // Update stats
  loadAdminStats()
}

// Add a new category
function addCategory() {
  // In a real app, this would add a new category
  alert("Add category functionality would be implemented here.")

  // Close modal
  document.getElementById("add-category-modal").classList.add("hidden")

  // Reset form
  document.getElementById("add-category-form").reset()
}

// Edit a category
function editCategory(categoryId) {
  // In a real app, this would open a modal with category data
  alert("Edit category functionality would be implemented here.")
}

// Delete a category
function deleteCategory(categoryId) {
  // In a real app, this would delete a category
  alert("Delete category functionality would be implemented here.")
}

// Delete a quiz
function deleteQuiz(quizId) {
  // Get quizzes
  const quizzes = JSON.parse(localStorage.getItem("quizzes")) || {}

  // Delete quiz
  delete quizzes[quizId]

  // Save quizzes
  localStorage.setItem("quizzes", JSON.stringify(quizzes))

  // Reload quizzes
  loadQuizzes()

  // Update stats
  loadAdminStats()
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

// Capitalize first letter of a string
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

// Run on page load
document.addEventListener("DOMContentLoaded", initAdminDashboard)

