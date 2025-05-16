// Main JavaScript for index.html

// Initialize the application
function initApp() {
  // Load quizzes
  loadQuizzes()

  // Add event listeners to category cards
  const categoryCards = document.querySelectorAll(".category-card")
  categoryCards.forEach((card) => {
    card.addEventListener("click", () => {
      const category = card.dataset.category
      filterQuizzesByCategory(category)

      // Scroll to featured section
      document.getElementById("featured").scrollIntoView({ behavior: "smooth" })
    })
  })

  // Newsletter form
  const newsletterForm = document.getElementById("newsletter-form")
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault()
      const email = e.target.querySelector('input[type="email"]').value
      alert(`Thank you for subscribing with ${email}! You'll receive our latest updates.`)
      e.target.reset()
    })
  }
}

// Load quizzes from localStorage or create default quizzes
function loadQuizzes() {
  const quizGrid = document.getElementById("quiz-grid")
  if (!quizGrid) return

  // Get quizzes from localStorage
  let quizzes = JSON.parse(localStorage.getItem("quizzes")) || {}

  // If no quizzes exist, create default quizzes
  if (Object.keys(quizzes).length === 0) {
    quizzes = createDefaultQuizzes()
    localStorage.setItem("quizzes", JSON.stringify(quizzes))
  }

  // Clear quiz grid
  quizGrid.innerHTML = ""

  // Render quizzes
  Object.keys(quizzes).forEach((quizId) => {
    const quiz = quizzes[quizId]
    renderQuizCard(quizGrid, quiz, quizId)
  })
}

// Filter quizzes by category
function filterQuizzesByCategory(category) {
  const quizGrid = document.getElementById("quiz-grid")
  if (!quizGrid) return

  // Get quizzes from localStorage
  const quizzes = JSON.parse(localStorage.getItem("quizzes")) || {}

  // Clear quiz grid
  quizGrid.innerHTML = ""

  // Filter and render quizzes
  Object.keys(quizzes)
    .filter((quizId) => quizzes[quizId].category === category)
    .forEach((quizId) => {
      const quiz = quizzes[quizId]
      renderQuizCard(quizGrid, quiz, quizId)
    })

  // Update section title
  const sectionTitle = document.querySelector("#featured .section-title")
  const categoryName = document.querySelector(`.category-card[data-category="${category}"] h3`).textContent
  sectionTitle.textContent = `${categoryName} Quizzes`
}

