<div align="center">
  <h1>Spoke | Cycling Route Manager</h1>
  <p><em>A no-nonsense, brutalist web application for managing cycling routes and group rides.</em></p>
  
  <h3><strong><a href="https://spoke-bike.vercel.app" target="_blank">🚀 View Live App Here</a></strong></h3>
</div>

<div align="center">

![Status](https://img.shields.io/badge/Status-In_Development-FFD700?style=flat)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=flat&logo=spring&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)

</div>

---
> **🚧 WORK IN PROGRESS:** *Actively in development. Feedback is welcome!*
---

## 📖 The Project & Origin Story
**Spoke** was born from a real-world frustration: wasting hours in group chats trying to organize local cycling rides. I built this full-stack MVP to act as a single source of truth for group rides, cutting out the chat clutter so we can get on our bikes faster. 

## ✨ Highlights & Engineering Decisions
Instead of just writing features, I focused on product architecture and UX:
* **Brutalist UI:** A raw, functional design (`2px` borders, no rounded corners) that puts the route data front and center.
* **Cloud-Native Stack:** Frontend deployed on **Vercel**, API on **Render**, and Serverless DB on **Neon** for optimal scalability.
* **No Data > Bad Data:** Dropped inaccurate straight-line distance calculations entirely until a proper Mapbox routing API is integrated. 
* **Built-in Feedback Loop:** An auth-gated Alpha disclaimer and feedback module to gather real user insights.

## 💻 Tech Stack
* **Frontend:** React.js, Vercel, Custom CSS
* **Backend:** Java, Spring Boot, Spring Security, Render
* **Database:** PostgreSQL, Neon (Serverless), H2 (Local)

## 🛠️ Run Locally
```bash
# Clone the repo
git clone https://github.com/yourusername/spoke.git

# 1. Run Backend (from /backend)
mvn spring-boot:run

# 2. Run Frontend (from /frontend)
npm install && npm start
```

## 🛣️ Roadmap
- [ ] Migrate to a cross-platform mobile app (iOS/Android) using **Capacitor**.
- [ ] Integrate Mapbox API for true route distance calculation.
- [ ] Allow users to join/leave rides dynamically in real-time.

---
*Developed by www.linkedin.com/in/johann-beckerr*  
*🎓 I am currently a student actively seeking **Junior**, **Entry-Level**, or **Internship** Software Developer opportunities. Let's connect!*
