# 🚀 NXT Notes

**Your Next-Generation Cloud Note-Taking Experience.**

NXT Notes is a highly customizable, enterprise-level, cloud-synced note-taking application inspired by Google Keep & Notion. Built with modern web technologies, it features a stunning Glassmorphism UI, advanced theming, rich text formatting, and seamless cloud synchronization.

🔗 **Live Demo:** [nxt-notes.vercel.app](https://nxt-notes.vercel.app/)

---

## ✨ Key Features

### 🎨 Advanced UI/UX & Theming
- **Glassmorphism Design:** Beautiful translucent UI elements with blur effects.
- **Global App Themes:** Choose from pre-defined gradients or pick any custom solid color for the entire app background.
- **Note-Level Customization:** Change individual note background colors, text colors, or even upload custom background images!
- **Dynamic Note Shapes:** Break the grid! Choose from unique note shapes like *Torn Paper*, *Leaf*, *Cut Corner*, *Circle*, and more.
- **22+ Typography Options:** A rich library of Google Fonts with a live hover-preview feature.

### ⚡ Powerful Functionality
- **Smart Checklists (To-Do):** Convert standard notes into interactive checklists with a single click.
- **Auto-Save & Version History:** Never lose your data. Click outside to auto-save, and easily restore older versions of your notes using *Edit History*.
- **Undo & Redo:** Full action tracking while creating or editing notes.
- **Image Support:** Upload images to your notes with built-in client-side image compression (saving bandwidth & storage).
- **Smart Label System:** Create, assign, and manage tags dynamically. Includes a global label management setting.
- **Archive & Trash Management:** Keep your workspace clean. Soft-delete notes to Trash or hide them in the Archive folder.

### ☁️ Cloud & Security
- **Secure Authentication:** User signup & login powered by Supabase Auth.
- **Real-Time Database Sync:** All notes are securely saved in PostgreSQL and synced instantly.
- **Row Level Security (RLS):** Military-grade database rules ensure your notes are strictly private.

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite), Tailwind CSS v4
- **Backend as a Service (BaaS):** Supabase (PostgreSQL, Authentication, Storage)
- **Utilities:** `browser-image-compression` for optimizing uploads
- **Deployment:** Vercel

---

## 🚀 Getting Started (Run Locally)

Want to run this project on your local machine? Follow these simple steps:

### 1. Clone the repository
```bash
git clone https://github.com/your-username/nxt-notes.git
cd nxt-notes

2. Install dependencies

npm install

3. Set up Environment Variables

Create a .env file in the root directory and add your Supabase credentials:

VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

4. Start the development server

npm run dev

👨‍💻 Author

Built with ❤️ by @krishnakumarmishra1


