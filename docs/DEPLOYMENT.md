# Deployment Guide for Vercel

This guide outlines step-by-step instructions to deploy the Restaurant Incident Reporting Tool to Vercel.

## 🚀 Deployment Steps

1. **Push to GitHub**:
   Ensure your local repository has been pushed to a public or private GitHub repository:
   ```bash
   git add .
   git commit -m "feat: complete app development"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com) and log in.
   - Click the **"New Project"** button in the dashboard.
   - Under "Import Git Repository", find your repository and click **"Import"**.

3. **Configure Settings**:
   - **Framework Preset**: Vercel will automatically detect **Next.js** and pre-fill the configuration.
   - **Root Directory**: Keep as default (`./` or project root folder).

4. **Add Environment Variables**:
   Under the **Environment Variables** section, copy and paste the following keys and their respective values from your `.env.local` configuration:
   - `NEXT_PUBLIC_SUPABASE_URL` (your public Supabase project endpoint)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (your public anon key for database CRUD access)
   - `GROQ_API_KEY` (your Groq API key for LLaMA 3.1 model categorization)

5. **Deploy**:
   - Click the **"Deploy"** button.
   - Vercel will clone, install dependencies, compile, and output a live preview link in under 2 minutes.

6. **Update README**:
   - Copy the generated deployment URL (e.g., `https://restaurant-incident-tool.vercel.app`).
   - Add it to the **Live Demo** section of your `README.md` file.

---

## 🔄 How to Deploy Updates
Since Vercel is connected to your GitHub repository, any future code changes pushed to the `main` branch will automatically trigger a production rebuild and redeployment:
```bash
git add .
git commit -m "style: tweak button color"
git push origin main
```
You can monitor build details in the Vercel project deployment panel.
