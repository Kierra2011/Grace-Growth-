
"use strict";

// Grace & Growth — interactive dashboard
const $ = (selector) => document.querySelector(selector);

const KEYS = {
  tasks: "gg_tasks_v1",
  journal: "gg_journal_v1",
  streak: "gg_streak_v1",
  theme: "gg_theme_v1"
};

// Safely handle browser storage failures.
function load(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    alert("Your browser could not save this change. Check your storage settings.");
    return false;
  }
}

function localDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function yesterday() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return localDate(date);
}

function makeId() {
  return Date.now().toString(36) +
    Math.random().toString(36).slice(2, 9);
}

const quotes = [
  "You are fearfully and wonderfully made. — Psalm 139:14",
  "I can do all things through Christ who strengthens me. — Philippians 4:13",
  "For God gave us a spirit of power, love and self-control. — 2 Timothy 1:7",
  "There is no need to rush your becoming.",
  "Small steps are still steps forward.",
  "You are worthy of love, even on your unproductive days.",
  "Be still, and know that I am God. — Psalm 46:10",
  "His mercies are new every morning. — Lamentations 3:22–23"
];

const verses = [
  {
    text: "For we are God's handiwork, created in Christ Jesus to do good works.",
    reference: "Ephesians 2:10"
  },
  {
    text: "Be strong and courageous. Do not be afraid; do not be discouraged.",
    reference: "Joshua 1:9"
  },
  {
    text: "I praise you because I am fearfully and wonderfully made.",
    reference: "Psalm 139:14"
  },
  {
    text: "Cast all your anxiety on him because he cares for you.",
    reference: "1 Peter 5:7"
  },
  {
    text: "The Lord is my shepherd; I shall not want.",
    reference: "Psalm 23:1"
  },
  {
    text: "My grace is sufficient for you, for my power is made perfect in weakness.",
    reference: "2 Corinthians 12:9"
  },
  {
    text: "Trust in the Lord with all your heart.",
    reference: "Proverbs 3:5"
  },
  {
    text: "I can do all things through Christ who strengthens me.",
    reference: "Philippians 4:13"
  }
];

const affirmations = [
  "I am worthy of love, care, and respect.",
  "I can begin again without judging myself.",
  "My progress does not have to look like anyone else's.",
  "I am allowed to rest without feeling guilty.",
  "I have the courage to take one small step.",
  "My mistakes do not define my worth.",
  "I am growing in wisdom, confidence, and grace.",
  "God is with me, even when I feel uncertain."
];

const prompts = [
  "What is one thing about yourself that you appreciate today?",
  "What is a space in your life where you need to extend yourself more grace?",
  "What small thing brought you joy today?",
  "What is one difficult thing you have overcome?",
  "What would you say to a friend who felt the way you do today?",
  "What is one worry you can release for now?",
  "What is one tiny step that would make tomorrow easier?",
  "Where have you noticed growth in yourself recently?",
  "What are three things you are grateful for today?"
];

let tasks = load(KEYS.tasks, []);
let journal = load(KEYS.journal, []);
let streak = load(KEYS.streak, {
  lastDate: "",
  count: 0
});

let quoteIndex = -1;
let verseIndex = -1;
let promptIndex = -1;

function randomIndex(length, previous) {
  if (length < 2) return 0;

  let next;
  do {
    next = Math.floor(Math.random() * length);
  } while (next === previous);

  return next;
}

// Date display
$("#todayDate").textContent = new Date().toLocaleDateString(
  undefined,
  { weekday: "short", month: "short", day: "numeric" }
);

// Theme toggle
function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  $("#themeToggle").innerHTML =
    theme === "dark"
      ? "☀ <span>Light mode</span>"
      : "☾ <span>Dark mode</span>";

  $("#themeToggle").setAttribute(
    "aria-label",
    theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
  );
}

applyTheme(load(KEYS.theme, "light"));

$("#themeToggle").addEventListener("click", () => {
  const next = document.body.classList.contains("dark")
    ? "light"
    : "dark";

  if (save(KEYS.theme, next)) {
    applyTheme(next);
  }
});

// Navigation tabs
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((item) => {
      item.classList.toggle("active", item === tab);
      item.setAttribute("aria-selected", String(item === tab));
    });

    document.querySelectorAll(".tab-panel").forEach((panel) => {
      panel.classList.toggle("hidden", panel.id !== tab.dataset.tab);
    });
  });

  tab.setAttribute(
    "aria-selected",
    String(tab.classList.contains("active"))
  );
});

// Daily quote banner
function showQuote() {
  quoteIndex = randomIndex(quotes.length, quoteIndex);
  $("#dailyQuote").textContent = quotes[quoteIndex];
}

$("#nextQuote").addEventListener("click", showQuote);
showQuote();

