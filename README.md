<div align="center">
  <h1>Spoke | Cycling Route Manager</h1>
  <p><em>A no-nonsense, brutalist web application for managing cycling routes and group rides.</em></p>
  
  <h3><strong><a href="https://spoke-bike.vercel.app" target="_blank">🚀 View Live App Here</a></strong></h3>
</div>

<div align="center">

![Status](https://img.shields.io/badge/Status-In_Development-FFD700?style=flat)
![Version](https://img.shields.io/badge/version-v0.1.0--alpha-blue)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=flat&logo=spring&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)

</div>

---
> **🚧 WORK IN PROGRESS:** *This project is currently under active development. Features, UI elements, and database schemas are subject to change. Feedback and contributions are welcome!*
---

## 📖 About the Project
**Spoke** is an application designed to connect cyclists with local routes and group rides. Built as a full-stack MVP, it focuses on delivering a raw, highly functional user experience without unnecessary visual clutter. 

🔗 **Live Demo:** [https://spoke-bike.vercel.app](https://spoke-bike.vercel.app)

**The Origin Story:** 
This project was born out of a real-world frustration. In my local cycling group, we would constantly waste hours in group chats debating where to ride, what pace to set, and who was joining. I built Spoke to solve this exact problem: to create a single source of truth for our group rides, eliminate the endless chat clutter, and get us on our bikes faster. 

As a junior developer, I built Spoke not just to write code, but to solve this tangible problem while making strict product, architecture, and design decisions along the way.

## 🎨 Design System: Brutalism
The UI is strictly brutalist. Instead of smooth animations and rounded corners, Spoke embraces a functional, industrial aesthetic:
* **Honest UI:** Heavy borders (`2px solid #0B112D`), pure 90-degree corners (`border-radius: 0`), and high-contrast alert colors (`#FFD700`).
* **Focus on Content:** The interface stays out of the way, making the route data the hero of the application.

## 🚀 Key Features
* **Ride Feed:** Explore upcoming cycling routes (currently seeded with realistic mock data around Dublin, Ireland).
* **Alpha Feedback Loop:** A custom, auth-gated feedback system. Users are greeted with an Alpha Disclaimer upon login and are encouraged to submit bug reports and suggestions.
* **Support System:** Integrated "Support the Project" module seamlessly built into the UI without disrupting the main navigation flow.

## 🧠 Engineering & Product Decisions
During development, I focused on making mature product decisions rather than just writing features:
1. **Removing Inaccurate Data over Keeping Bad Features:** I initially implemented a Haversine formula for route distance. However, straight-line distance is inaccurate for cyclists. I made the call to **remove** the distance UI entirely until a proper routing API (like Mapbox) is integrated. *No data is better than bad data.*
2. **Database Seeding Strategy:** I wrote custom SQL scripts to populate the H2/PostgreSQL database with realistic associative data (Many-to-Many relationships between `Rides` and `Riders`) to test the UI under realistic load conditions.
3. **Component Modularity:** Extracted the "Donate" and "Feedback" sections into isolated, stateful Modal components to keep the main Sidebar clean and maintainable.

## 💻 Tech Stack
**Frontend:**
* React.js
* Vercel (Deployment)
* Custom CSS (Brutalist Design System)

**Backend:**
* Java / Spring Boot
* Spring Security (for Feedback auth-gating)
* Hibernate / JPA

**Database:**
* PostgreSQL (Production) / H2 (Local Testing)

## 🛠️ How to Run Locally

### Prerequisites
* Node.js & npm
* Java 17+
* Maven

### Installation
1. Clone the repo:
   ```bash
   git clone [https://github.com/yourusername/spoke.git](https://github.com/yourusername/spoke.git)
