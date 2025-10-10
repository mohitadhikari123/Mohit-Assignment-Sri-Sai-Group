# Task Management Application

This is a full-stack task management application built with the MERN stack (MongoDB, Express.js, React, Node.js) and Socket.IO for real-time updates.

## Features

- User authentication (registration, login, logout)
- Create, read, update, and delete tasks
- Hierarchical role management: Users can assign tasks to themselves and lower-role team members.
- Real-time task updates using Socket.IO
- Rate limiting to prevent abuse

## Installation

To set up the project locally, follow these steps:

### Prerequisites

- Node.js (LTS version recommended)
- npm or Yarn
- MongoDB

### Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory and add the following environment variables:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```
4. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```

## Usage

Once both the backend and frontend servers are running:

1. Open your browser and go to `http://localhost:5173` (or the port your frontend is running on).
2. Register a new user or log in with existing credentials.
3. Start managing your tasks!

## Technologies Used

### Backend

- Node.js
- Express.js
- MongoDB (with Mongoose)
- Socket.IO
- JSON Web Token (JWT) for authentication
- bcryptjs for password hashing
- express-rate-limit
- cookie-parser
- cors
- dotenv

### Frontend

- React
- Redux Toolkit for state management
- Material-UI for UI components
- Axios for API requests
- Socket.IO Client for real-time communication
- React Router DOM for navigation
- React Toastify for notifications
- date-fns for date formatting
- Vite for build tool

## Project Structure

```
. \
├── backend\
│   ├── config.js
│   ├── controllers\
│   ├── middlewares\
│   ├── models\
│   ├── routes\
│   ├── server.js
│   ├── socket.js
│   └── utils\
└── frontend\
    ├── public\
    ├── src\
    │   ├── api\
    │   ├── assets\
    │   ├── components\
    │   ├── pages\
    │   ├── redux\
    │   ├── styles\
    │   └── App.jsx
    └── vite.config.js
```