# 🎮 How to Run Your Solo Leveling App

## Quick Start (Every Time You Want to Use the App)

You need to run **TWO** commands in **TWO separate terminals**:

### Terminal 1 - Frontend (React App)
```bash
cd "c:\Users\ACER\Desktop\Новая папка\todo-app"
npm run dev
```
**Access at:** http://localhost:5173/

---

### Terminal 2 - Backend (API Server)
```bash
cd "c:\Users\ACER\Desktop\Новая папка\todo-app\server"
npm run dev
```
**Runs on:** http://localhost:5000/

---

## Step-by-Step Instructions

1. **Open your first terminal** (PowerShell or Command Prompt)
   - Navigate to the main project folder
   - Run `npm run dev`
   - You should see: `Local: http://localhost:5173/`
   - **Keep this terminal open!**

2. **Open a second terminal**
   - Navigate to the `server` folder
   - Run `npm run dev` (or `node index.js`)
   - You should see: `Server running on port 5000` and `MongoDB Connected`
   - **Keep this terminal open!**

3. **Open your browser**
   - Go to http://localhost:5173/
   - Your app should now work!

---

## Stopping the Servers

- Press `Ctrl + C` in each terminal window to stop the servers

---

## Troubleshooting

**Problem:** "npm: command not found"
- **Solution:** Make sure Node.js is installed

**Problem:** "Cannot find module"
- **Solution:** Run `npm install` in both the main folder and the `server` folder

**Problem:** Backend won't start
- **Solution:** Make sure MongoDB is running, or check your `.env` file

**Problem:** Port already in use
- **Solution:** Close any other apps using ports 5173 or 5000, or restart your computer
