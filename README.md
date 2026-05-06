# TaskFlow — Task Tracker App

A full-stack task tracking mobile app built with **React Native (Expo)**, **Node.js/Express**, and **MongoDB**, submitted for the RoundTechSquare Full Stack Developer Internship assignment.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile (Frontend) | React Native · Expo · TypeScript |
| State & Data Fetching | TanStack Query (React Query) |
| Auth State | Zustand + AsyncStorage (persisted) |
| Backend | Node.js · Express.js · TypeScript |
| Database | MongoDB · Mongoose |
| Auth | JWT (JSON Web Tokens) · bcryptjs |

---

## Features

### Core
- ✅ Signup & Login with JWT authentication
- ✅ Persistent login session (token stored on device)
- ✅ Create, view, complete, and delete tasks
- ✅ Pull-to-refresh
- ✅ Loading states (ActivityIndicator)
- ✅ Error states with Retry button
- ✅ Empty state messages

### Bonus
- ✅ **Edit task** (tap pencil icon on any task)
- ✅ **Filter tasks** — All / Pending / Completed tabs
- ✅ **Optimistic updates** (instant UI feedback before server responds)
- ✅ Progress ring showing completion percentage

---

## Project Structure

```
Task_tracker_app/
├── backend/               # Node.js + Express API
│   └── src/
│       ├── controllers/   # authController, taskController
│       ├── middleware/    # JWT auth, error handler
│       ├── models/        # User.ts, Task.ts (Mongoose schemas)
│       ├── routes/        # auth.ts, tasks.ts
│       └── index.ts       # Express app entry
│
└── mobile/                # React Native (Expo) app
    ├── app/
    │   ├── (auth)/        # Login & Signup screens
    │   ├── (main)/        # Dashboard & Task modal
    │   └── index.tsx      # Splash / auth redirect
    ├── components/        # GlassCard, NeonButton, TaskCard
    ├── constants/         # Theme.ts
    ├── hooks/             # useTasks.ts (TanStack Query hooks)
    ├── store/             # useStore.ts (Zustand — auth state)
    └── config/            # api.ts (platform-aware API URL)
```

---

## Setup & Running

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas URI)
- Expo Go app on your phone (iOS or Android)

---

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Task_tracker_app
```

---

### 2. Run the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/tasktracker
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

Start the backend:

```bash
npm run dev
```

The API will be live at `http://localhost:3000`.

---

### 3. Run the Mobile App

```bash
cd mobile
npm install
```

Create a `.env` file in the `mobile/` directory:

```env
EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP>:3000
```

> **Find your local IP:**
> - Windows: run `ipconfig` → look for **IPv4 Address**
> - Mac/Linux: run `ifconfig` → look for `inet` under your Wi-Fi adapter

Start the Expo dev server:

```bash
npx expo start --clear
```

Scan the QR code with the **Expo Go** app on your phone.
> Make sure your phone and computer are on the **same Wi-Fi network**.

---

## API Reference

### Auth

| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/auth/signup` | `{ name, email, password }` | Register a new user |
| POST | `/auth/login` | `{ email, password }` | Login and receive JWT |

### Tasks (All require `Authorization: Bearer <token>` header)

| Method | Endpoint | Body | Description |
|---|---|---|---|
| GET | `/tasks` | — | Get all tasks for logged-in user |
| GET | `/tasks?filter=completed` | — | Filter by status |
| POST | `/tasks` | `{ title, description? }` | Create a task |
| PATCH | `/tasks/:id` | `{ title?, description?, completed? }` | Update a task |
| DELETE | `/tasks/:id` | — | Delete a task |

---

## Architecture Decisions

### TanStack Query for all task operations
All task fetching and mutations go through TanStack Query hooks (`hooks/useTasks.ts`). This gives us:
- Automatic caching and background refetching
- Optimistic updates (instant UI before server confirms)
- Built-in loading and error states

### Zustand for auth state only
Auth state (user, token) is managed by Zustand with AsyncStorage persistence, which survives app restarts without requiring the user to log in again.

### Platform-aware API URL
`config/api.ts` detects the platform:
- **Web** → always `http://localhost:3000`
- **Native (physical device)** → uses `EXPO_PUBLIC_API_URL` from `.env`
- **Android Emulator** → uses `http://10.0.2.2:3000`

---

## Demo Video

https://drive.google.com/file/d/1Kgt-exKAVj1Q0KgBk4kxfw3WnoTr5dnz/view?usp=sharing

---

## Author

**Arnav Bhandari**
