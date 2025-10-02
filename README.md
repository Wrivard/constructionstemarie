# Construction Ste-Marie Website

## 🏗️ Project Overview

**Construction Ste-Marie** is a professional website for a residential renovation contractor, built with Webflow and exported as a static website. The site showcases construction services, renovation projects, and provides online submission forms for potential clients.

**Live Website:** [https://constructionstemarie.ca](https://constructionstemarie.ca)  
**GitHub Repository:** [Your repository URL]

## 📁 Project Structure

```
construction-ste-marie-27a752.webflow/
├── index.html                          # Homepage
├── a-propos.html                       # About page
├── services/
│   ├── renovation.html                 # General renovation services
│   └── agrandissement-de-maison.html  # House extension services
├── renovation-*.html                   # City-specific renovation pages
├── soumission-en-ligne.html            # Online submission form
├── css/                                # Stylesheets
│   ├── normalize.css                   # CSS reset
│   ├── webflow.css                     # Webflow framework
│   └── construction-ste-marie-27a752.webflow.css  # Custom styles
├── js/
│   └── webflow.js                     # Webflow JavaScript
├── images/                             # All website images and assets
├── package.json                        # Node.js project configuration
├── .gitignore                          # Git ignore rules
└── README.md                           # This documentation
```

## 🚀 Project Setup & Boot Process

### **Step 1: Initial Project Analysis**
- **Project Type:** Static HTML website exported from Webflow
- **Technology Stack:** HTML5, CSS3, JavaScript, Webflow framework
- **File Count:** 158 files including HTML, CSS, JS, and images
- **Total Size:** ~49 MB

### **Step 2: Development Environment Setup**

#### **Prerequisites Installed:**
- ✅ **Node.js** v22.18.0
- ✅ **npm** v10.4.0
- ✅ **Git** (latest version)

#### **Global Packages Installed:**
```bash
# HTTP Server for static file serving
npm install -g http-server

# Live Server with auto-refresh capabilities
npm install -g live-server
```

### **Step 3: Local Development Server Setup**

#### **Option A: HTTP Server (Simple Static Serving)**
```bash
# Start server on port 3000 with auto-open browser
http-server -p 3000 -o

# Available URLs:
# - http://localhost:3000 (Homepage)
# - http://127.0.0.1:3000
# - http://10.5.0.2:3000 (Local network)
# - http://192.168.68.204:3000 (Local network)
```

#### **Option B: Live Server (Development with Auto-Refresh)**
```bash
# Start live-server on port 3000
live-server --port=3000 --open

# Features:
# - Automatic browser refresh on file changes
# - File watching for HTML, CSS, and JS
# - Real-time development experience
```

### **Step 4: Package.json Configuration**

Created a comprehensive `package.json` with development scripts:

```json
{
  "name": "construction-ste-marie",
  "version": "1.0.0",
  "description": "Construction Ste-Marie - Entrepreneur en rénovation résidentielle",
  "main": "index.html",
  "scripts": {
    "start": "http-server -p 3000 -o",
    "dev": "live-server --port=3000 --open",
    "live": "live-server --port=3000 --open",
    "static": "http-server -p 3000 -o"
  }
}
```

#### **Available Commands:**
- `npm start` - Start static HTTP server
- `npm run dev` - Start live-server with auto-refresh
- `npm run live` - Alternative live-server command
- `npm run static` - Alternative static server command

### **Step 5: Git Repository Setup**

#### **Repository Initialization:**
```bash
# Initialize Git repository
git init

# Add GitHub remote origin
git remote add origin https://github.com/Wrivard/constructionstemarie.git

# Create .gitignore file for proper file exclusion
# (Excludes node_modules, logs, IDE files, OS files, etc.)
```

#### **Initial Commit & Push:**
```bash
# Add all project files
git add .

# Commit with descriptive message
git commit -m "Initial commit: Construction Ste-Marie website - Complete Webflow export with all pages, CSS, images, and JavaScript"

# Push to GitHub (first time with upstream tracking)
git push -u origin master
```

### **Step 6: GitHub Repository Configuration**

- **Repository:** [https://github.com/Wrivard/constructionstemarie](https://github.com/Wrivard/constructionstemarie)
- **Branch:** master
- **Files Committed:** 158 files
- **Total Upload:** 49.09 MiB
- **Status:** Successfully deployed

## 🌐 Website Features

### **Core Pages:**
1. **Homepage** (`index.html`) - Main landing page with services overview
2. **About** (`a-propos.html`) - Company information and team details
3. **Services** - Comprehensive renovation service offerings
4. **City-Specific Pages** - Localized renovation services for:
   - Joliette
   - Laval
   - Repentigny
   - Terrebonne
5. **Online Submission** (`soumission-en-ligne.html`) - Contact form for quotes
6. **Legal Pages** - Cookie policy and terms

### **Technical Features:**
- **Responsive Design** - Mobile-first approach
- **Modern CSS** - Webflow framework with custom styling
- **Interactive Elements** - JavaScript-powered interactions
- **SEO Optimized** - Meta tags, structured content
- **Fast Loading** - Optimized images and assets

## 🛠️ Development Workflow

### **Starting Development:**
```bash
# Clone repository (if working on different machine)
git clone https://github.com/Wrivard/constructionstemarie.git
cd constructionstemarie

# Install dependencies (if any added later)
npm install

# Start development server
npm run dev
```

### **Making Changes:**
1. Edit HTML, CSS, or JavaScript files
2. Save changes (browser auto-refreshes with live-server)
3. Test changes in browser
4. Commit and push updates:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin master
   ```

### **Stopping Servers:**
- **HTTP Server:** Press `Ctrl+C` in terminal
- **Live Server:** Press `Ctrl+C` in terminal

## 📱 Browser Compatibility

- ✅ **Chrome** (latest)
- ✅ **Firefox** (latest)
- ✅ **Safari** (latest)
- ✅ **Edge** (latest)
- ✅ **Mobile browsers** (iOS Safari, Chrome Mobile)

## 🚀 Deployment Options

### **1. GitHub Pages (Free)**
- Enable in repository settings
- Deploy from master branch
- Available at: `https://constructionstemarie.ca`

### **2. Netlify (Free Tier)**
- Drag and drop deployment
- Automatic builds from Git
- Custom domain support

### **3. Vercel (Free Tier)**
- Connect GitHub repository
- Automatic deployments
- Performance analytics

### **4. Firebase Hosting**
- Google's hosting solution
- Fast global CDN
- SSL certificates included

## 🔧 Troubleshooting

### **Common Issues:**

#### **Port Already in Use:**
```bash
# Change port number
http-server -p 3001 -o
# or
live-server --port=3001 --open
```

#### **Git Push Issues:**
```bash
# Check remote configuration
git remote -v

# Re-add remote if needed
git remote remove origin
git remote add origin https://github.com/Wrivard/constructionstemarie.git
```

#### **File Permission Issues:**
```bash
# On Windows, run PowerShell as Administrator
# On Mac/Linux, check file permissions
chmod +x package.json
```

## 📚 Additional Resources

- **Webflow Documentation:** [https://webflow.com/docs](https://webflow.com/docs)
- **GitHub Pages Guide:** [https://pages.github.com](https://pages.github.com)
- **Node.js Documentation:** [https://nodejs.org/docs](https://nodejs.org/docs)
- **HTTP Server:** [https://github.com/http-party/http-server](https://github.com/http-party/http-server)
- **Live Server:** [https://github.com/tapio/live-server](https://github.com/tapio/live-server)

## 👥 Project Team

- **Developer:** AI Assistant
- **Design:** Webflow
- **Client:** Construction Ste-Marie
- **Repository Owner:** [Wrivard](https://github.com/Wrivard)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Last Updated:** August 27, 2025  
**Project Status:** ✅ Successfully deployed and running  
**Next Steps:** Enable GitHub Pages or deploy to preferred hosting platform
