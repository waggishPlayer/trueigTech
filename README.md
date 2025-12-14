# FitPlanHub

**FitPlanHub** is a full-stack fitness plan marketplace connecting specialized trainers with fitness enthusiasts. Trainers can create and sell personalized workout plans, while users can subscribe to plans, follow trainers, and receive a curated fee.

## 🚀 Features

### For Users
- **Personalized Feed**: See plans from trainers you follow.
- **Advanced Search**: Filter plans by price, duration, and trainer.
- **Secure Subscription**: Mock payment simulation flow for subscribing to plans.
- **Trainer Interaction**: Follow/Unfollow trainers to curate your feed.

### For Trainers
- **Dashboard**: Manage your created plans and view subscriber counts.
- **Plan Creation**: intuitive tools to create detailed workout plans with pricing and duration.
- **Community Building**: Gain followers and grow your fitness brand.

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT Authentication.
- **Frontend**: Vanilla HTML5, CSS3 (Modern Flexbox/Grid), JavaScript (ES6+).
- **Deployment**:
    - **Frontend**: Ready for Netlify (Static hosting).
    - **Backend**: Ready for Render/Heroku (Node.js runtime).

## 📦 Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/waggishPlayer/trueigTech.git
    cd trueigTech
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env` file in the root directory (do not commit this file):
    ```env
    PORT=5001
    MONGODB_URI=mongodb+srv://<your_db_user>:<your_db_password>@<your_cluster>.mongodb.net/?appName=fitplanhub
    JWT_SECRET=your_super_secret_jwt_key
    ```

4.  **Run Locally**:
    ```bash
    npm run dev
    ```
    - The server will start on `http://localhost:5001`.
    - Open `http://localhost:5001/index.html` in your browser.

## 🌍 Deployment Strategy

This repository uses a multi-branch deployment strategy:

- **`main`**: The primary development branch.
- **`frontend-deploy`**: Contains the frontend code optimized for static site hosts like Netlify.
- **`backend-deploy`**: Contains the backend API code optimized for connection-based hosts like Render.

### How to Deploy

1.  **Backend (Render/Railway)**:
    - Connect your repo to Render.
    - Select the `backend-deploy` branch.
    - Set the `Build Command` to `npm install`.
    - Set the `Start Command` to `node server.js`.
    - Add your `.env` variables in the dashboard.

2.  **Frontend (Netlify/Vercel)**:
    - Connect your repo to Netlify.
    - Select the `frontend-deploy` branch.
    - Set the `Publish directory` to `public`.
    - **Important**: Update the `API_BASE` URL in `public/app.js` to point to your deployed backend URL.

## 📂 Project Structure

```
├── models/             # Mongoose schemas (User, FitnessPlan, Subscription, etc.)
├── routes/             # Express API routes (Auth, Plans, Feed, Trainers)
├── public/             # Static frontend files (HTML, CSS, JS)
│   ├── app.js          # Main frontend logic
│   ├── styles.css      # Global styles
│   └── ...html         # Page templates
├── middleware/         # Auth and role-based access control
├── config/             # Database connection configuration
├── scripts/            # Utility scripts (e.g., reset_db.js)
├── server.js           # App entry point
└── package.json        # Dependencies and scripts
```

---
*Built with ❤️ for FitPlanHub.*
