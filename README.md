# ShopEZ Stock Trading Platform (MERN)

A full-stack real-time stock trading application built with Node.js, Express, MongoDB, and React (Vite).

## 🚀 Live Backend Deployment
- **Render Backend URL**: `https://stockmarketing-mern.onrender.com`
- **Health Check Endpoint**: `https://stockmarketing-mern.onrender.com/api/health`

## 🛠️ Project Structure
- `backend/` - Node.js Express API & MongoDB Atlas database models
- `frontend/` - React application built with Vite and Tailwind CSS

## 🔐 Environment Variables

### Backend (`backend/.env`)
- `PORT=5000`
- `MONGODB_URI=<your_mongodb_connection_string>`
- `JWT_SECRET=<your_jwt_secret>`
- `CLIENT_URL=<your_frontend_url>`

### Frontend (`frontend/.env`)
- `VITE_API_URL=https://stockmarketing-mern.onrender.com/api`