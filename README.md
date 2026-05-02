<div align="center">
  <h1>🚬 T-Facile</h1>
  <p><strong>The smart, automated solution for tobacconists to manage ADM price lists & products.</strong></p>
  
  [![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen.svg?style=for-the-badge)](https://t-facile.vercel.app/)
  [![React](https://img.shields.io/badge/React-19-blue.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Firebase](https://img.shields.io/badge/Firebase-Powered-orange.svg?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
  [![AI](https://img.shields.io/badge/AI-Gemini_Integrated-purple.svg?style=for-the-badge&logo=google)](https://ai.google.dev/)
</div>

<br />

## 🚨 The Problem
For tobacconists, keeping track of product emissions and price changes is a daily struggle. The official **ADM (Agenzia delle Dogane e dei Monopoli)** documentation is scattered, hard to navigate, and buried inside complex PDFs. Many colleagues waste valuable time searching for crucial information manually, often without knowing exactly where to look or missing important updates. 

## 💡 The Solution: T-Facile
**T-Facile** completely automates this workflow. It is a mobile-first web application that acts as a centralized, smart hub. Instead of manually downloading and reading PDFs across different portals, users can instantly search for any product, code, or emission data in a fluid, responsive interface. 

Behind the scenes, T-Facile uses a custom Node.js scraping engine and **Google Gemini AI** to automatically fetch, parse, and structure the data from the official ADM PDFs, keeping everything in sync in real-time.

---

## ✨ Key Features
- 📱 **Mobile-First & PWA**: Designed for on-the-go usage. Installable on smartphones for a native, fast experience.
- 🤖 **AI-Powered Parsing**: Automatically extracts and structures complex tabular data from ADM PDFs using Google GenAI.
- ⚡ **Blazing Fast Search**: Instantaneous search by name or code, capable of handling massive product catalogs thanks to virtualized lists (`react-window`).
- 🔄 **Real-Time Sync**: Powered by Firebase Firestore, ensuring you always see the latest price changes and new entries without refreshing.
- 🌍 **Internationalization (i18n)**: Built-in support for multiple languages.

---

## 🏗️ Technical Architecture & Engineering Decisions

I built T-Facile not just as a tool, but to demonstrate how I approach complex real-world problems with modern architecture:

### Frontend
- **Framework:** React 19 + TypeScript.
- **Architecture:** **Feature-Sliced Design (FSD)** for a highly scalable, domain-driven codebase.
- **Styling & UI:** Tailwind CSS v4 paired with Framer Motion for buttery-smooth micro-interactions.
- **State Management:** Zustand for lightweight, unopinionated global state.
- **Performance:** Implemented `react-window` and `react-virtualized-auto-sizer` to render thousands of list items with zero lag.

### Backend & AI Data Pipeline
- **Server:** Express API running concurrently with Vite.
- **Scraping Engine:** Custom service (`admService.ts`) utilizing `cheerio` and `pdf.js` to monitor the ADM portal.
- **AI Integration:** Implemented an AI Agent (`aiAnalyzer.ts`) to intelligently extract unstructured data from legacy PDFs where standard parsing fails.
- **Database:** Firebase Firestore (with Firebase Admin SDK) for a robust, serverless real-time database layer.

---

## 🚀 Getting Started (Local Development)

Want to explore the code and see how it works under the hood?

1. **Clone & Install Dependencies**
   ```bash
   git clone https://github.com/alexiltabaccaio/t-facile.git
   cd t-facile
   npm install
   ```

2. **Environment Setup**
   Copy `.env.example` to `.env.local` and add your Firebase and Gemini API credentials.

3. **Start the Engine**
   ```bash
   # Starts both the Vite frontend and the Express backend API
   npm run dev
   ```

## 📸 Sneak Peek
*(Add a GIF or screenshot of the app in action here to show off the UI!)*
<br/>
<img src="https://via.placeholder.com/800x400.png?text=T-Facile+App+Screenshot" alt="T-Facile Screenshot" width="100%" />

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
  <p>🛠️ <em>Designed and Engineered by <a href="https://www.linkedin.com/in/alexgiustizieri/">Alex Giustizieri</a></em></p>
</div>
