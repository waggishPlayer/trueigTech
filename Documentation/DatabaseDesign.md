Schema Design – FitPlanHub (MongoDB)

Collection: users
- name: string
- email: string
- passwordHash: string
- role: string (USER or TRAINER)
- createdAt: date

Collection: fitnessPlans
- title: string
- description: string
- price: number
- durationDays: number
- trainerId: objectId (users)
- createdAt: date
- updatedAt: date

Collection: subscriptions
- userId: objectId (users)
- planId: objectId (fitnessPlans)
- subscribedAt: date

Collection: trainerFollowers
- userId: objectId (users)
- trainerId: objectId (users)
- followedAt: date