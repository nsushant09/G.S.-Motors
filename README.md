# GS Motors Dealership Website

## Project Structure

This project is structured as a full-stack web application with a React frontend and Node.js/Express backend using MongoDB.

```
.
├── client/
│   ├── components/
│   ├── pages/
│   └── ...
└── server/
    ├── controllers/
    ├── models/
    ├── routes/
    └── ...
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install server dependencies:
   ```bash
   npm install
   ```

3. Start MongoDB (if not already running):
   ```bash
   mongod
   ```

4. In a new terminal, start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install client dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

### Run the server:
```bash
npm start
```

### Run the client:
```bash
npm run dev
```

## Features

- React + Vite frontend with Tailwind CSS
- Express.js + MongoDB backend
- Responsive design with Tailwind CSS
- Framer Motion animations
- Car browsing and filtering
- Contact form functionality
- Car detail pages with image galleries
- Search functionality

## Project Structure

### Frontend (React + Vite)
- Components: Reusable UI elements
- Pages: Different sections of the application
- Services: API communication layer

### Backend (Node.js + Express)
- Controllers: Business logic
- Models: Data models (Mongoose)
- Routes: API endpoints
- Config: Database configuration

## Development

### Running the Application

1. Start the backend server:
   ```bash
   cd server
   npm run dev
   ```

2. In a separate terminal, start the frontend:
   ```bash
   cd client
   npm run dev
   ```

## Features Implemented

- Home page with animated sections
- Car browsing with filtering capabilities
- Car details page with specifications
- About and contact pages
- Responsive design that works on mobile and desktop
- MongoDB integration for data storage
- Contact form with validation

## Future Enhancements

- Admin dashboard
- User authentication
- Car comparison feature
- Financing tools
- Chat support

## Design Elements

- Premium digital showroom
- Easy browsing and filtering
- Storytelling through the About page
- Professional design with animations