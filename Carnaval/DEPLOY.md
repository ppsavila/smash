# Deployment Guide for Vercel

This project is a Single Page Application (SPA) built with Vite and Firebase. It is optimized for deployment on [Vercel](https://vercel.com).

## Prerequisites

- A [Vercel Account](https://vercel.com/signup)
- The project pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

1. **Import Project into Vercel**
   - Go to your Vercel Dashboard.
   - Click "Add New..." -> "Project".
   - Select your git repository containing this project.

2. **Configure Project**
   - **Framework Preset**: Vercel should automatically detect `Vite`. If not, select `Vite`.
   - **Root Directory**: Ensure it points to the root of this project (where `package.json` is).

3. **Environment Variables**
   - **Crucial Step**: You must add your Firebase configuration as environment variables.
   - Expand the "Environment Variables" section.
   - Add the following variables (copy values from your local `.env` file or Firebase Console):
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_STORAGE_BUCKET`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - `VITE_FIREBASE_APP_ID`

4. **Deploy**
   - Click "Deploy".
   - Wait for the build to complete.

## Troubleshooting

- **404 on Refresh**: If you experience 404 errors when refreshing pages other than the home page, ensure `vercel.json` is present in the root directory with the rewrite rule:
  ```json
  {
      "rewrites": [
          {
              "source": "/(.*)",
              "destination": "/index.html"
          }
      ]
  }
  ```

- **Firebase Errors**: Check the browser console. If you see authentication or permission errors, verify your Environment Variables in Vercel match your Firebase configuration exactly.
