// Create Quiz JavaScript

// Initialize the create quiz page
function initCreateQuiz() {
  // Get current user
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  if (!currentUser) {
    window.location.href = "login.html"
    return
  }

  // Check if editing an existing quiz
  const editQuizId = localStorage.getItem("editQuizId")
  let editingQuiz = null

  if (editQuizId) {
    // Get quizzes
    const quizzes = JSON.parse(localStorage.getItem("quizzes")) || {}

    // Get quiz to edit
    editingQuiz = quizzes[editQuizId]

    if (editingQuiz) {
      // Update form title
      document.getElementById("form-title").textContent = "Edit Quiz"

      // Fill form with quiz data
      document.getElementById("quiz-title").value = editingQuiz.title
      document.getElementById("quiz-description").value = editingQuiz.description
      document.getElementById("quiz-category").value = editingQuiz.category
      document.getElementById("quiz-difficulty").value = editingQuiz.difficulty
      document.getElementById("quiz-time").value = editingQuiz.timeInMinutes
      document.getElementById("quiz-image").value = editingQuiz.image || ""

      // Show custom category if needed
      if (editingQuiz.category === "custom") {
        document.querySelector(".custom-category").classList.remove("hidden")
        document.getElementById("custom-category-input").value = editingQuiz.customCategory || ""
      }

      // Clear existing questions
      document.getElementById("questions-container").innerHTML = ""

      // Add questions
      editingQuiz.questions.forEach((question, index) => {
        addQuestionForm(index + 1, question)
      })
    }
  }

  // Add first question if none exist
  if (document.getElementById("questions-container").children.length === 0) {
    addQuestionForm(1)
  }

  // Add event listeners

  // Category change
  document.getElementById("quiz-category").addEventListener("change", (e) => {
    const customCategory = document.querySelector(".custom-category")
    if (e.target.value === "custom") {
      customCategory.classList.remove("hidden")
      document.getElementById("custom-category-input").setAttribute("required", "required")
    } else {
      customCategory.classList.add("hidden")
      document.getElementById("custom-category-input").removeAttribute("required")
    }
  })

  // Add question button
  document.getElementById("add-question").addEventListener("click", () => {
    const questionNumber = document.querySelectorAll(".question-form").length + 1
    addQuestionForm(questionNumber)
  })

  // Cancel button
  document.getElementById("cancel-quiz").addEventListener("click", () => {
    if (confirm("Are you sure you want to cancel? All unsaved changes will be lost.")) {
      // Clear edit quiz ID
      localStorage.removeItem("editQuizId")

      // Redirect to dashboard
      window.location.href = "dashboard.html"
    }
  })

  // Form submission
  document.getElementById("create-quiz-form").addEventListener("submit", (e) => {
    e.preventDefault()

    // Get form data
    const title = document.getElementById("quiz-title").value
    const description = document.getElementById("quiz-description").value
    const category = document.getElementById("quiz-category").value
    const customCategory = document.getElementById("custom-category-input").value
    const difficulty = document.getElementById("quiz-difficulty").value
    const timeInMinutes = Number.parseInt(document.getElementById("quiz-time").value)
    const image = document.getElementById("quiz-image").value

    // Get questions
    const questions = []
    const questionForms = document.querySelectorAll(".question-form")

    questionForms.forEach((form) => {
      const questionText = form.querySelector('input[type="text"]').value
      const options = []
      form.querySelectorAll('.option-group input[type="text"]').forEach((input) => {
        options.push(input.value)
      })

      const correctAnswer = Number.parseInt(form.querySelector('input[type="radio"]:checked').value)

      questions.push({
        question: questionText,
        options,
        correctAnswer,
      })
    })

    // Create quiz object
    const quiz = {
      title,
      description,
      category,
      customCategory: category === "custom" ? customCategory : "",
      difficulty,
      timeInMinutes,
      image,
      questions,
      createdBy: currentUser.name,
      createdAt: new Date().toISOString(),
    }

    // Get quizzes
    const quizzes = JSON.parse(localStorage.getItem("quizzes")) || {}

    // Save quiz
    if (editQuizId) {
      // Update existing quiz
      quizzes[editQuizId] = quiz
      alert("Quiz updated successfully!")
    } else {
      // Create new quiz
      const quizId = `${title.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`
      quizzes[quizId] = quiz
      alert("Quiz created successfully!")
    }

    // Save quizzes
    localStorage.setItem("quizzes", JSON.stringify(quizzes))

    // Clear edit quiz ID
    localStorage.removeItem("editQuizId")

    // Redirect to dashboard
    window.location.href = "dashboard.html"
  })
}