// Tasks and progress
function renderTasks() {
  const list = $("#taskList");
  list.replaceChildren();

  tasks.forEach((task) => {
    const item = document.createElement("div");
    item.className = "task-item";
    if (task.completed) item.classList.add("completed");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = Boolean(task.completed);
    checkbox.setAttribute("aria-label", `Complete ${task.text}`);

    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;

      if (save(KEYS.tasks, tasks)) {
        renderTasks();
      }
    });

    const name = document.createElement("span");
    name.className = "task-name";
    name.textContent = task.text;

    const remove = document.createElement("button");
    remove.className = "delete-task";
    remove.type = "button";
    remove.textContent = "✕";
    remove.setAttribute("aria-label", `Delete ${task.text}`);

    remove.addEventListener("click", () => {
      tasks = tasks.filter((entry) => entry.id !== task.id);
      if (save(KEYS.tasks, tasks)) renderTasks();
    });

    item.append(checkbox, name, remove);
    list.append(item);
  });

  $("#emptyTasks").classList.toggle("hidden", tasks.length > 0);

  const completed = tasks.filter((task) => task.completed).length;
  const percentage = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  $("#progressNumber").textContent = `${percentage}%`;
  $("#progressBar").style.width = `${percentage}%`;
  $("#progressBar").setAttribute("role", "progressbar");
  $("#progressBar").setAttribute("aria-valuemin", "0");
  $("#progressBar").setAttribute("aria-valuemax", "100");
  $("#progressBar").setAttribute("aria-valuenow", String(percentage));
  $("#taskSummary").textContent =
    `${completed} of ${tasks.length} tasks completed`;
}

$("#taskForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const input = $("#taskInput");
  const text = input.value.trim();

  if (!text) return;

  tasks.push({
    id: makeId(),
    text,
    completed: false,
    createdAt: localDate()
  });

  if (save(KEYS.tasks, tasks)) {
    input.value = "";
    renderTasks();
    input.focus();
  } else {
    tasks.pop();
  }
});

$("#clearCompleted").addEventListener("click", () => {
  const previous = tasks;
  tasks = tasks.filter((task) => !task.completed);

  if (save(KEYS.tasks, tasks)) {
    renderTasks();
  } else {
    tasks = previous;
  }
});

// Daily check-in streak
function renderStreak() {
  $("#streakNumber").textContent = streak.count;
  const checkedIn = streak.lastDate === localDate();

  $("#checkInBtn").textContent = checkedIn
    ? "Checked in today ✓"
    : "Check in today ♡";

  $("#checkInBtn").disabled = checkedIn;
}

$("#checkInBtn").addEventListener("click", () => {
  const today = localDate();

  if (streak.lastDate === today) return;

  const nextCount = streak.lastDate === yesterday()
    ? streak.count + 1
    : 1;

  const previous = streak;

  streak = {
    lastDate: today,
    count: nextCount
  };

  if (save(KEYS.streak, streak)) {
    renderStreak();
  } else {
    streak = previous;
  }
});

// Journal prompts
function showPrompt() {
  promptIndex = randomIndex(prompts.length, promptIndex);
  $("#journalPrompt").textContent = prompts[promptIndex];
}

$("#newPrompt").addEventListener("click", showPrompt);
showPrompt();

// Journal history
function renderJournal() {
  const history = $("#journalHistory");
  history.replaceChildren();

  const entries = [...journal].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  entries.forEach((entry) => {
    const card = document.createElement("article");
    card.className = "journal-entry";

    const header = document.createElement("div");
    header.className = "entry-header";

    const title = document.createElement("h3");
    title.textContent = entry.mood;

    const date = document.createElement("span");
    date.className = "entry-meta";
    date.textContent = entry.date;

    const remove = document.createElement("button");
    remove.className = "delete-entry";
    remove.type = "button";
    remove.textContent = "Delete";
    remove.addEventListener("click", () => {
      if (!confirm("Delete this reflection permanently from this browser?")) {
        return;
      }

      const previous = journal;
      journal = journal.filter((item) => item.id !== entry.id);

      if (save(KEYS.journal, journal)) {
        renderJournal();
      } else {
        journal = previous;
      }
    });

    header.append(title, date, remove);

    const prompt = document.createElement("p");
    prompt.className = "entry-prompt";
    prompt.textContent = entry.prompt;

    const body = document.createElement("p");
    body.className = "entry-body";
    body.textContent = entry.text || "A moment of reflection.";

    card.append(header, prompt, body);
    history.append(card);
  });

  $("#emptyJournal").classList.toggle("hidden", journal.length > 0);
}

$("#journalForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const text = $("#journalText").value.trim();
  const mood = $("#journalMood").value;

  if (!text) {
    $("#journalText").focus();
    return;
  }

  const entry = {
    id: makeId(),
    date: localDate(),
    mood,
    prompt: $("#journalPrompt").textContent,
    text
  };

  journal.push(entry);

  if (save(KEYS.journal, journal)) {
    $("#journalText").value = "";
    renderJournal();
  } else {
    journal.pop();
  }
});

// Affirmations
function renderAffirmations() {
  const grid = $("#affirmationGrid");
  grid.replaceChildren();

  affirmations.forEach((affirmation, index) => {
    const card = document.createElement("article");
    card.className = "affirmation-card";

    const icon = document.createElement("span");
    icon.textContent = "✧";

    const text = document.createElement("p");
    text.textContent = affirmation;

    const label = document.createElement("small");
    label.textContent = "A gentle truth to carry with you";

    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "text-button";
    copy.textContent = "Copy affirmation";

    copy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(affirmation);
        copy.textContent = "Copied ✓";
      } catch {
        copy.textContent = "Copy unavailable";
      }
    });

    card.append(icon, text, label, copy);
    grid.append(card);
  });
}

// Bible verse rotation
function showVerse() {
  verseIndex = randomIndex(verses.length, verseIndex);
  const verse = verses[verseIndex];

  $("#verseText").textContent = verse.text;
  $("#verseReference").textContent = verse.reference;
}

$("#newVerse").addEventListener("click", showVerse);

// Initial rendering
renderTasks();
renderStreak();
renderJournal();
renderAffirmations();
showVerse();
