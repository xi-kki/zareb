# 🍃 Zareb — AI Compliance Document Checker

**Know your compliance gaps before the auditor does.**

[![Groq](https://img.shields.io/badge/AI-Groq_free-10a54a?logo=groq)](https://groq.com)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?logo=react)](https://react.dev)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000?logo=vercel)](https://zareb.vercel.app)
[![CI](https://github.com/xi-kki/zareb/actions/workflows/ci.yml/badge.svg)](https://github.com/xi-kki/zareb/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Zareb reads your **HACCP plans, ingredient lists, product labels, and audit reports** — then tells you exactly what's missing for **EU/UK export approval**.

> 🎯 Built for food manufacturers, restaurant chains, and packaged food brands in **Africa** (Lagos, Accra, Nairobi) exporting to European markets.

---

## 📍 Deployment notes
| | |
|---|---|
| **User** | Food manufacturers in Lagos, Accra and Nairobi preparing EU/UK export files |
| **Problem** | Compliance gaps (allergens, traceability, NAFDAC→EU differences) surface only at audit, which is costly and slow |
| **What I shipped** | Upload a PDF/DOCX → extract text → LLM checks it against 8 standards → scored report with Critical/Moderate/Minor gaps and copy-paste fix text → chat over the report |
| **Stack** | FastAPI · React/Vite · Groq (llama-3.3-70b) · Postgres · Cloudinary · CI via GitHub Actions |
| **Live** | https://zareb.vercel.app |

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📄 **Smart Upload** | Drag-and-drop PDF/DOCX files up to 10MB |
| 🤖 **AI Analysis** | Groq-powered compliance check against 8 standards |
| 📊 **Interactive Reports** | Score gauge, categorized gaps, copy-paste fixes |
| 💬 **AI Chat** | Ask follow-up questions about your reports |
| ✅ **Compliance Checklists** | Track progress for each standard with auto-save |
| 🌍 **Africa→EU/UK Focus** | Catches NAFDAC-to-EU gaps, allergen rules, traceability |

### Supported Standards
HACCP · FSMA · SQF · BRCGS · ISO 22000 · NAFDAC (Nigeria) · KEBS (Kenya) · EU Reg. 178/2002 (General Food Law) · EU Reg. 1169/2011 (food labelling)

---

## 🏗️ Architecture

```
┌──────────────┐     HTTP/JSON      ┌──────────────┐     ┌──────────────┐
│   Frontend   │ ──────────────────▶ │   Backend    │ ──▶ │  PostgreSQL  │
│  React + Vite│ ◀────────────────── │  FastAPI     │     │  (Neon)      │
│  (Vercel)    │    SSE streaming    │  (Vercel fn) │     └──────────────┘
└──────────────┘                     └──────┬───────┘
                                            │
                                     ┌──────▼───────┐
                                     │  Groq AI API  │
                                     │  (Free Tier)  │
                                     └──────────────┘
```

### Data Flow
1. **Register/Login** → JWT token stored in browser
2. **Upload PDF** → Backend extracts text (PyPDF2/python-docx), stores in Cloudinary
3. **Analyze** → Backend sends extracted text to Groq AI → receives structured JSON
4. **View Report** → Score gauge, categorized gaps (Critical/Moderate/Minor), fix suggestions
5. **Chat** → SSE streaming from AI with report context loaded

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- [Groq API key](https://console.groq.com) (free — no credit card)

### 1. Backend Setup

```bash
# backend lives at the repo root (main.py + app/)
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
pip install -r requirements.txt
uvicorn main:app --reload
```

The API will be available at **http://localhost:8000** with interactive docs at **http://localhost:8000/docs**.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🗄️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `AI_PROVIDER` | `groq` | AI provider: `groq` (free) or `claude` |
| `GROQ_API_KEY` | — | Your free key from [console.groq.com](https://console.groq.com) |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Groq model for analysis |
| `DATABASE_URL` | `sqlite:///./zareb.db` | Postgres for production (e.g. Neon) |
| `JWT_SECRET` | — | Random 32+ char string for auth |
| `CLOUDINARY_*` | — | For document file storage |
| `CORS_ORIGINS` | `http://localhost:5173` | Frontend URLs allowed |

---

## 📁 Project Structure

```
zareb/
├── main.py                # FastAPI entry point + lifespan
├── app/                   # Backend application
│   ├── api/               # Route handlers (auth, docs, analysis, chat, checklists)
│   ├── models/            # SQLAlchemy models (User, Document, Report, Checklist)
│   ├── services/          # AI service (Groq/Claude), Cloudinary, document parser
│   └── core/              # Config, database, security (JWT)
├── api/index.py           # Vercel serverless entry for the backend
├── tests/                 # pytest suite (auth, checklists, health, validation)
├── frontend/              # React + Vite SPA
│   └── src/               # pages, components, api client
├── .github/workflows/ci.yml
├── requirements.txt
└── vercel.json
```

---

## 🧪 What Makes Zareb an AI Agent?

| Capability | How It Works |
|------------|-------------|
| **Document Understanding** | Extracts text from PDFs/DOCX → sends to Groq LLM |
| **Domain Expertise** | System prompt contains HACCP/FSMA/BRCGS/NAFDAC knowledge |
| **Structured Reasoning** | AI returns JSON: score (0-100), gaps, critical issues, fixes |
| **Actionable Output** | "Copy fix language" buttons with AI-generated template text |
| **Contextual Chat** | SSE streaming with full report context loaded |
| **Multi-Standard** | One document analyzed against 8 different standards |

---

## 🚢 Deployment

- **Frontend** → Vercel (project root `frontend/`), live at https://zareb.vercel.app
- **Backend** → FastAPI as a Vercel Python function (`api/index.py`, see `vercel.json`)
- **Env vars** → `GROQ_API_KEY`, `DATABASE_URL` (Postgres, e.g. Neon pooled URL), `JWT_SECRET`, Cloudinary keys; full list in `.env.example`

## 🧪 Testing

```bash
pip install -r requirements.txt
pytest            # 23 tests: auth, checklists, health, input validation
```

CI (`.github/workflows/ci.yml`) runs on every push: frontend lint, format check and build; backend flake8 and an import smoke test; a secrets scan.
---

## 🧑‍🍳 For African Food Founders

Zareb catches the **top 7 Africa→EU/UK export gaps**:

1. ❌ **Allergen labeling** — EU requires 14 major allergens declared
2. ❌ **Nutritional table** — Per 100g values mandatory in EU
3. ❌ **Country of origin** — Must be declared on packaging
4. ❌ **Best before vs use by** — EU has strict distinction rules
5. ❌ **Additive E-numbers** — Must use EU-approved additives
6. ❌ **Traceability lot codes** — Required on all packaging
7. ❌ **EU responsible person** — Required post-Brexit for UK exports

---

## 📄 License

MIT — Built for African food founders by [Xi-kki](https://github.com/Xi-kki).
# Sun Jul 12 20:31:53 WCAST 2026
# Sun Jul 12 22:06:23 WCAST 2026
