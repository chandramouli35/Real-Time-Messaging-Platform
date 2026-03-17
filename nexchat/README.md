# 🚀 NexChat — Real-Time Messaging Platform

NexChat is a high-performance, full-stack real-time messaging platform designed for seamless communication. It features a modern, premium UI with instantaneous message delivery, secure authentication, and a robust scalable architecture.

![NexChat Preview](https://images.unsplash.com/photo-1611606063065-ee7946f0787a?auto=format&fit=crop&q=80&w=2000)

## ✨ Core Features

### 💬 Messaging Experience
- **Real-Time Communication**: Instant message delivery powered by **Socket.io**.
- **Typing Indicators**: Live feedback when someone is typing.
- **Message History**: Persistent chat threads with efficient MongoDB storage.
- **Unread Counters**: Real-time notification badges for missed messages.

### 🎨 Visual Excellence
- **Premium Dark UI**: A sleek, modern aesthetic inspired by industry leaders like Linear and Vercel.
- **Fluid Animations**: Smooth transitions and interactive elements using `Framer Motion`.
- **Glassmorphism**: Elegant backdrop-blur effects and curated color palettes.
- **Fully Responsive**: Optimized for desktop, tablet, and mobile devices.

### 🔐 Security & Reliability
- **JWT Authentication**: Secure user sessions with JSON Web Tokens.
- **Robust State Management**: Clean and predictable frontend state using `Zustand`.
- **Rate Limiting**: Protection against spam and brute-force attacks.
- **Encrypted Passwords**: Industry-standard hashing using `Bcrypt`.

---

## 🛠️ Technology Stack

**Frontend:**
- **Framework**: React 19 + TypeScript
- **State Management**: Zustand
- **Real-time**: Socket.io Client
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React

**Backend:**
- **Runtime**: Node.js & Express
- **Database**: MongoDB (Mongoose ODM)
- **Communications**: Socket.io
- **Security**: JWT, Helmet.js, Express Rate Limit
- **Storage**: Multer (for media uploads)

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/try/download/community) (Local or Cluster URI)

### 2. Environment Configuration
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173
```

### 3. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/nexchat.git

# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install
```

### 4. Launching the Platform
Start both servers in separate terminals:

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📂 Project Organization

```text
nexchat/
├── backend/
│   ├── models/        # Mongoose Data Models
│   ├── routes/        # Express API Routes
│   ├── middleware/    # Auth & Validation Logic
│   └── server.js      # Socket.io & App Entry
├── frontend/
│   ├── src/
│   │   ├── components/# Modular React Components
│   │   ├── store/      # Zustand State Stores
│   │   ├── hooks/     # Custom React Hooks
│   │   └── App.tsx    # App Routing & Shell
```

## 📜 License
Developed with passion by [Your Name/Team]. All rights reserved.
