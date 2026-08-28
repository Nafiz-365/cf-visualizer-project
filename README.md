<div align="center">
  <br />
  <h1>🚀 CF Visualizer</h1>
  <p>
    <strong>Advanced Codeforces Analytics and AI Coaching Platform</strong>
  </p>
  <p>
    <a href="#overview">Overview</a> •
    <a href="#features">Features</a> •
    <a href="#architecture--tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#development-workflow">Development</a>
  </p>
  
  <p>
    <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Express-4.21-000000?style=flat-square&logo=express" alt="Express" />
    <img src="https://img.shields.io/badge/Vite-6.x-646CFF?style=flat-square&logo=vite" alt="Vite" />
    <img src="https://img.shields.io/badge/SQLite-WAL-003B57?style=flat-square&logo=sqlite" alt="SQLite" />
  </p>
</div>

---

## 📖 Overview

**CF Visualizer** is a high-performance, full-stack web application built to help competitive programmers analyze their Codeforces profiles, uncover weaknesses, compare statistics with peers, and receive personalized guidance from an AI Coach.

Unlike standard visualizers that simply display raw data, this platform acts as an intelligent proxy wrapper around the Codeforces API. It introduces advanced caching to bypass rate limits, persists user data via SQLite, and leverages Large Language Models (LLMs) to transform static metrics into actionable coaching advice.

---

## ✨ Core Features

### 🧠 AI-Driven Coaching

- **Interactive Chat Coach:** Conversational AI mentor utilizing `gemini-2.5-flash` or `gpt-4o-mini` to explain algorithms and debug competitive programming concepts.
- **Weakness Analysis:** Deep analysis of submission history and tags to identify algorithmic weak points.
- **Contest Debriefs:** Automated post-contest performance reviews.
- **Client-Side Caching:** Intelligent `localStorage` caching of LLM responses to optimize API credit consumption.

### 📊 Advanced Analytics

- **Categorized Dashboard:** Modular insights separated into Overview, Analytics, Prep, Social, and Submissions.
- **Activity Heatmaps:** GitHub-style contribution graphs for daily problem-solving and contest participation.
- **Visualizations:** Comprehensive charting including Verdict distributions, Problem Level (A/B/C/D) statistics, and Rating History timelines.
- **Radar Strength Mapping:** Multivariate radar charts mapping proficiency across algorithmic domains (e.g., Dynamic Programming, Graph Theory).

### 👥 Social & Comparative Tools

- **Profile Comparisons:** Side-by-side metric comparisons between multiple Codeforces handles.
- **Custom Leaderboards:** Localized, dynamic leaderboards for tracking peer progress.
- **Exportable Social Cards:** High-resolution PNG generation of profile summaries for social media sharing.

### 🛠️ Productivity & Tracking

- **Bookmarks & Notes:** Bookmark tricky problems and save personal markdown notes (e.g., "Use Segment Tree here").
- **Unsolved Tracker:** Automatically tracks problems you've attempted but haven't solved yet (your 'upsolve' list).
- **Recent Searches:** Lightning-fast access to recently searched handles via local storage.

---

## 💻 Architecture & Tech Stack

### Frontend

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4, shadcn/ui
- **Animations & 3D:** Framer Motion, Three.js
- **Data Visualization:** Recharts
- **State & Theming:** React Context API (Supports persistent Dark/Light mode)
- **Routing:** React Router v7

### Backend

- **Server:** Node.js, Express.js
- **Database:** SQLite3 (running in high-performance Write-Ahead Logging mode)
- **Authentication:** JWT (HttpOnly Cookies), bcryptjs
- **AI Integrations:** `@google/genai`, OpenRouter (Axios)

### System Architecture

1. **Intelligent API Proxy:** The Express server proxies all requests to Codeforces. It implements a bounded LRU memory cache and enforces a minimum 250ms interval between upstream requests, completely preventing `429 Too Many Requests` errors.
2. **Offline Fallback Mechanisms:** Robust mock data generators (`fallbackData.ts`) ensure the UI remains testable even during Codeforces API outages.
3. **Monorepo Workflow:** Express utilizes Vite's middleware to serve the React app with HMR during development, and statically serves the compiled `dist/` folder in production.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### Installation

1. **Clone the repository**

    ```bash
    git clone <repository-url>
    cd cf-visualizer-project
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Configure environment variables**
    ```bash
    cp .env.example .env
    ```
    _Edit `.env` to include your specific configurations:_
    ```env
    PORT=3000
    JWT_SECRET=your_jwt_secret
    GEMINI_API_KEY=your_gemini_api_key
    # OPENROUTER_API_KEY=your_openrouter_key
    ```
    _\*Note: You must provide either a Gemini or OpenRouter API key for AI features to function._

---

## 🛠️ Development Workflow

We have tailored development scripts depending on your role to optimize startup times.

| Command           | Description                                                                      | Target Role |
| :---------------- | :------------------------------------------------------------------------------- | :---------- |
| `npm run dev`     | Starts Express server with Vite injected as middleware (runs both on port 3000). | Full Stack  |
| `npm run dev:ui`  | Starts standalone Vite server on port 5173 with proxy to backend.                | Frontend    |
| `npm run dev:api` | Starts Express API instantly on port 3000, bypassing Vite compilation.           | Backend     |
| `npm run build`   | Compiles React and Express into optimized production assets inside `dist/`.      | DevOps      |
| `npm run start`   | Runs the compiled production server.                                             | Production  |

---

## 🔐 API & Security Documentation

- **JWT via HttpOnly Cookies:** Upon login, the server issues a JWT stored in an `HttpOnly` cookie to prevent XSS attacks.
- **Password Hashing:** Passwords are encrypted using `bcryptjs` before being stored in SQLite.
- **Route Protection:** Protected API endpoints utilize a `verifyToken` middleware.

**Key API Routes:**

- `GET /api/codeforces/:method` - Proxies Codeforces API with rate-limiting and caching.
- `POST /api/ai/generate` - Communicates with Gemini/OpenRouter LLMs.
- `POST /api/auth/*` - Handles Register, Login, Logout, and Validation.
- `GET/POST /api/friends/:handle` - Manages friend relationships.
- `GET/POST /api/bookmarks` - Manages saved problems and personal notes.

---

## 📂 Project Structure

```text
cf-visualizer/
├── src/
│   ├── components/       # Reusable UI components (Charts, Dashboard, AI Coaches)
│   ├── contexts/         # React Context providers (AuthContext, ThemeContext)
│   ├── lib/              # Utilities, mock fallbacks, and AI configurations
│   ├── services/         # API wrappers (Codeforces REST wrappers, Gemini Service)
│   ├── App.tsx           # Application root and React Router definitions
│   └── main.tsx          # React DOM entry point
├── server.ts             # Express backend entry point and API routes
├── database.sqlite       # Local SQLite database (Auto-generated)
├── vite.config.ts        # Vite build & proxy configuration
└── tailwind.config.ts    # Tailwind design system tokens
```

---

<div align="center">
  <p>Designed and built for the Competitive Programming community 💡</p>
</div>
