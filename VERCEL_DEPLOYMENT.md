# Vercel Deployment Guide

## Prerequisites
- Vercel account
- Backend API deployed and accessible
- Environment variables configured

## Deployment Steps

### 1. Connect Repository to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Select the project root directory

### 2. Configure Environment Variables
In Vercel dashboard, go to Project Settings > Environment Variables and add:

```
NEXT_PUBLIC_API_URL=https://cleartax-backend.vercel.app/api
```

**Important:** Replace `https://cleartax-backend.vercel.app/api` with your actual backend API URL.

### 3. Build Settings
Vercel will automatically detect Next.js and use these settings:
- **Framework Preset:** Next.js
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `npm install` (auto-detected)

### 4. Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Your app will be live at `https://your-project.vercel.app`

## Configuration Files

### vercel.json
Already configured with:
- Build command
- Framework detection
- Environment variables template

### next.config.js
Optimized for production with:
- Standalone output
- React strict mode
- Image optimization

## Post-Deployment Checklist

- [ ] Verify API URL is correct in environment variables
- [ ] Test all API endpoints are accessible
- [ ] Check admin panel functionality
- [ ] Verify service creation/editing works
- [ ] Test subcategory management
- [ ] Verify all forms submit correctly

## Troubleshooting

### Build Fails
- Check TypeScript errors in build logs
- Verify all dependencies are installed
- Check for missing environment variables

### API Calls Fail
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check CORS settings on backend
- Verify backend is accessible from Vercel

### Runtime Errors
- Check browser console for errors
- Verify API responses match expected format
- Check network tab for failed requests

