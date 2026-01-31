# Agri-AI Tech Stack

## 🚀 Frontend Technologies

### **Core Framework & Libraries**
- **React 19.2.0** - Modern JavaScript library for building user interfaces
- **Vite 7.2.4** - Fast build tool and development server
- **React Router DOM 7.13.0** - Client-side routing for single-page applications
- **React Icons 5.5.0** - Popular icon library for React applications

### **Styling & UI**
- **CSS3** - Custom styling with modern CSS features
- **Tailwind CSS 4.1.18** - Utility-first CSS framework
- **PostCSS 8.5.6** - CSS post-processor
- **Autoprefixer 10.4.23** - CSS vendor prefixing

### **Authentication & Database**
- **Firebase 12.8.0** - Authentication, Firestore database, and analytics
- **Firebase Auth** - User authentication system
- **Firebase Firestore** - NoSQL document database
- **Firebase Analytics** - User analytics and insights

### **Internationalization**
- **i18next 25.8.0** - Internationalization framework
- **react-i18next 16.5.4** - React integration for i18next
- **Multi-language Support** - English and Telugu language support

### **HTTP Client & APIs**
- **Axios** - Promise-based HTTP client for API requests
- **Fetch API** - Native browser API for HTTP requests

## 🔧 Backend Technologies

### **Core Framework**
- **FastAPI** - Modern, fast Python web framework for building APIs
- **Python 3.x** - Programming language
- **Uvicorn** - ASGI server for FastAPI applications

### **Database**
- **SQLite** - Lightweight, serverless database
- **SQLite3** - Python SQLite interface

### **Authentication & Security**
- **JWT (JSON Web Tokens)** - Secure token-based authentication
- **Passlib** - Password hashing library
- **Bcrypt** - Password hashing algorithm
- **Python-JOSE** - JWT implementation for Python

### **Machine Learning & AI**
- **TensorFlow 2.18.0** - Machine learning framework
- **TensorFlow Hub 0.16.1** - Pre-trained model repository
- **OpenCV 4.10.0.84** - Computer vision library
- **NumPy 2.2.1** - Numerical computing library
- **Pillow 11.1.0** - Python Imaging Library

### **API & Data Validation**
- **Pydantic 2.10.5** - Data validation using Python type annotations
- **Python Multipart 0.0.20** - Multipart form data parsing

### **CORS & Middleware**
- **FastAPI CORS Middleware** - Cross-Origin Resource Sharing support

## 🛠️ Development Tools

### **Code Quality & Linting**
- **ESLint 9.39.1** - JavaScript/React code linting
- **ESLint React Hooks Plugin** - React Hooks specific linting rules
- **ESLint React Refresh Plugin** - React Fast Refresh support

### **Build & Development**
- **Vite Plugin React 5.1.1** - React support for Vite
- **Globals 16.5.0** - Global variables for ESLint

### **Package Management**
- **npm** - Node.js package manager
- **pip** - Python package manager

## 🏗️ Architecture & Patterns

### **Frontend Architecture**
- **Component-Based Architecture** - Reusable React components
- **Custom Hooks** - Reusable stateful logic
- **Context API** - State management for authentication
- **Local Storage** - Client-side data persistence
- **Responsive Design** - Mobile-first approach

### **Backend Architecture**
- **RESTful API** - REST architectural style
- **MVC Pattern** - Model-View-Controller separation
- **Dependency Injection** - FastAPI's built-in DI system
- **Middleware Pattern** - CORS and authentication middleware

### **Database Design**
- **Relational Database** - SQLite with foreign key relationships
- **User Management** - Separate farmer and customer roles
- **Product Management** - CRUD operations for marketplace items

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - Bcrypt encryption
- **CORS Protection** - Cross-origin request security
- **Input Validation** - Pydantic data validation
- **File Upload Security** - Image file type validation

## 🌐 Deployment & Production

### **Environment Configuration**
- **Environment Variables** - Secure configuration management
- **Production Builds** - Optimized builds for deployment
- **CORS Configuration** - Production-ready CORS settings

### **Performance Optimizations**
- **Code Splitting** - Lazy loading of components
- **Image Optimization** - Compressed assets
- **Caching Strategies** - Browser and API caching

## 📱 Features Implemented

### **Core Functionality**
- **User Authentication** - Firebase-based login/signup
- **Multi-language Support** - English and Telugu
- **Plant Disease Detection** - AI-powered image analysis
- **Marketplace** - Product buying/selling platform
- **Inventory Management** - Farmer product management
- **Crop Rotation Planning** - Agricultural planning tool

### **User Roles**
- **Farmers** - Product management, disease detection
- **Customers** - Marketplace browsing, product purchasing

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ and npm
- Python 3.8+
- Firebase account

### **Installation**
```bash
# Frontend
cd Frontend
npm install
npm run dev

# Backend
cd Backend
pip install -r requirements.txt
python main_auth.py
```

## 📊 Project Statistics

- **Frontend Components**: 15+ React components
- **Backend Endpoints**: 20+ API endpoints
- **Database Tables**: 3 main tables (users, products, pesticides)
- **Languages Supported**: 2 (English, Telugu)
- **Authentication Methods**: Firebase Auth + JWT
- **File Upload Support**: Image processing for disease detection