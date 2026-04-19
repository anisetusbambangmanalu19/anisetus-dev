const fallbackProjects = [
  {
    title: "Movie Reservation Backend",
    summary: "Backend API for movie reservation and transaction flow.",
    tech_stack: "TypeScript, Express, PostgreSQL",
    repo_url: "https://github.com/anisetusbambangmanalu19/movie-reservation-backend",
    demo_url: "",
    cover_image_url: "",
    updated_at: "2026-03-19T09:20:24Z"
  },
  {
    title: "Task Management System",
    summary: "Fullstack task management app with Go clean architecture and React.",
    tech_stack: "Go, React, PostgreSQL",
    repo_url: "https://github.com/anisetusbambangmanalu19/Task-Management-System",
    demo_url: "",
    cover_image_url: "",
    updated_at: "2026-02-19T07:14:08Z"
  },
  {
    title: "Sistem Informasi Sekolah",
    summary: "Web-based information system for SD Negeri 173100 Tarutung.",
    tech_stack: "Laravel, MySQL, Blade",
    repo_url: "https://github.com/anisetusbambangmanalu19/ProyekAkhir1_Kel11",
    demo_url: "",
    cover_image_url: "",
    updated_at: "2025-12-08T14:16:14Z"
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
  const date = new Date(isoDate || Date.now());
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function buildTechTags(rawTech) {
  const tags = String(rawTech || "").split(",").map((item) => item.trim()).filter(Boolean);
  if (!tags.length) {
    return "<span>Multi-stack</span>";
  }

  return tags.slice(0, 4).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
}

function renderProjects(projects, sourceLabel) {
  projectList.innerHTML = "";

  if (!projects.length) {
    projectList.innerHTML = '<p class="mono">Belum ada proyek. Tambahkan dari halaman Admin.</p>';
    return;
  }

  projects.slice(0, 6).forEach((project) => {
    const card = document.createElement("article");
    card.className = "project-card project-card-rich";

    const title = escapeHtml(project.title || project.name || "Untitled Project");
    const summary = escapeHtml(project.summary || project.description || "Deskripsi proyek belum tersedia.");
    const repoUrl = project.repo_url || project.html_url || "#";
    const demoUrl = project.demo_url || "";
    const coverUrl = project.cover_image_url || "";
    const techTags = buildTechTags(project.tech_stack || project.language);
    const updatedAt = formatDate(project.updated_at || project.pushed_at);

    const mediaHtml = coverUrl
      ? `<img src="${escapeHtml(coverUrl)}" alt="Preview ${title}" class="project-cover" loading="lazy" />`
      : '<div class="project-cover project-cover-placeholder">Tidak ada gambar</div>';

    const demoLinkHtml = demoUrl
      ? `<a class="project-action" href="${escapeHtml(demoUrl)}" target="_blank" rel="noreferrer noopener">Live Demo</a>`
      : "";

    card.innerHTML = `
      <div class="project-media">${mediaHtml}</div>
      <div class="project-body">
        <h3>${title}</h3>
        <p>${summary}</p>
        <div class="tech-tags">${techTags}</div>
        <div class="project-meta">
          <span>${updatedAt}</span>
          <span>${escapeHtml(sourceLabel)}</span>
        </div>
        <div class="project-actions">
          <a class="project-action" href="${escapeHtml(repoUrl)}" target="_blank" rel="noreferrer noopener">GitHub</a>
          ${demoLinkHtml}
        </div>
      </div>
    `;

    projectList.appendChild(card);
  });
}

function hasSupabaseConfig() {
  return Boolean(window.SUPABASE_CONFIG?.url && window.SUPABASE_CONFIG?.anonKey);
}

async function loadProjectsFromSupabase() {
  const client = window.supabase.createClient(
    window.SUPABASE_CONFIG.url,
    window.SUPABASE_CONFIG.anonKey
  );

  const { data, error } = await client
    .from("projects")
    .select("id, title, summary, tech_stack, repo_url, demo_url, cover_image_url, updated_at")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

async function loadProjectsFromGitHubFallback() {
  const response = await fetch(
    "https://api.github.com/users/anisetusbambangmanalu19/repos?sort=updated&per_page=12"
  );

  if (!response.ok) {
    throw new Error("Unable to fetch repositories");
  }

  const repos = await response.json();
  return repos.map((repo) => ({
    ...repo,
    title: repo.name,
    summary: repo.description,
    tech_stack: repo.language,
    repo_url: repo.html_url,
    updated_at: repo.pushed_at,
    cover_image_url: ""
  }));
}

async function loadProjects() {
  try {
    if (hasSupabaseConfig()) {
      const projects = await loadProjectsFromSupabase();
      renderProjects(projects, "Supabase");
      return;
    }

    throw new Error("Supabase config not set");
  } catch (_supabaseError) {
    try {
      const repos = await loadProjectsFromGitHubFallback();
      renderProjects(repos, "GitHub");
    } catch (_githubError) {
      renderProjects(fallbackProjects, "Fallback");
    }
  }
}

lastUpdated.textContent = `Updated ${new Date().toLocaleDateString("id-ID", {
  day: "2-digit",
  month: "long",
  year: "numeric"
})}`;

loadProjects();