// Render a quiz card
function renderQuizCard(container, quiz, quizId) {
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
        <button class="btn btn-primary start-quiz" data-quiz="${quizId}">Start Quiz</button>
    `

  container.appendChild(card)

  // Add event listener to start quiz button
  card.querySelector(".start-quiz").addEventListener("click", () => {
    // Store selected quiz ID in localStorage
    localStorage.setItem("selectedQuizId", quizId)

    // Redirect to quiz page
    window.location.href = "quiz.html"
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

// Create default quizzes
function createDefaultQuizzes() {
  return {
    "html-basics": {
      title: "HTML Basics",
      description: "Test your knowledge of HTML fundamentals, tags, attributes, and document structure.",
      category: "web-development",
      difficulty: "beginner",
      timeInMinutes: 10,
      questions: [
        {
          question: "What does HTML stand for?",
          options: [
            "Hyper Text Markup Language",
            "High Tech Modern Language",
            "Hyper Transfer Markup Language",
            "Hyper Text Modern Language",
          ],
          correctAnswer: 0,
        },
        {
          question: "Which HTML tag is used for creating a paragraph?",
          options: ["<paragraph>", "<p>", "<para>", "<text>"],
          correctAnswer: 1,
        },
        {
          question: "Which attribute is used to define inline styles in HTML?",
          options: ["class", "styles", "style", "css"],
          correctAnswer: 2,
        },
        {
          question: "Which HTML element is used to define the title of a document?",
          options: ["<meta>", "<head>", "<title>", "<header>"],
          correctAnswer: 2,
        },
        {
          question: "Which HTML tag is used to create a hyperlink?",
          options: ["<link>", "<a>", "<href>", "<url>"],
          correctAnswer: 1,
        },
      ],
      createdBy: "Admin User",
      createdAt: new Date().toISOString(),
    },
    "css-basics": {
      title: "CSS Basics",
      description: "Test your knowledge of CSS properties, selectors, and styling techniques.",
      category: "web-development",
      difficulty: "beginner",
      timeInMinutes: 10,
      questions: [
        {
          question: "What does CSS stand for?",
          options: [
            "Creative Style Sheets",
            "Cascading Style Sheets",
            "Computer Style Sheets",
            "Colorful Style Sheets",
          ],
          correctAnswer: 1,
        },
        {
          question: "Which property is used to change the text color?",
          options: ["text-color", "font-color", "color", "text-style"],
          correctAnswer: 2,
        },
        {
          question: "Which CSS property controls the text size?",
          options: ["text-size", "font-size", "text-style", "font-style"],
          correctAnswer: 1,
        },
        {
          question: "Which property is used to change the background color?",
          options: ["bgcolor", "background-color", "color-background", "background"],
          correctAnswer: 1,
        },
        {
          question: "Which CSS property is used to control the spacing between elements?",
          options: ["spacing", "margin", "padding", "border"],
          correctAnswer: 1,
        },
      ],
      createdBy: "Admin User",
      createdAt: new Date().toISOString(),
    },
    "javascript-fundamentals": {
      title: "JavaScript Fundamentals",
      description: "Test your knowledge of JavaScript basics, variables, functions, and control flow.",
      category: "web-development",
      difficulty: "intermediate",
      timeInMinutes: 15,
      questions: [
        {
          question: "Which keyword is used to declare a variable in JavaScript?",
          options: ["var", "let", "const", "All of the above"],
          correctAnswer: 3,
        },
        {
          question: "What will be the output of: console.log(typeof [])?",
          options: ["array", "object", "undefined", "null"],
          correctAnswer: 1,
        },
        {
          question: "Which method is used to add an element at the end of an array?",
          options: ["push()", "append()", "add()", "insert()"],
          correctAnswer: 0,
        },
        {
          question: "What is the correct way to write a JavaScript array?",
          options: [
            "var colors = (1:'red', 2:'green', 3:'blue')",
            "var colors = ['red', 'green', 'blue']",
            "var colors = 'red', 'green', 'blue'",
            "var colors = {red, green, blue}",
          ],
          correctAnswer: 1,
        },
        {
          question: "Which event occurs when the user clicks on an HTML element?",
          options: ["onmouseover", "onchange", "onclick", "onmouseclick"],
          correctAnswer: 2,
        },
      ],
      createdBy: "Admin User",
      createdAt: new Date().toISOString(),
    },
    "solar-system": {
      title: "Solar System Quiz",
      description: "Test your knowledge about planets, stars, and other celestial bodies in our solar system.",
      category: "science",
      difficulty: "intermediate",
      timeInMinutes: 12,
      questions: [
        {
          question: "Which planet is known as the Red Planet?",
          options: ["Venus", "Mars", "Jupiter", "Mercury"],
          correctAnswer: 1,
        },
        {
          question: "How many planets are in our solar system?",
          options: ["7", "8", "9", "10"],
          correctAnswer: 1,
        },
        {
          question: "Which is the largest planet in our solar system?",
          options: ["Earth", "Saturn", "Jupiter", "Neptune"],
          correctAnswer: 2,
        },
        {
          question: "What is the name of Earth's natural satellite?",
          options: ["Luna", "Europa", "Titan", "Phobos"],
          correctAnswer: 0,
        },
      ],
      createdBy: "Admin User",
      createdAt: new Date().toISOString(),
    },
  }
}

// Run on page load
document.addEventListener("DOMContentLoaded", initApp)