// Add a question form
function addQuestionForm(questionNumber, questionData = null) {
  const questionsContainer = document.getElementById("questions-container")

  const questionForm = document.createElement("div")
  questionForm.className = "question-form"
  questionForm.setAttribute("data-question", questionNumber)

  questionForm.innerHTML = `
        <div class="question-header">
            <h5>Question ${questionNumber}</h5>
            <button type="button" class="btn-icon remove-question" ${questionNumber === 1 ? "disabled" : ""}>
                <i class="fas fa-trash"></i>
            </button>
        </div>
        <div class="form-group">
            <label for="question-${questionNumber}">Question Text</label>
            <input type="text" id="question-${questionNumber}" placeholder="Enter question" required value="${questionData ? questionData.question : ""}">
        </div>
        <div class="options-form">
            <div class="option-group">
                <input type="radio" name="correct-${questionNumber}" id="correct-${questionNumber}-0" value="0" ${!questionData || questionData.correctAnswer === 0 ? "checked" : ""}>
                <input type="text" placeholder="Option 1" required value="${questionData && questionData.options[0] ? questionData.options[0] : ""}">
            </div>
            <div class="option-group">
                <input type="radio" name="correct-${questionNumber}" id="correct-${questionNumber}-1" value="1" ${questionData && questionData.correctAnswer === 1 ? "checked" : ""}>
                <input type="text" placeholder="Option 2" required value="${questionData && questionData.options[1] ? questionData.options[1] : ""}">
            </div>
            <div class="option-group">
                <input type="radio" name="correct-${questionNumber}" id="correct-${questionNumber}-2" value="2" ${questionData && questionData.correctAnswer === 2 ? "checked" : ""}>
                <input type="text" placeholder="Option 3" required value="${questionData && questionData.options[2] ? questionData.options[2] : ""}">
            </div>
            <div class="option-group">
                <input type="radio" name="correct-${questionNumber}" id="correct-${questionNumber}-3" value="3" ${questionData && questionData.correctAnswer === 3 ? "checked" : ""}>
                <input type="text" placeholder="Option 4" required value="${questionData && questionData.options[3] ? questionData.options[3] : ""}">
            </div>
        </div>
    `

  questionsContainer.appendChild(questionForm)

  // Add event listener to remove button
  const removeBtn = questionForm.querySelector(".remove-question")
  removeBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to remove this question?")) {
      questionForm.remove()
      updateQuestionNumbers()
    }
  })
}

// Update question numbers
function updateQuestionNumbers() {
  const questionForms = document.querySelectorAll(".question-form")

  questionForms.forEach((form, index) => {
    const questionNumber = index + 1

    // Update question number
    form.setAttribute("data-question", questionNumber)
    form.querySelector("h5").textContent = `Question ${questionNumber}`

    // Update question input ID
    const questionInput = form.querySelector('input[type="text"]')
    questionInput.id = `question-${questionNumber}`
    form.querySelector("label").setAttribute("for", `question-${questionNumber}`)

    // Update radio button names and IDs
    const radioButtons = form.querySelectorAll('input[type="radio"]')
    radioButtons.forEach((radio, radioIndex) => {
      radio.name = `correct-${questionNumber}`
      radio.id = `correct-${questionNumber}-${radioIndex}`
    })

    // Disable remove button for first question
    const removeBtn = form.querySelector(".remove-question")
    if (questionNumber === 1) {
      removeBtn.disabled = true
    } else {
      removeBtn.disabled = false
    }
  })
}

// Run on page load
document.addEventListener("DOMContentLoaded", initCreateQuiz)

