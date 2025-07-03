# SnapLinear

> Convert your meeting recordings or transcripts into actionable Linear issues & comments — powered by AI.

## Table of Contents

- [🎯 What is SnapLinear?](#-what-is-snaplinear)
- [✨ Features](#-features)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running Locally](#running-locally)
- [🛠️ Usage](#️-usage)
- [🤝 Contributing](#-contributing)

---

## 🎯 What is SnapLinear?

SnapLinear is an open-source tool that listens to your meetings (via audio upload or transcript) and automatically suggests well-scoped issues or comments in [Linear](https://linear.app). Skip the copy-paste — review AI-generated tasks and push them straight into your workflow.

## ✨ Features

- 🎙 Audio & transcript upload
- 🤖 AI-powered transcription (via AssemblyAI)
- 📋 Automatic action-item extraction
- 🔄 Native Linear integration via Linear MCP server (create issues or comments)
- ✔️ Approve or reject suggestions
- ⚡️ Lightweight, configurable front-end (React + Vite) & back-end (Node.js + Hono)

## 🚀 Getting Started

### Prerequisites

- Node.js v14+
- A [Linear](https://linear.app) account
- (Optional) [ngrok](https://ngrok.com/) for testing audio recording locally

### Installation

1. **Clone the repo**

   ```bash
   git clone https://github.com/buildwithlayer/SnapLinear.git
   cd SnapLinear
   ```

2. **Install dependencies**
   ```bash
   npm install        # root
   cd client && npm install
   ```

### Configuration

Copy the example env files and fill in your keys:

- Root `.env` (at project root):

  ```ini
  ASSEMBLYAI_API_KEY=          # API key for Assembly AI
  OPENAI_API_KEY=             # API key for OpenAI
  ```

- Client `.env` (in `/client`):
  ```ini
  VITE_API_URL=http://localhost:3001
  VITE_CALLBACK_URL=http://localhost:5173/oauth/callback
  ```

> **If testing OAuth with ngrok:**
>
> 1. `ngrok http 5173`
> 2. Update `VITE_CALLBACK_URL` to your ngrok URL (`https://xxxxx.ngrok.io/oauth/callback`)
> 3. Add that same URL to `server.allowedHosts` in `client/vite.config.ts`

### Running Locally

From the root directory:

```bash
npm run dev:all
```

- ✅ Starts the back-end on `http://localhost:3001`
- ✅ Starts the front-end on `http://localhost:5173`

---

## 🛠️ Usage

1. **Upload** an audio file or transcript OR **Record** audio directly from the site.
2. **Transcribe** (if audio).
3. **Review** AI-generated action items.
4. **Approve**, then **send** to your Linear workspace.

---

## 🤝 Contributing

We welcome contributions!

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/foo`)
3. Commit your changes (`git commit -m "feat: add foo"`)
4. Push to your branch (`git push origin feature/foo`)
5. Open a Pull Request
