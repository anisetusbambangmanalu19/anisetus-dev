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
This portfolio now supports admin-based project management with image upload.

### 1) Create Supabase Project
- Create a project on Supabase.
- Open SQL Editor and run `supabase-setup.sql`.

### 2) Create Admin User
- Go to Authentication -> Users.
- Create one user (email + password) for admin login.

### 3) Configure Frontend
- Open `supabase-config.js`.
- Fill `url` and `anonKey` from Project Settings -> API.

### 4) Use Admin Dashboard
- Open `admin.html`.
- Login with your admin user.
- Add/edit/delete projects.
- Upload a cover image and multiple gallery images.

### 5) Public Portfolio
- `index.html` will automatically load published projects from Supabase table `projects`.
- If Supabase config is empty, it falls back to GitHub repositories.
