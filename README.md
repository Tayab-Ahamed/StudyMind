# 📚 StudyMind v2 — AI Study Assistant

A production-ready full-stack study assistant with authentication, MongoDB persistence,
AI-powered summaries, and a real-time Q&A chat interface.

---

## 🗂 Folder Structure

```
studymind/
├── backend/
│   ├── middleware/
│   │   └── auth.js             # JWT verification middleware
│   ├── models/
│   │   ├── User.js             # User schema (bcrypt hashed passwords)
│   │   ├── Note.js             # Note schema (text, summary, metadata)
│   │   └── ChatSession.js      # Chat session + embedded messages
│   ├── routes/
│   │   ├── auth.js             # POST /register, POST /login, GET /me
│   │   ├── notes.js            # Upload, summarize, list, delete
│   │   └── chat.js             # Sessions, messages, history
│   ├── utils/
│   │   └── db.js               # MongoDB connection
│   ├── server.js               # Express entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── public/index.html
│   └── src/
│       ├── components/
│       │   ├── chat/
│       │   │   └── ChatPanel.jsx      # Q&A chat UI with suggestions
│       │   ├── layout/
│       │   │   ├── Sidebar.jsx        # Notes list, upload, search
│       │   │   └── TopBar.jsx         # Breadcrumb, dark mode, user menu
│       │   ├── notes/
│       │   │   └── SummaryPanel.jsx   # AI summary with skeleton loader
│       │   └── ui/
│       │       └── index.jsx          # Spinner, Alert, EmptyState, Skeletons
│       ├── context/
│       │   ├── AuthContext.jsx        # Global auth state + JWT storage
│       │   └── ThemeContext.jsx       # Dark/light mode with persistence
│       ├── hooks/
│       │   ├── useNotes.js            # Notes CRUD state management
│       │   └── useChat.js             # Chat session + message state
│       ├── pages/
│       │   ├── AuthPages.jsx          # Login + Signup forms
│       │   └── DashboardPage.jsx      # Main app layout
│       ├── utils/
│       │   └── api.js                 # Axios client with JWT interceptors
│       ├── App.jsx                    # Router + protected routes
│       ├── index.js
│       └── index.css                  # Tailwind + design system tokens
│
└── README.md
```

---

## ⚡ Setup (3 terminals)

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Anthropic API key → https://console.anthropic.com

---

### Step 1 — MongoDB

**Option A: Local MongoDB**
```bash
# macOS
brew tap mongodb/brew && brew install mongodb-community
brew services start mongodb-community

# Ubuntu
sudo apt install mongodb
sudo systemctl start mongodb

# Windows — download from https://www.mongodb.com/try/download/community
```

**Option B: MongoDB Atlas (free cloud)**
1. Create account at https://www.mongodb.com/atlas
2. Create a free cluster
3. Click "Connect" → "Drivers" → copy the connection string
4. Replace `<password>` with your DB user password

---

### Step 2 — Backend

```bash
cd studymind/backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
MONGODB_URI=mongodb://localhost:27017/studymind
JWT_SECRET=supersecretlongstringchangeme123456
JWT_EXPIRES_IN=7d
PORT=5000
FRONTEND_URL=http://localhost:3000
```

```bash
npm run dev        # → http://localhost:5000
```

You should see:
```
🚀 StudyMind backend → http://localhost:5000
✅ MongoDB connected: localhost
```

---

### Step 3 — Frontend

Open a new terminal:
```bash
cd studymind/frontend
npm install
npm start          # → http://localhost:3000
```

Open **http://localhost:3000** in your browser.

> **Important:** Always use `npm start` in the `frontend/` folder.  
> Do NOT open `index.html` directly — the proxy to the backend won't work.

---

## 🔧 Fixing Upload Issues

If files won't upload, check these in order:

1. **Backend running?** Open http://localhost:5000/api/health — should return `{"status":"OK"}`
2. **Using npm start?** The `/api` proxy only works via CRA dev server, not VS Code Live Server
3. **CORS error?** Make sure `FRONTEND_URL=http://localhost:3000` in your `.env`
4. **PDF parse error?** Password-protected PDFs can't be parsed — try a plain PDF
5. **Network tab** in browser DevTools → check the actual error message from the API

---

## 🚀 Features

| Feature | Details |
|---|---|
| 🔐 Auth | Register/login with JWT, bcrypt password hashing |
| 📎 Upload | Drag-and-drop PDF or .txt, up to 10 MB |
| ✨ Summary | AI-powered structured summary (cached in MongoDB) |
| 💬 Chat | Multi-turn Q&A with full history saved to DB |
| 🌙 Dark mode | System-aware, persisted to localStorage |
| 🔍 Search | Filter notes by name in sidebar |
| 🗑 Delete | Removes note and all linked chat sessions |

---

## 🌐 API Reference

All routes (except auth) require `Authorization: Bearer <token>` header.

### Auth
| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/api/auth/register` | `{name, email, password}` | Create account |
| POST | `/api/auth/login` | `{email, password}` | Get JWT token |
| GET  | `/api/auth/me` | — | Get current user |

### Notes
| Method | Endpoint | Description |
|---|---|---|
| POST   | `/api/notes/upload` | Upload file (multipart, field: `file`) |
| GET    | `/api/notes` | List your notes |
| POST   | `/api/notes/:id/summarize` | Generate/return AI summary |
| DELETE | `/api/notes/:id` | Delete note + sessions |

### Chat
| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/api/chat/session` | `{noteId}` | Create session |
| POST | `/api/chat/:id/message` | `{message}` | Send message |
| GET  | `/api/chat/:id/history` | — | Get messages |
| GET  | `/api/chat/sessions/:noteId` | — | All sessions for note |
| DELETE | `/api/chat/:id` | — | Delete session |

---

## 🏗 Production Deployment

### Build frontend
```bash
cd frontend && npm run build
```

### Serve with Express
Add to `backend/server.js`:
```js
const path = require("path");
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"))
);
```

### Environment for production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/studymind
JWT_SECRET=<long-random-string-from-openssl-rand>
FRONTEND_URL=https://yourdomain.com
```

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Tailwind CSS |
| Backend | Node.js, Express 4 |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| AI | Anthropic Claude Sonnet 4 |
| File parsing | multer + pdf-parse |
