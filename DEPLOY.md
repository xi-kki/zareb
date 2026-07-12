# Zareb Deployment Guide

## Current Status
- ✅ Backend code complete (19 API routes, all tested locally)
- ✅ Frontend deployed on Netlify: https://zareb.netlify.app
- ✅ All features built (OCR, Magic Link, PDF Reports, RAG, Admin, PWA)
- ❌ Backend not deployed (Railway auto-deploy broken, GitHub auth expired)

## To Deploy (5 min)

### Step 1: Fix GitHub Auth
```bash
gh auth refresh -h github.com
# Follow browser prompt to re-authenticate
```

### Step 2: Push Latest Code
```bash
cd C:/Users/HP/Zareb
git push origin master
```

### Step 3: Deploy Backend to Render
1. Go to https://render.com → Sign up/Log in
2. Click **New +** → **Web Service**
3. Connect GitHub repo: `xi-kki/zareb`
4. Settings:
   - **Name:** `zareb-api`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables:
   - `DATABASE_URL` = `sqlite:///./zareb.db`
   - `GROQ_API_KEY` = (from .env)
   - `JWT_SECRET` = (generate random 32-char string)
   - `CORS_ORIGINS` = `https://zareb.netlify.app`
   - `AI_PROVIDER` = `groq`
   - `DEBUG` = `false`
6. Click **Create Web Service**
7. Wait for deploy → copy the URL (e.g., `https://zareb-api.onrender.com`)

### Step 4: Update Frontend to Point to Backend
```bash
cd C:/Users/HP/Zareb/frontend
# Create .env.production
echo "VITE_API_URL=https://zareb-api.onrender.com" > .env.production
git add .env.production
git commit -m "chore: point frontend to Render backend"
git push origin master
```

Netlify will auto-redeploy the frontend.

### Step 5: Test
1. Go to https://zareb.netlify.app
2. Register a new account
3. Upload a document
4. Run compliance analysis
5. Check report generation

## What's Built (100%)

### Backend (19 routes)
- Auth: register, login, magic link, profile
- Documents: upload, list, delete
- Analysis: AI compliance check
- Reports: view, PDF download, list
- Chat: SSE streaming
- Checklists: templates, progress, save
- Knowledge: RAG search, stats
- Admin: stats, users, health

### Frontend (11 pages)
- Landing, Login, Register
- Dashboard, Upload, Report
- Chat, Checklists, Settings
- Admin, VerifyMagicLink

### Features
- ✅ Image OCR (Groq Vision)
- ✅ Magic Link Auth (passwordless)
- ✅ PDF Reports (fpdf2)
- ✅ RAG Knowledge Base (TF-IDF)
- ✅ PWA (installable)
- ✅ Camera Scanner
- ✅ Apple Design System
- ✅ Security Hardening

## Optional Phase 3 (Not Required for Launch)
- [ ] Paystack payments (freemium model)
- [ ] Email delivery (SendGrid)
- [ ] CAPTCHA on register
- [ ] Multi-language support
