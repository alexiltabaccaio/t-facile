<div align="center">
  <table>
    <tr>
      <td width="350" align="center" valign="top">
        <br />
        <img src="https://github.com/user-attachments/assets/d0766d13-a918-44a0-86b5-eabfe5b656c1" alt="T-Facile Preview" width="300" />
      </td>
      <td width="450" align="left" valign="middle">
        <h3>🚬 T-Facile</h3>
        <p><strong>The smart, automated solution for tobacconists to manage ADM price lists & products.</strong></p>
        <br />
        <a href="https://t-facile.vercel.app/">
          <img src="https://img.shields.io/badge/LIVE_DEMO_➜-2ea44f?style=for-the-badge" alt="Live Demo" />
        </a>
        <br /><br />
        <img src="https://img.shields.io/badge/React_19-20232a.svg?style=flat-square&logo=react" alt="React" /><br />
        <img src="https://img.shields.io/badge/TypeScript-3178c6.svg?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /><br />
        <img src="https://img.shields.io/badge/Firebase-ffca28.svg?style=flat-square&logo=firebase&logoColor=black" alt="Firebase" /><br />
        <img src="https://img.shields.io/badge/AI_Gemini-8e44ad.svg?style=flat-square&logo=google" alt="AI" />
        <br />
      </td>
    </tr>
  </table>
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

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
  <p>🛠️ <em>Designed and Engineered by <a href="https://www.linkedin.com/in/alexgiustizieri/">Alex Giustizieri</a></em></p>
</div>
