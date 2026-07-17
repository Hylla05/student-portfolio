"use strict";

// Add a class for progressive animation enhancement.
document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", () => {
  setCurrentYear();
  initialiseNavigation();
  initialiseRevealAnimations();
  initialiseSimulatedLinks();
  initialisePlanner();
  initialiseContactForm();
});

/** Set every footer year without hard-coding it in each HTML page. */
function setCurrentYear() {
  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = new Date().getFullYear();
  });
}

/** Handle the responsive navigation menu and its accessibility state. */
function initialiseNavigation() {
  const toggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".site-nav");

  if (!toggle || !navigation) return;

  function closeMenu() {
    toggle.setAttribute("aria-expanded", "false");
    navigation.classList.remove("is-open");
    document.body.classList.remove("nav-open");
  }

  toggle.addEventListener("click", () => {
    const willOpen = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(willOpen));
    navigation.classList.toggle("is-open", willOpen);
    document.body.classList.toggle("nav-open", willOpen);
  });

  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a") || event.target === navigation) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      toggle.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) closeMenu();
  });
}

/** Reveal page sections as they enter the viewport. */
function initialiseRevealAnimations() {
  const elements = document.querySelectorAll(".reveal");
  if (!elements.length) return;

  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  elements.forEach((element) => observer.observe(element));
}

/** Display a temporary, screen-reader-friendly notification. */
function showToast(message) {
  let region = document.querySelector(".toast-region");

  if (!region) {
    region = document.createElement("div");
    region.className = "toast-region";
    region.setAttribute("aria-live", "polite");
    region.setAttribute("aria-atomic", "true");
    document.body.appendChild(region);
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  region.appendChild(toast);

  window.setTimeout(() => toast.remove(), 3600);
}

/** Clearly label concept project links as simulated rather than broken links. */
function initialiseSimulatedLinks() {
  document.querySelectorAll("[data-simulated-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      showToast(`${link.dataset.simulatedLink} is a simulated portfolio link.`);
    });
  });
}

/* =====================================================
   Academic planner
   Demonstrates arrays, functions, event handling,
   DOM manipulation and dynamic content updates.
   Tasks intentionally do not use localStorage.
   ===================================================== */
