const fallbackProjects = [
  {
    name: "movie-reservation-backend",
    html_url: "https://github.com/anisetusbambangmanalu19/movie-reservation-backend",
    description: "Backend API for movie reservation and transaction flow.",
    language: "TypeScript",
    pushed_at: "2026-03-19T09:20:24Z"
  },
  {
    name: "Task-Management-System",
    html_url: "https://github.com/anisetusbambangmanalu19/Task-Management-System",
    description: "Fullstack task management app with Go clean architecture and React.",
    language: "Go",
    pushed_at: "2026-02-19T07:14:08Z"
  },
  {
    name: "ProyekAkhir1_Kel11",
    html_url: "https://github.com/anisetusbambangmanalu19/ProyekAkhir1_Kel11",
    description: "Web-based information system for SD Negeri 173100 Tarutung.",
    language: "HTML",
    pushed_at: "2025-12-08T14:16:14Z"
  }
];

const projectList = document.getElementById("project-list");
const lastUpdated = document.getElementById("last-updated");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDate(isoDate) {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function renderProjects(repos) {
  projectList.innerHTML = "";

  repos.slice(0, 6).forEach((repo) => {
    const card = document.createElement("article");
    card.className = "project-card";

    const desc = escapeHtml(repo.description || "Repository project on GitHub.");
    const lang = escapeHtml(repo.language || "Multi-stack");
    const name = escapeHtml(repo.name);

    card.innerHTML = `
      <h3><a href="${repo.html_url}" target="_blank" rel="noreferrer noopener">${name}</a></h3>
      <p>${desc}</p>
      <div class="project-meta">
        <span>${lang}</span>
        <span>${formatDate(repo.pushed_at)}</span>
      </div>
    `;

    projectList.appendChild(card);
  });
}

async function loadProjects() {
  try {
    const response = await fetch(
      "https://api.github.com/users/anisetusbambangmanalu19/repos?sort=updated&per_page=12"
    );

    if (!response.ok) {
      throw new Error("Unable to fetch repositories");
    }

    const repos = await response.json();
    renderProjects(repos);
  } catch (_error) {
    renderProjects(fallbackProjects);
  }
}

lastUpdated.textContent = `Updated ${new Date().toLocaleDateString("en-GB", {
  day: "2-digit",
  month: "long",
  year: "numeric"
})}`;

loadProjects();
