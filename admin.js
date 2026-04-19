const authStatus = document.getElementById("auth-status");
const githubLoginBtn = document.getElementById("github-login-btn");
const logoutBtn = document.getElementById("logout-btn");
const projectForm = document.getElementById("project-form");
const projectFormStatus = document.getElementById("project-form-status");
const adminProjectList = document.getElementById("admin-project-list");
const refreshProjectsBtn = document.getElementById("refresh-projects-btn");
const resetFormBtn = document.getElementById("reset-form-btn");
const adminLastUpdated = document.getElementById("admin-last-updated");
const ADMIN_EMAILS = ["anisetus@gmail.com", "anisetusm@gmail.com"];
let currentSession = null;

const client = hasConfig()
  ? window.supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.anonKey)
  : null;

function hasConfig() {
  return Boolean(window.SUPABASE_CONFIG?.url && window.SUPABASE_CONFIG?.anonKey);
}

function nowLabel() {
  return new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function setStatus(message, isError = false) {
  projectFormStatus.textContent = message;
  projectFormStatus.style.color = isError ? "#ff9b9b" : "";
}

function getSessionEmail(session) {
  return (session?.user?.email || "").trim().toLowerCase();
}

function isAdminSession(session) {
  return ADMIN_EMAILS.includes(getSessionEmail(session));
}

function setAdminControlsEnabled(enabled) {
  const formFields = projectForm.querySelectorAll("input, textarea, button");
  formFields.forEach((field) => {
    if (field.id !== "project-id") {
      field.disabled = !enabled;
    }
  });

  refreshProjectsBtn.disabled = !enabled;
}

function setAuthStatus(session) {
  currentSession = session;

  if (!session) {
    authStatus.textContent = "Belum login";
    logoutBtn.disabled = true;
    setAdminControlsEnabled(false);
    return;
  }

  const email = session.user.email;
  if (!isAdminSession(session)) {
    authStatus.textContent = `Login sebagai ${email}, tetapi akun ini tidak punya akses admin.`;
    logoutBtn.disabled = false;
    setAdminControlsEnabled(false);
    return;
  }

  authStatus.textContent = `Login sebagai ${email}`;
  logoutBtn.disabled = false;
  setAdminControlsEnabled(true);
}

function resetProjectForm() {
  projectForm.reset();
  document.getElementById("project-id").value = "";
  document.getElementById("project-order").value = 0;
  document.getElementById("project-published").checked = true;
}

function ensureConfigured() {
  if (client) {
    return true;
  }

  authStatus.textContent = "Supabase belum dikonfigurasi. Isi file supabase-config.js";
  setStatus("Isi supabase-config.js dulu agar admin bisa dipakai.", true);
  return false;
}

function ensureAdminAccess() {
  if (isAdminSession(currentSession)) {
    return true;
  }

  setStatus("Akses ditolak. Hanya akun admin yang diizinkan mengelola proyek.", true);
  return false;
}

async function uploadImage(file, folder = "covers") {
  const extension = file.name.split(".").pop();
  const path = `${folder}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await client.storage
    .from("project-images")
    .upload(path, file, { upsert: false, contentType: file.type });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = client.storage.from("project-images").getPublicUrl(path);
  return data.publicUrl;
}

async function createOrUpdateProject(event) {
  event.preventDefault();

  if (!ensureConfigured()) {
    return;
  }

  if (!ensureAdminAccess()) {
    return;
  }

  try {
    setStatus("Menyimpan proyek...");

    const projectId = document.getElementById("project-id").value;
    const title = document.getElementById("project-title").value.trim();
    const summary = document.getElementById("project-summary").value.trim();
    const techStack = document.getElementById("project-tech").value.trim();
    const repoUrl = document.getElementById("project-repo").value.trim();
    const demoUrl = document.getElementById("project-demo").value.trim();
    const sortOrder = Number(document.getElementById("project-order").value || 0);
    const isPublished = document.getElementById("project-published").checked;
    const coverFile = document.getElementById("project-cover").files[0];
    const galleryFiles = Array.from(document.getElementById("project-gallery").files || []);

    let coverUrl = null;
    if (coverFile) {
      coverUrl = await uploadImage(coverFile, "covers");
    }

    const payload = {
      title,
      summary,
      tech_stack: techStack,
      repo_url: repoUrl || null,
      demo_url: demoUrl || null,
      is_published: isPublished,
      sort_order: sortOrder
    };

    if (coverUrl) {
      payload.cover_image_url = coverUrl;
    }

    let targetProjectId = projectId;

    if (projectId) {
      const { error } = await client.from("projects").update(payload).eq("id", projectId);
      if (error) {
        throw error;
      }
    } else {
      const { data, error } = await client
        .from("projects")
        .insert(payload)
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      targetProjectId = data.id;
    }

    if (galleryFiles.length && targetProjectId) {
      const rows = [];

      for (let index = 0; index < galleryFiles.length; index += 1) {
        const url = await uploadImage(galleryFiles[index], "gallery");
        rows.push({
          project_id: targetProjectId,
          image_url: url,
          caption: "",
          sort_order: index
        });
      }

      const { error: galleryError } = await client.from("project_images").insert(rows);
      if (galleryError) {
        throw galleryError;
      }
    }

    setStatus("Proyek berhasil disimpan.");
    resetProjectForm();
    await renderAdminProjects();
  } catch (error) {
    setStatus(`Gagal menyimpan proyek: ${error.message}`, true);
  }
}

async function deleteProject(projectId) {
  if (!ensureConfigured()) {
    return;
  }

  if (!ensureAdminAccess()) {
    return;
  }

  const confirmed = window.confirm("Hapus proyek ini? Tindakan ini tidak bisa dibatalkan.");
  if (!confirmed) {
    return;
  }

  try {
    const { error } = await client.from("projects").delete().eq("id", projectId);
    if (error) {
      throw error;
    }

    setStatus("Proyek berhasil dihapus.");
    await renderAdminProjects();
  } catch (error) {
    setStatus(`Gagal menghapus proyek: ${error.message}`, true);
  }
}

function fillProjectForm(project) {
  document.getElementById("project-id").value = project.id;
  document.getElementById("project-title").value = project.title || "";
  document.getElementById("project-summary").value = project.summary || "";
  document.getElementById("project-tech").value = project.tech_stack || "";
  document.getElementById("project-repo").value = project.repo_url || "";
  document.getElementById("project-demo").value = project.demo_url || "";
  document.getElementById("project-order").value = project.sort_order || 0;
  document.getElementById("project-published").checked = Boolean(project.is_published);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function renderAdminProjects() {
  if (!ensureConfigured()) {
    adminProjectList.innerHTML = "";
    return;
  }

  if (!isAdminSession(currentSession)) {
    adminProjectList.innerHTML = '<p class="mono">Login dengan akun admin untuk melihat dan mengelola daftar proyek.</p>';
    return;
  }

  adminProjectList.innerHTML = '<p class="mono">Memuat daftar proyek...</p>';

  try {
    const { data, error } = await client
      .from("projects")
      .select("id, title, summary, tech_stack, repo_url, demo_url, cover_image_url, is_published, sort_order, updated_at, project_images(id, image_url)")
      .order("sort_order", { ascending: true })
      .order("updated_at", { ascending: false });

    if (error) {
      throw error;
    }

    if (!data?.length) {
      adminProjectList.innerHTML = '<p class="mono">Belum ada proyek. Tambahkan proyek pertama kamu.</p>';
      return;
    }

    adminProjectList.innerHTML = "";

    data.forEach((project) => {
      const card = document.createElement("article");
      card.className = "admin-project-card";

      const galleryCount = project.project_images?.length || 0;
      const publishedLabel = project.is_published ? "Published" : "Draft";
      const repoLink = project.repo_url
        ? `<a class="project-action" href="${escapeHtml(project.repo_url)}" target="_blank" rel="noreferrer noopener">GitHub</a>`
        : "";

      const demoLink = project.demo_url
        ? `<a class="project-action" href="${escapeHtml(project.demo_url)}" target="_blank" rel="noreferrer noopener">Demo</a>`
        : "";

      const coverHtml = project.cover_image_url
        ? `<img src="${escapeHtml(project.cover_image_url)}" alt="Cover ${escapeHtml(project.title)}" class="admin-project-cover" loading="lazy" />`
        : '<div class="admin-project-cover admin-project-cover-placeholder">No Cover</div>';

      card.innerHTML = `
        <div class="admin-project-top">
          ${coverHtml}
          <div>
            <p class="mono">${publishedLabel} • Order ${project.sort_order}</p>
            <h3>${escapeHtml(project.title)}</h3>
            <p>${escapeHtml(project.summary || "")}</p>
            <p class="mono">${galleryCount} foto galeri</p>
            <div class="project-actions">${repoLink}${demoLink}</div>
          </div>
        </div>
        <div class="admin-project-actions">
          <button class="btn btn-ghost" data-action="edit" data-id="${project.id}">Edit</button>
          <button class="btn btn-ghost" data-action="delete" data-id="${project.id}">Hapus</button>
        </div>
      `;

      card.querySelector('[data-action="edit"]').addEventListener("click", () => fillProjectForm(project));
      card.querySelector('[data-action="delete"]').addEventListener("click", () => deleteProject(project.id));

      adminProjectList.appendChild(card);
    });
  } catch (error) {
    adminProjectList.innerHTML = `<p class="mono">Gagal memuat proyek: ${escapeHtml(error.message)}</p>`;
  }
}

async function signIn(event) {
  if (!ensureConfigured()) {
    return;
  }

  const redirectTo = `${window.location.origin}${window.location.pathname}`;
  const { error } = await client.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo
    }
  });

  if (error) {
    authStatus.textContent = `Login gagal: ${error.message}`;
  }
}

async function signOut() {
  if (!ensureConfigured()) {
    return;
  }

  const { error } = await client.auth.signOut();
  if (error) {
    authStatus.textContent = `Gagal logout: ${error.message}`;
    return;
  }

  setAuthStatus(null);
  authStatus.textContent = "Berhasil logout.";
}

async function bootstrap() {
  adminLastUpdated.textContent = `Updated ${nowLabel()}`;
  setAdminControlsEnabled(false);

  if (!hasConfig()) {
    authStatus.textContent = "Isi supabase-config.js terlebih dahulu.";
    setStatus("Supabase belum aktif. Jalankan setup lalu isi URL + anon key.", true);
    return;
  }

  const { data } = await client.auth.getSession();
  setAuthStatus(data.session);
  await renderAdminProjects();

  client.auth.onAuthStateChange((_event, session) => {
    setAuthStatus(session);
  });
}

githubLoginBtn.addEventListener("click", signIn);
logoutBtn.addEventListener("click", signOut);
projectForm.addEventListener("submit", createOrUpdateProject);
refreshProjectsBtn.addEventListener("click", renderAdminProjects);
resetFormBtn.addEventListener("click", () => {
  resetProjectForm();
  setStatus("Form direset.");
});

bootstrap();