function initialisePlanner() {
  const form = document.querySelector("#task-form");
  const taskList = document.querySelector("#task-list");
  if (!form || !taskList) return;

  const titleInput = document.querySelector("#task-title");
  const courseInput = document.querySelector("#task-course");
  const dueDateInput = document.querySelector("#task-due-date");
  const priorityInput = document.querySelector("#task-priority");
  const formError = document.querySelector("#task-form-error");
  const emptyState = document.querySelector("#task-empty-state");
  const totalOutput = document.querySelector("#total-tasks");
  const activeOutput = document.querySelector("#active-tasks");
  const completedOutput = document.querySelector("#completed-tasks");
  const progressBar = document.querySelector("#task-progress");
  const progressText = document.querySelector("#task-progress-text");
  const clearCompletedButton = document.querySelector("#clear-completed");
  const filterButtons = document.querySelectorAll("[data-task-filter]");

  let currentFilter = "all";
  let tasks = [
    {
      id: 1,
      title: "Review programming lecture notes",
      course: "Introduction to Programming",
      dueDate: getRelativeISODate(2),
      priority: "high",
      completed: false,
    },
    {
      id: 2,
      title: "Outline weekly study goals",
      course: "Academic Planning",
      dueDate: getRelativeISODate(5),
      priority: "medium",
      completed: true,
    },
  ];

  // Prevent users from selecting a past date for newly added tasks.
  dueDateInput.min = getRelativeISODate(0);

  function getFilteredTasks() {
    if (currentFilter === "active") return tasks.filter((task) => !task.completed);
    if (currentFilter === "completed") return tasks.filter((task) => task.completed);
    return tasks;
  }

  function updateSummary() {
    const completedCount = tasks.filter((task) => task.completed).length;
    const activeCount = tasks.length - completedCount;
    const percentage = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

    totalOutput.textContent = String(tasks.length);
    activeOutput.textContent = String(activeCount);
    completedOutput.textContent = String(completedCount);
    progressBar.style.width = `${percentage}%`;
    progressBar.setAttribute("aria-valuenow", String(percentage));
    progressText.textContent = `${percentage}% complete`;
    clearCompletedButton.disabled = completedCount === 0;
  }

  function createTaskElement(task) {
    const item = document.createElement("li");
    item.className = `task-item${task.completed ? " is-completed" : ""}`;
    item.dataset.taskId = String(task.id);

    const checkbox = document.createElement("input");
    checkbox.className = "task-check";
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Mark ${task.title} as ${task.completed ? "active" : "completed"}`);

    const copy = document.createElement("div");
    copy.className = "task-copy";

    const title = document.createElement("p");
    title.className = "task-title";
    title.textContent = task.title;

    const meta = document.createElement("div");
    meta.className = "task-meta";

    const course = document.createElement("span");
    course.textContent = task.course;

    const date = document.createElement("span");
    date.textContent = `Due ${formatDisplayDate(task.dueDate)}`;

    const priority = document.createElement("span");
    priority.className = `priority-label priority-${task.priority}`;
    priority.textContent = `${capitalise(task.priority)} priority`;

    meta.append(course, date, priority);
    copy.append(title, meta);

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-task";
    deleteButton.type = "button";
    deleteButton.dataset.deleteTask = String(task.id);
    deleteButton.setAttribute("aria-label", `Delete ${task.title}`);
    deleteButton.title = "Delete task";
    deleteButton.textContent = "×";

    item.append(checkbox, copy, deleteButton);
    return item;
  }

  function renderTasks() {
    const visibleTasks = getFilteredTasks();
    taskList.replaceChildren();

    visibleTasks.forEach((task) => taskList.appendChild(createTaskElement(task)));

    const filterLabel = currentFilter === "all" ? "tasks" : `${currentFilter} tasks`;
    emptyState.hidden = visibleTasks.length > 0;
    emptyState.querySelector("p").textContent = `There are no ${filterLabel} to display.`;
    updateSummary();
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = titleInput.value.trim();
    const course = courseInput.value.trim();
    const dueDate = dueDateInput.value;

    if (!title || !course || !dueDate) {
      formError.textContent = "Enter a task, course, and due date before adding it.";
      const firstEmpty = [titleInput, courseInput, dueDateInput].find((input) => !input.value.trim());
      firstEmpty?.focus();
      return;
    }

    formError.textContent = "";
    tasks.unshift({
      id: Date.now(),
      title,
      course,
      dueDate,
      priority: priorityInput.value,
      completed: false,
    });

    form.reset();
    dueDateInput.min = getRelativeISODate(0);
    currentFilter = "all";
    updateFilterButtons();
    renderTasks();
    titleInput.focus();
    showToast("Task added to your academic planner.");
  });

  taskList.addEventListener("change", (event) => {
    if (!event.target.matches(".task-check")) return;

    const taskId = Number(event.target.closest(".task-item").dataset.taskId);
    const selectedTask = tasks.find((task) => task.id === taskId);
    if (!selectedTask) return;

    selectedTask.completed = event.target.checked;
    renderTasks();
    showToast(selectedTask.completed ? "Task marked as completed." : "Task returned to active.");
  });

  taskList.addEventListener("click", (event) => {
    const deleteButton = event.target.closest("[data-delete-task]");
    if (!deleteButton) return;

    const taskId = Number(deleteButton.dataset.deleteTask);
    tasks = tasks.filter((task) => task.id !== taskId);
    renderTasks();
    showToast("Task deleted from the planner.");
  });

  function updateFilterButtons() {
    filterButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.taskFilter === currentFilter));
    });
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentFilter = button.dataset.taskFilter;
      updateFilterButtons();
      renderTasks();
    });
  });

  clearCompletedButton.addEventListener("click", () => {
    tasks = tasks.filter((task) => !task.completed);
    renderTasks();
    showToast("Completed tasks cleared.");
  });

  renderTasks();
}

function getRelativeISODate(dayOffset) {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDisplayDate(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const localDate = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(localDate);
}

function capitalise(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/* =====================================================
   Contact form validation
   Ensures every field is completed, validates email,
   and accepts digits only for the phone number.
   ===================================================== */
function initialiseContactForm() {
  const form = document.querySelector("#contact-form");
  if (!form) return;

  const fields = {
    name: form.querySelector("#contact-name"),
    email: form.querySelector("#contact-email"),
    phone: form.querySelector("#contact-phone"),
    message: form.querySelector("#contact-message"),
  };
  const successMessage = document.querySelector("#contact-success");

  const validationRules = {
    name(value) {
      if (!value.trim()) return "Please enter your name.";
      return "";
    },
    email(value) {
      if (!value.trim()) return "Please enter your email address.";
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailPattern.test(value.trim())) return "Enter a valid email address.";
      return "";
    },
    phone(value) {
      if (!value.trim()) return "Please enter your phone number.";
      if (!/^\d+$/.test(value.trim())) return "Phone number must contain digits only.";
      if (value.trim().length < 7 || value.trim().length > 15) return "Enter a phone number containing 7 to 15 digits.";
      return "";
    },
    message(value) {
      if (!value.trim()) return "Please enter your message.";
      return "";
    },
  };

  function showFieldError(fieldName) {
    const input = fields[fieldName];
    const errorElement = document.querySelector(`#${input.id}-error`);
    const error = validationRules[fieldName](input.value);

    input.setAttribute("aria-invalid", String(Boolean(error)));
    errorElement.textContent = error;
    return !error;
  }

  Object.entries(fields).forEach(([fieldName, input]) => {
    input.addEventListener("blur", () => showFieldError(fieldName));
    input.addEventListener("input", () => {
      if (input.getAttribute("aria-invalid") === "true") showFieldError(fieldName);
      successMessage.hidden = true;
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const results = Object.keys(fields).map((fieldName) => showFieldError(fieldName));
    if (results.includes(false)) {
      const firstInvalid = Object.values(fields).find((input) => input.getAttribute("aria-invalid") === "true");
      firstInvalid?.focus();
      showToast("Please correct the highlighted form fields.");
      return;
    }

    const senderName = fields.name.value.trim();
    successMessage.textContent = `Thank you, ${senderName}. Your message passed validation successfully. This demonstration form does not send data to a server.`;
    successMessage.hidden = false;
    form.reset();
    Object.values(fields).forEach((input) => input.setAttribute("aria-invalid", "false"));
    successMessage.focus();
    showToast("Contact form validated successfully.");
  });
}
