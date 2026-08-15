# 🎬 How to Install Motion Studio in Adobe Premiere Pro on Windows

This step-by-step guide explains how to install and run **Motion Studio** as a native **Adobe UXP Panel Plugin** inside Adobe Premiere Pro on Windows.

---

## 📋 Prerequisites
1. **Adobe Premiere Pro 2022, 2023, 2024, or 2025** (v22.0+) installed on Windows.
2. **Node.js** (v18+) installed.
3. **Adobe UXP Developer Tool (UDT)** (Free official tool from Adobe Creative Cloud Desktop app).

---

## 🚀 Method 1: Using Adobe UXP Developer Tool (Recommended & Instant)

This is the standard, easiest method for loading native UXP plugins on Windows.

### Step 1: Build Motion Studio
Open Command Prompt or PowerShell in the `motion-studio` project folder:
```powershell
# 1. Install dependencies
npm install

# 2. Build production bundle & manifest
npm run build
```
This will compile the React app and automatically output `dist/` containing `index.html` and `dist/manifest.json`.

---

### Step 2: Open Adobe UXP Developer Tool
1. Open **Adobe Creative Cloud Desktop**.
2. Go to **Apps** → scroll down to **Utilities** → Install and Launch **UXP Developer Tool**.
   *(Or search for "Adobe UXP Developer Tool" in your Windows Start Menu)*.

---

### Step 3: Add the Motion Studio Plugin
1. In the **UXP Developer Tool**, click **Add Plugin** in the top right.
2. Navigate to your project folder and select the `manifest.json` file located in the root or inside the `dist\` folder:
   ```
   C:\path\to\motion-studio\manifest.json
   ```
3. You will now see **Motion Studio** listed in the UXP Developer Tool.

---

### Step 4: Launch and Load into Premiere Pro
1. Open **Adobe Premiere Pro** on Windows.
2. In the **UXP Developer Tool**, click the **Actions (`...`)** menu next to **Motion Studio** → click **Load** (or **Debug**).
3. Switch to **Premiere Pro**.
4. In the top menu bar, click:
   ```
   Window ➔ Extensions ➔ Motion Studio
   ```
   *(or `Plugins ➔ Motion Studio`)*.

🎉 **Motion Studio will open directly as a dockable, resizable panel inside Premiere Pro!**

---

## 🛠️ Method 2: Manual Direct Folder Installation (No Developer Tool)

If you prefer installing it permanently into Premiere Pro's extensions directory:

1. Build the plugin:
   ```powershell
   npm run build
   ```
2. Create a folder named `com.motionstudio.panel` inside your Windows UXP directory:
   ```
   C:\Users\<YourUsername>\AppData\Roaming\Adobe\UXP\Plugins\com.motionstudio.panel\
   ```
   *(or `C:\Program Files\Common Files\Adobe\UXP\extensions\com.motionstudio.panel\`)*
3. Copy all contents of the `dist\` folder (including `manifest.json`, `index.html`, and `assets\`) into that folder.
4. Restart Adobe Premiere Pro.
5. Open `Window ➔ Extensions ➔ Motion Studio`.

---

## ⚡ How to Use the Plugin Inside Premiere Pro

1. In your Premiere Pro timeline, **select any video clip, text layer, or graphic**.
2. In the **Motion Studio panel**, adjust your Bézier curve or pick a Motion Recipe.
3. Click the **`⚡ Export`** button in the top right header → Click **`Pr Apply to Premiere Pro (Live UXP)`**.
4. The keyframes will instantly be injected into your clip's Position/Scale/Rotation property on your timeline with full undo/redo safety!
