# HangOut

**Created by Team Infinity**

**Live App:** [https://gethangout.app/](https://gethangout.app/)  
**User Interview:** [Watch on YouTube](https://youtu.be/jqmnkv4wU08?si=T1F_KG1ao9YScLtf)  
**Layout Design:** [Figma](https://www.figma.com/design/KkqxQXsT66wWhePmOrQNDS/Infinity-Hangout-Project?node-id=0-1&p=f&m=draw)  
**Live Demo:** Coming soon

---

## Overview

**HangOut** is a social web application built by **Team Infinity** that helps users discover local activities, meet new people, and explore events based on shared interests.  
The platform features an **interactive map** that visualizes nearby hangout spots and events, allowing users to connect and engage with their community in real time.  
It offers a personalized and seamless experience with a modern, responsive design and smart recommendations.

---

## Tech Stack

**Frontend & Backend (Full-Stack Next.js):**

- Next.js (React + TypeScript)
- Next.js API Routes for server-side logic
- MongoDB for data persistence
- Tailwind CSS for styling

**Infrastructure & Deployment:**

- AWS EC2
- PM2 for process management
- GitHub Actions for CI/CD (auto-deploy on `main` branch push)

---

## Getting Started (Development)

1. **Clone the repository**

   ```bash
   git clone https://github.com/CS4800-Team-Infinity/hangout.git
   cd hangout
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

   Then open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for production**
   ```bash
   npm run build
   npm start
   ```

---

## Deployment

The HangOut web app is hosted on AWS EC2, with continuous deployment handled by GitHub Actions.
Every push to the main branch automatically:

- Fetches the latest code
- Installs dependencies
- Builds the app
- Cleans old logs and temporary files
- Restarts PM2 for production

---

## Team Infinity

- **[Tam Tran](https://github.com/itistamtran)**
- **[Kenneth Chau](https://github.com/contactkc)**
- **[David Torres](https://github.com/datorres335)**
- **[Kira Inman](https://github.com/CranKinman)**

## Professor

**[Dr. Yu Sun](http://yusun.io)**
**Course:** CS4800 — Fall 2025

This project was developed as part of **CS4800 - Software Engineering** under the guidance of Dr. Yu Sun.
