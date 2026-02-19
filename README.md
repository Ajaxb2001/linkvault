# 🔗 LinkVault — Smart Bookmark Manager (Case Study)

LinkVault is a modern bookmark management application built with **Next.js, Supabase, and Google OAuth**, deployed on **Vercel**.  
This project demonstrates **real-world authentication, deployment, and debugging experience**, not just UI.

🚀 Live Demo: https://linkvault-3hyqj1jnp-ajaxb2001s-projects.vercel.app  
📂 GitHub Repo: https://github.com/Ajaxb2001/linkvault

---

## 📌 What This Project Does

- Allows users to **sign in using Google OAuth**
- Securely manages user sessions using Supabase
- Provides a protected dashboard after login
- Uses modern UI with a professional aesthetic
- Fully deployed and production-ready

No passwords are stored. Authentication is handled entirely via OAuth.

---

## 🛠 Tech Stack

**Frontend**
- Next.js (App Router)
- React
- TypeScript
- Custom CSS + Google Fonts

**Backend / Services**
- Supabase (Auth + PostgreSQL)
- Google OAuth (via Supabase)

**Deployment**
- Vercel

---

## 🧱 Application Structure (High Level)

- `app/page.tsx` → Login page (Google OAuth)
- `app/auth/callback/route.ts` → OAuth callback handler
- `app/dashboard/page.tsx` → Protected dashboard
- `lib/supabase.ts` → Supabase client setup

---

## 🔐 Authentication Flow (End-to-End)

1. User clicks **Continue with Google**
2. Redirected to Google OAuth
3. Google redirects to Supabase callback
4. Supabase validates the session
5. User is redirected to `/dashboard`
6. Dashboard loads only for authenticated users

---

## 🚧 Problems Faced & How I Solved Them

This project intentionally documents real issues faced during deployment and how they were resolved.

---

### ❌ Problem 1: OAuth redirecting to `localhost:3000` in production

**Issue**  
After deploying to Vercel, Google login redirected to:


**Root Cause**  
Supabase `Site URL` was still set to `http://localhost:3000`

**Fix**
- Supabase Dashboard → Authentication → URL Configuration
- Updated:
  - **Site URL** → Vercel production URL
  - Added production URL under **Redirect URLs**

✅ OAuth redirect worked correctly in production

---

### ❌ Problem 2: Vercel login page appearing after Google OAuth

**Issue**  
After Google login, the app redirected to a **Vercel login screen** instead of the app.

**Root Cause**
- Vercel **Deployment Protection** was enabled
- OAuth redirect was blocked by Vercel authentication

**Fix**
- Disabled Deployment Protection for production
- Redeployed application

✅ OAuth flow completed successfully

---

### ❌ Problem 3: Supabase build error during deployment

**Error**

**Root Cause**
- Supabase client was being initialized during static prerendering
- Environment variables were missing in Vercel

**Fix**
- Added environment variables in Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Forced dashboard to be dynamic:
```ts
export const dynamic = 'force-dynamic'
