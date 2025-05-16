document.addEventListener("DOMContentLoaded", () => {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const quizHistory = JSON.parse(localStorage.getItem("quizHistory")) || [];

  const container = document.getElementById("user-profiles-container");
  const modal = document.getElementById("feedbackModal");
  const modalContent = document.getElementById("modalContent");
  const saveFeedbackBtn = document.getElementById("saveFeedbackBtn");
  const closeModal = document.getElementById("closeModal");

  let currentUserId = null;
  let currentQuizId = null;

  function renderUsers(filterText = "", filterRole = "all") {
    container.innerHTML = "";

    users.forEach(user => {
      const userResults = quizHistory.filter(q => q.userId === user.id);

      const matchText = user.name.toLowerCase().includes(filterText) ||
                        user.email.toLowerCase().includes(filterText);

      const isAdmin = user.isAdmin;
      const roleFilter =
        filterRole === "admin" ? isAdmin :
        filterRole === "user" ? !isAdmin :
        true;

      const hasTaken = userResults.length > 0;
      const historyFilter = filterRole === "hasTaken" ? hasTaken : true;

      if (matchText && roleFilter && historyFilter) {
        const card = document.createElement("div");
        card.className = "user-card";

        let html = `
          <h3>${user.name} (${user.email})</h3>
          <p><strong>Joined:</strong> ${new Date(user.joinDate).toLocaleDateString()}</p>
          <p><strong>Total Quizzes Taken:</strong> ${userResults.length}</p>
        `;

        if (userResults.length === 0) {
          html += `<p>No quizzes taken yet.</p>`;
        } else {
          userResults.forEach(result => {
            html += `
              <div class="quiz-entry">
                <p><strong>Quiz ID:</strong> ${result.quizId}</p>
                <p><strong>Score:</strong> ${result.score}/${result.totalQuestions}</p>
                <button class="open-feedback-btn feedback-btn" 
                        data-user-id="${user.id}" 
                        data-quiz-id="${result.id}"
                        data-feedback="${result.feedback || ''}">
                  ✏️ Add/Edit Feedback
                </button>
              </div>
            `;
          });
        }

        card.innerHTML = html;
        container.appendChild(card);
      }
    });
  }

  // Open modal
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("open-feedback-btn")) {
      currentUserId = e.target.dataset.userId;
      currentQuizId = e.target.dataset.quizId;
      const existing = e.target.dataset.feedback || "";
      modalContent.innerHTML = `
        <textarea id="feedbackText" rows="4" style="width: 100%">${existing}</textarea>
      `;
      modal.style.display = "block";
    }
  });

  // Close modal
  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Save feedback
  saveFeedbackBtn.addEventListener("click", () => {
    const newFeedback = document.getElementById("feedbackText").value;
    const updated = quizHistory.map(entry => {
      if (entry.id === currentQuizId) {
        entry.feedback = newFeedback;
      }
      return entry;
    });
    localStorage.setItem("quizHistory", JSON.stringify(updated));
    modal.style.display = "none";
    renderUsers(
      document.getElementById("searchInput").value.toLowerCase(),
      document.getElementById("filterSelect").value
    );
  });

  // Filter controls
  document.getElementById("searchInput").addEventListener("input", (e) => {
    renderUsers(e.target.value.toLowerCase(), document.getElementById("filterSelect").value);
  });

  document.getElementById("filterSelect").addEventListener("change", (e) => {
    renderUsers(document.getElementById("searchInput").value.toLowerCase(), e.target.value);
  });

  // Initial render
  renderUsers();
});
