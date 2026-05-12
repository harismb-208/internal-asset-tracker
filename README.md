# Internal Asset Tracker

A full-stack application to track internal company assets, featuring quantity-based tracking, role-based access control, and a modern dashboard.

## Tech Stack
- **Frontend**: React + Vite
- **Backend**: Node.js + Express + MongoDB
- **Deployment**: Vercel (Serverless)

## Deployment Instructions (Vercel)

### Backend Deployment
1. Navigate to the `backend/` directory.
2. Connect your repository to Vercel.
3. Configure the following Environment Variables in the Vercel Dashboard:
   - `MONGO_URI`: Your MongoDB connection string.
   - `JWT_SECRET`: A secure string for signing tokens.
   - `CLIENT_URL`: The URL of your deployed frontend (e.g., `https://my-app-frontend.vercel.app`).
4. Deploy the project. Vercel will use the `vercel.json` configuration to handle serverless routes.

### Frontend Deployment
1. Navigate to the `frontend/` directory.
2. Connect your repository to Vercel.
3. Configure the following Environment Variable in the Vercel Dashboard:
   - `VITE_API_URL`: The URL of your deployed backend (e.g., `https://my-app-backend.vercel.app`).
4. Deploy the project. The `vercel.json` ensures that all routes are redirected to `index.html` for React Router support.

## Local Development

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account or local MongoDB instance

### Setup
1. Clone the repository.
2. **Backend**:
   - `cd backend`
   - `npm install`
   - Create a `.env` file with `MONGO_URI` and `JWT_SECRET`.
   - `npm run dev`
3. **Frontend**:
   - `cd frontend`
   - `npm install`
   - Create a `.env` file with `VITE_API_URL=http://localhost:5050`.
   - `npm run dev`

## Features
- **Asset Management**: Create, view, and track asset quantities.
- **Request System**: Users can request specific quantities of available assets.
- **Admin Dashboard**: Comprehensive overview of inventory and pending requests.
- **Security**: JWT-based authentication with role-based access (Admin/User).
- **Modern UI**: Dark-themed, responsive design with glassmorphism aesthetics.
