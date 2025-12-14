# FitPlanHub

A fitness plan management platform where trainers can create and manage fitness plans, and users can discover, subscribe to, and follow trainers.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcrypt
- **Frontend**: Vanilla HTML, CSS, JavaScript

## Features

### For Users
- Browse all available fitness plans
- Subscribe to plans (simulated payment)
- View full plan details after subscription
- Follow/unfollow trainers
- Personalized feed showing plans from followed trainers
- Mobile-responsive interface

### For Trainers
- Create fitness plans with pricing and duration
- Edit and delete own plans
- View all created plans
- Role-based access control

## Project Structure

```
trueigTech/
├── config/
│   └── database.js          # MongoDB connection
├── models/
│   ├── User.js             # User schema (users, trainers)
│   ├── FitnessPlan.js      # Fitness plan schema
│   ├── Subscription.js     # User subscriptions
│   └── TrainerFollower.js  # Follow relationships
├── middleware/
│   └── auth.js             # JWT authentication & role checks
├── routes/
│   ├── auth.js             # Signup & login
│   ├── plans.js            # Plan CRUD & subscriptions
│   ├── trainers.js         # Trainer listing & following
│   └── feed.js             # Personalized feed
├── public/
│   ├── index.html          # Frontend interface
│   ├── styles.css          # Mobile-responsive styling
│   └── app.js              # Frontend logic
├── Documentation/
│   ├── README.md
│   ├── Schema_Design.md
│   ├── API_Design.md
│   └── FitPlanHub_Postman_Collection.json
├── server.js               # Main server file
├── package.json
└── .env.example
```

## Setup & Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   - Copy `.env.example` to `.env`
   - Update MongoDB connection string if needed
   - Change JWT_SECRET for production

3. **Start the server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Backend API: http://localhost:5000
   - Frontend: http://localhost:5000/index.html

## API Endpoints

### Authentication
- `POST /auth/signup` - Register new user/trainer
- `POST /auth/login` - Login and get JWT token

### Plans
- `POST /plans` - Create plan (trainer only)
- `PUT /plans/:planId` - Update plan (owner only)
- `DELETE /plans/:planId` - Delete plan (owner only)
- `GET /plans` - Get all plans (preview)
- `GET /plans/:planId` - Get plan details
- `POST /plans/:planId/subscribe` - Subscribe to plan (user only)

### Trainers
- `GET /trainers` - List all trainers
- `GET /trainers/:trainerId` - Get trainer details
- `POST /trainers/:trainerId/follow` - Follow trainer (user only)
- `DELETE /trainers/:trainerId/unfollow` - Unfollow trainer (user only)

### Feed
- `GET /feed` - Get personalized feed (user only)

## Testing with Postman

1. Import `Documentation/FitPlanHub_Postman_Collection.json` into Postman
2. Set up environment variables:
   - `baseUrl`: http://localhost:5000
   - `token`: (will be auto-set after login)
3. Follow the test flow:
   - Signup as user and trainer
   - Login with each account
   - Create plans as trainer
   - Subscribe and follow as user
   - Test all endpoints

## Database Schema

All collections use camelCase naming with proper indexes:

- **users** - User accounts (role: USER or TRAINER)
- **fitnessPlans** - Fitness plans created by trainers
- **subscriptions** - User subscriptions to plans
- **trainerFollowers** - Follow relationships

See `Documentation/Schema_Design.md` for detailed schema.

## Access Control

- Users can subscribe to plans and follow trainers
- Trainers can create, edit, and delete their own plans
- Trainers cannot subscribe to plans
- Users cannot create plans
- Subscribed users get full plan details

## Development Notes

- Code follows readable, human-like patterns
- Minimal abstractions for clarity
- Essential comments only where needed
- Natural variable and function naming
- Clean file structure without over-engineering

## License

ISC
