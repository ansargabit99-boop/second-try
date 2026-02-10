# Deployment Guide for Solo Leveling App

## 1. Prerequisites
- **GitHub Account**: To host your code.
- **Vercel Account**: To host the frontend (React/Vite).
- **Render/Railway Account**: To host the backend (Node.js/Express) and Database (MongoDB).

> **Note**: Since your app uses a backend server and a database, you cannot host everything on Vercel for free easily (Vercel is best for Frontend). We recommend **Vercel** for Frontend and **Render** for Backend.

---

## 2. Prepare Your Code
1.  **Initialize Git** (if not done):
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```
2.  **Push to GitHub**:
    -   Create a new repository on GitHub.
    -   Run the commands shown by GitHub (e.g., `git remote add origin ...` and `git push ...`).

## 3. Deploy Backend (Server)
1.  **Go to [Render.com](https://render.com)**.
2.  Create a **New Web Service**.
3.  Connect your GitHub repository.
4.  **Settings**:
    -   **Root Directory**: `server`
    -   **Build Command**: `npm install`
    -   **Start Command**: `node index.js`
5.  **Environment Variables** (Add these in Render dashboard):
    -   `MONGO_URI`: Your MongoDB Connection String (You need a cloud database, see below).
    -   `OPENAI_API_KEY`: Your OpenAI Key.
6.  **Copy the Backend URL**: Once deployed, Render will give you a URL (e.g., `https://solo-leveling-api.onrender.com`).

### MongoDB Atlas (Database)
You need a cloud database. `localhost` won't work online.
1.  Go to **[MongoDB Atlas](https://www.mongodb.com/atlas)**.
2.  Create a free cluster.
3.  Get the Connection String (URI).
4.  Paste it into Render's `MONGO_URI` variable.

---

## 4. Deploy Frontend (Client)
1.  **Go to [Vercel.com](https://vercel.com)**.
2.  **Add New Project** -> Import from GitHub.
3.  **Settings**:
    -   **Framework Preset**: Vite
    -   **Root Directory**: `./` (Default)
4.  **Environment Variables**:
    -   **Name**: `VITE_API_URL`
    -   **Value**: Your Render Backend URL (e.g., `https://solo-leveling-api.onrender.com`)
    -   **IMPORTANT**: Do **not** add a trailing slash `/` at the end of the URL.
5.  **Deploy**.

---

## 5. Verify
-   Open your Vercel URL on your phone.
-   Try logging in.
-   It should connect to your Render backend and MongoDB Atlas database.

## Mobile Responsiveness
We have updated the design to be responsive!
-   **Login Screen**: Adjusted padding for mobile screens.
-   **Dashboard**: Grids stack vertically on phones.
