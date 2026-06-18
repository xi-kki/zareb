# Nuri — AI Compliance Document Checker

**Know your compliance gaps before the auditor does.**

Nuri reads your HACCP plans, ingredient lists, and food labels — then tells you exactly what's missing for EU/UK export approval.

Built for food manufacturers, restaurant chains, and packaged food brands in Africa (Lagos, Accra, Nairobi) exporting to European markets.

## Tech Stack

### Frontend
- React 18 + TypeScript + Vite
- Tailwind CSS (mobile-first, low-bandwidth)
- React Dropzone + React Query
- Deployed on **Vercel**

### Backend
- FastAPI (Python)
- PostgreSQL (Railway free tier)
- SQLAlchemy + Alembic
- Anthropic Claude API
- JWT authentication
- Deployed on **Railway**

### Storage
- Cloudinary (free tier) for document files

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (or use Railway)

### Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your API keys
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API docs.

## Project Structure

```
nuri/
├── backend/          # FastAPI application
│   ├── app/
│   │   ├── api/      # Route handlers
│   │   ├── models/   # SQLAlchemy models
│   │   ├── services/ # Business logic
│   │   └── core/     # Config, DB, security
│   └── main.py
├── frontend/         # React SPA
│   └── src/
│       ├── pages/    # Route pages
│       ├── components/ # Reusable components
│       └── api/      # API client
└── README.md
```

## Success Criteria

- ✅ User can register and login
- ✅ User can upload a PDF document
- ✅ Nuri analyzes it against a chosen standard
- ✅ Report shows score, critical gaps, recommendations
- ✅ User can ask Nuri follow-up questions
- ✅ Frontend deployed on Vercel
- ✅ Backend deployed on Railway
- ✅ All pages mobile-responsive
- ✅ No console errors in production

## License

MIT
