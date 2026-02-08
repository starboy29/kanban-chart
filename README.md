# 🎓 College Kanban Board

A modern, collaborative task management application designed for students and academic teams. Built with React request.auth != null; (Firebase), and Tailwind CSS.

## ✨ Features

### 📋 Advanced Kanban Board
-   **True Drag & Drop**: Powered by `@dnd-kit` for smooth task management.
-   **Dynamic Columns**: Todo, In Progress, Done.
-   **Optimistic UI**: Instant updates for a snappy experience.

### 👥 Collaborative Workspace
-   **Shared Board**: All authenticated users see and edit the same board in real-time.
-   **Google Authentication**: Secure sign-in via Firebase Auth.
-   **Team-Ready**: ideal for study groups or project teams.

### 📚 Subject Management
-   **Dynamic Subjects**: Create, rename, and delete subjects (e.g., "Physics", "Math").
-   **Color-Coded**: Visual distinction for different topics.
-   **Global Sync**: Rename a subject, and it updates across all tasks instantly.

### 📥 Smart Inbox & Notifications
-   **Actionable Inbox**: See "Urgent", "New (<24h)", and "Recently Completed" tasks.
-   **Urgency Badges**: Red notification badge on the sidebar for urgent tasks.
-   **Filtering**: Quickly clear the clutter and focus on what matters.

### 🎨 Modern UI/UX
-   **Dark/Light Mode**: (System preference or toggle).
-   **Glassmorphism**: Sleek, modern aesthetic.
-   **Responsive**: Works on desktop and tablets.

---

## 🛠️ Tech Stack

-   **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/)
-   **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
-   **Backend**: [Firebase](https://firebase.google.com/) (Firestore & Auth)
-   **DnD**: [@dnd-kit](https://dndkit.com/)
-   **Icons**: Material Symbols Rounded
-   **Routing**: React Router v7

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/clg_kanban.git
cd clg_kanban
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Firebase
1.  Create a project in the [Firebase Console](https://console.firebase.google.com/).
2.  Enable **Firestore Database** and **Authentication** (Google Sign-In).
3.  Create a `.env` file in the root directory:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Run Locally
```bash
npm run dev
```

---

## 🔒 Security Rules (Firestore)

Since this is a **Shared Board** application, the rules allow any logged-in user to access the data.

**Go to Firebase Console -> Firestore -> Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to any logged-in user
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## ☁️ Deployment (Vercel)

This project is optimized for deployment on Vercel.

1.  Push your code to **GitHub**.
2.  Import the project into **Vercel**.
3.  **Framework Preset**: Select **Vite**.
4.  **Environment Variables**: Copy-paste your `.env` keys and values into Vercel settings.
5.  **Deploy!**

**Important**: Add your Vercel domain (e.g., `clg-kanban.vercel.app`) to **Firebase Console -> Authentication -> Settings -> Authorized Domains**.

---

## 📄 License
MIT
