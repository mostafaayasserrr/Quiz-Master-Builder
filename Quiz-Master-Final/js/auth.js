// Check if user is logged in and ensure default users exist
function checkAuth() {
  // ✅ Always create default users if not already set
  if (!localStorage.getItem("users")) {
    const defaultUsers = [
      {
        id: "1",
        name: "Admin User",
        email: "admin@example.com",
        password: "admin123",
        isAdmin: true,
        joinDate: new Date().toISOString(),
      },
      {
        id: "2",
        name: "Test User",
        email: "user@example.com",
        password: "user123",
        isAdmin: false,
        joinDate: new Date().toISOString(),
      },
    ];
    localStorage.setItem("users", JSON.stringify(defaultUsers));
  }

  const currentUser = localStorage.getItem("currentUser");

  if (currentUser) {
    // User is logged in
    const user = JSON.parse(currentUser);

    // Update UI elements
    const userNameElements = document.querySelectorAll("#user-name");
    userNameElements.forEach((element) => {
      element.textContent = user.name;
    });

    // Show/hide admin button
    const adminBtn = document.getElementById("admin-btn");
    if (adminBtn) {
      adminBtn.classList.toggle("hidden", !user.isAdmin);
    }

    // If on login page, redirect to dashboard
    if (window.location.pathname.includes("login.html")) {
      window.location.href = "dashboard.html";
    }
  } else {
    // Not logged in — redirect from protected pages
    const protectedPages = [
      "dashboard.html",
      "admin.html",
      "create-quiz.html",
      "profile.html",
    ];
    const currentPage = window.location.pathname.split("/").pop();
    if (protectedPages.includes(currentPage)) {
      window.location.href = "login.html";
    }
  }
}

// Setup all auth-related event listeners
function initAuth() {
  // Logout
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("currentUser");
      window.location.href = "index.html";
    });
  }

  // Login
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value.trim();
      const password = document.getElementById("login-password").value.trim();

      const users = JSON.parse(localStorage.getItem("users")) || [];
      const user = users.find((u) => u.email === email && u.password === password);

      if (user) {
        const { password, ...userWithoutPassword } = user;
        localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword));
        window.location.href = "dashboard.html";
      } else {
        alert("Invalid email or password. Please try again.");
      }
    });
  }

  // Register
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("register-name").value.trim();
      const email = document.getElementById("register-email").value.trim();
      const password = document.getElementById("register-password").value.trim();
      const confirmPassword = document.getElementById("confirm-password").value.trim();

      if (password !== confirmPassword) {
        alert("Passwords do not match. Please try again.");
        return;
      }

      const users = JSON.parse(localStorage.getItem("users")) || [];

      if (users.some((u) => u.email === email)) {
        alert("Email already exists. Please use a different email.");
        return;
      }

      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        isAdmin: false,
        joinDate: new Date().toISOString(),
      };

      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));

      const { password: _, ...userWithoutPassword } = newUser;
      localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword));
      window.location.href = "dashboard.html";
    });
  }

  // Auth tab switching
  const authTabs = document.querySelectorAll(".auth-tab");
  if (authTabs.length > 0) {
    authTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".auth-tab").forEach((t) => t.classList.remove("active"));
        document.querySelectorAll(".auth-form").forEach((f) => f.classList.remove("active"));
        tab.classList.add("active");
        const formId = `${tab.dataset.tab}-form-container`;
        document.getElementById(formId).classList.add("active");
      });
    });
  }

  // Mobile nav toggle
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector("nav ul");

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("show");
    });
  }
}

// Init on page load
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  initAuth();
});
