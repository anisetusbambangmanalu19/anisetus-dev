# Personal Portfolio - Anisetus Bambang Manalu

Portfolio website built with HTML, CSS, and JavaScript. This project is ready for free deployment with GitHub Pages.

## Tech Stack
- HTML5
- CSS3
- Vanilla JavaScript
- GitHub Actions (auto deploy)

## Local Preview
Open `index.html` directly in browser, or use a simple local server.

### Run Locally (Windows PowerShell)
1. Open terminal in project folder.
2. Run this command:

```powershell
python -m http.server 5500
```

3. Open browser:
`http://localhost:5500`

## Supabase Admin Setup
This portfolio now supports mini-CMS features: profile content editing, project CRUD, and project gallery images.

### 1) Create Supabase Project
- Create a project on Supabase.
- Open SQL Editor and run `supabase-setup.sql`.

### 2) Enable GitHub OAuth in Supabase
- Go to Authentication -> Sign In / Providers -> GitHub.
- Fill GitHub OAuth App Client ID and Client Secret.
- Save provider settings.

### 3) Configure Frontend
- Open `supabase-config.js`.
- Fill `url` and `anonKey` from Project Settings -> API.

### 4) Use Admin Dashboard
- Open `admin.html`.
- Login using GitHub OAuth.
- Update profile photo and homepage content (hero, focus, about).
- Add/edit/delete projects.
- Upload cover image and multiple gallery images.
- Delete gallery images from existing projects.

### 5) Public Portfolio
- `index.html` will automatically load published projects from Supabase table `projects`.
- `index.html` will also load profile content from `site_settings`.
- If Supabase config is empty, it falls back to GitHub repositories.
