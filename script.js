const fallbackProjects = [
  {
    title: "Movie Reservation Backend",
    summary: "Backend API for movie reservation and transaction flow.",
    tech_stack: "TypeScript, Express, PostgreSQL",
    repo_url: "https://github.com/anisetusbambangmanalu19/movie-reservation-backend",
    demo_url: "",
    cover_image_url: "",
    updated_at: "2026-03-19T09:20:24Z",
    project_images: []
  },
  {
    title: "Task Management System",
    summary: "Fullstack task management app with Go clean architecture and React.",
    tech_stack: "Go, React, PostgreSQL",
    repo_url: "https://github.com/anisetusbambangmanalu19/Task-Management-System",
    demo_url: "",
    cover_image_url: "",
    updated_at: "2026-02-19T07:14:08Z",
    project_images: []
  },
  {
    title: "Sistem Informasi Sekolah",
    summary: "Web-based information system for SD Negeri 173100 Tarutung.",
    tech_stack: "Laravel, MySQL, Blade",
    repo_url: "https://github.com/anisetusbambangmanalu19/ProyekAkhir1_Kel11",
    demo_url: "",
    cover_image_url: "",
    updated_at: "2025-12-08T14:16:14Z",
    project_images: []
  }
];

const fallbackSiteSettings = {
  hero_eyebrow: "Backend Engineer | Full Stack Developer | Siap Magang",
  hero_name: "Anisetus Bambang Manalu",
  hero_bio:
    "Mahasiswa tingkat akhir Teknologi Rekayasa Perangkat Lunak di Institut Teknologi Del. Saya membangun sistem API-first dengan arsitektur rapi, desain database production-ready, dan autentikasi yang aman untuk kebutuhan nyata.",
  focus_title: "Pengembangan Full-Stack",
  focus_description:
    "Ahli dalam membangun backend dengan Laravel dan Node.js, frontend modern menggunakan Next.js/React, serta aplikasi mobile lintas platform dengan Flutter. Didukung oleh PostgreSQL dan Docker.",
  about_text:
    "Saya memiliki pengalaman langsung membangun sistem digital untuk kebutuhan nyata, mulai dari platform retribusi pasar, sistem administrasi sekolah, hingga platform booking. Saya menikmati proses mengubah alur kerja kompleks menjadi software yang terstruktur dan mudah dipelihara.",
  profile_image_url: ""
};

const projectList = document.getElementById("project-list");
const lastUpdated = document.getElementById("last-updated");

const heroEyebrow = document.getElementById("hero-eyebrow");
const heroName = document.getElementById("hero-name");
const heroBio = document.getElementById("hero-bio");
const focusTitle = document.getElementById("focus-title");
const focusDescription = document.getElementById("focus-description");
const aboutText = document.getElementById("about-text");
const profileImage = document.getElementById("profile-image");

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
  const tags = String(rawTech || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!tags.length) {
    return "<span>Multi-stack</span>";
  }

  return tags
    .slice(0, 4)
    .map((tag) => `<span>${escapeHtml(tag)}</span>`)
    .join("");
}

function hasSupabaseConfig() {
  return Boolean(window.SUPABASE_CONFIG?.url && window.SUPABASE_CONFIG?.anonKey);
}

function getSupabaseClient() {
  return window.supabase.createClient(
    window.SUPABASE_CONFIG.url,
    window.SUPABASE_CONFIG.anonKey
  );
}

function applySiteSettings(settings) {
  const merged = {
    ...fallbackSiteSettings,
    ...(settings || {})
  };

  heroEyebrow.textContent = merged.hero_eyebrow;
  heroName.textContent = merged.hero_name;
  heroBio.textContent = merged.hero_bio;
  focusTitle.textContent = merged.focus_title;
  focusDescription.textContent = merged.focus_description;
  aboutText.textContent = merged.about_text;

  if (merged.profile_image_url) {
    profileImage.src = merged.profile_image_url;
  }
}

function renderGalleryPreview(images, title) {
  if (!images.length) {
    return "";
  }

  const thumbs = images
    .slice(0, 3)
    .map(
      (image) =>
        `<img src="${escapeHtml(image.image_url)}" alt="Galeri ${escapeHtml(title)}" loading="lazy" class="project-gallery-thumb" />`
    )
    .join("");

  return `<div class="project-gallery-preview">${thumbs}</div>`;
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
    const summary = escapeHtml(
      project.summary || project.description || "Deskripsi proyek belum tersedia."
    );
    const repoUrl = project.repo_url || project.html_url || "#";
    const demoUrl = project.demo_url || "";
    const techTags = buildTechTags(project.tech_stack || project.language);
    const updatedAt = formatDate(project.updated_at || project.pushed_at);
    const galleryImages = [...(project.project_images || [])].sort(
      (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
    );

    const imageSource = project.cover_image_url || galleryImages[0]?.image_url || "";

    const mediaHtml = imageSource
      ? `<img src="${escapeHtml(imageSource)}" alt="Preview ${title}" class="project-cover" loading="lazy" />`
      : '<div class="project-cover project-cover-placeholder">Tidak ada gambar</div>';

    const demoLinkHtml = demoUrl
      ? `<a class="project-action" href="${escapeHtml(demoUrl)}" target="_blank" rel="noreferrer noopener">Live Demo</a>`
      : "";

    const galleryPreviewHtml = renderGalleryPreview(galleryImages, title);

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
        ${galleryPreviewHtml}
      </div>
    `;

    projectList.appendChild(card);
  });
}

async function loadSiteSettingsFromSupabase() {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("site_settings")
    .select(
      "hero_eyebrow, hero_name, hero_bio, focus_title, focus_description, about_text, profile_image_url"
    )
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

async function loadProjectsFromSupabase() {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from("projects")
    .select(
      "id, title, summary, tech_stack, repo_url, demo_url, cover_image_url, updated_at, project_images(id, image_url, sort_order)"
    )
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
    cover_image_url: "",
    project_images: []
  }));
}

async function loadSiteContent() {
  try {
    if (hasSupabaseConfig()) {
      const settings = await loadSiteSettingsFromSupabase();
      applySiteSettings(settings || fallbackSiteSettings);
      return;
    }

    applySiteSettings(fallbackSiteSettings);
  } catch (_error) {
    applySiteSettings(fallbackSiteSettings);
  }
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

loadSiteContent();
loadProjects();
