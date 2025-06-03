
# StyleMuse

A full-stack e-commerce platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js) featuring a modern UI design and comprehensive e-commerce functionality.

[StyleMuse](https://style-muse.onrender.com/)

## 🌟 Features

- **User Authentication**
  - Secure login and registration
  - JWT-based authentication
  - User profile management

- **Product Management**
  - Browse products with filters and search
  - Detailed product views
  - Product categories and collections
  - Wishlist functionality

- **Shopping Experience**
  - Shopping cart management
  - Secure checkout process
  - Multiple payment methods
  - Order tracking and history

- **Admin Dashboard**
  - Product management
  - Order management
  - User management
  - Analytics and reporting

- **Modern UI/UX**
  - Responsive design
  - Smooth animations
  - Instagram-style product gallery

## 🛠️ Tech Stack

### Frontend
- React.js
- Tailwind CSS
- React Router
- Redux Toolkit
- Axios
- React Icons
- React Toastify

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Stripe Payment Integration

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/ecommerce-app.git
cd ecommerce-app
```

2. Install dependencies
```bash
# Install backend dependencies
cd ecommerce-api
npm install

# Install frontend dependencies
cd ../ecommerce-frontend
npm install
```

3. Set up environment variables
```bash
# In ecommerce-api directory
cp .env.example .env
# Update the .env file with your configuration

# In ecommerce-frontend directory
cp .env.example .env
# Update the .env file with your configuration
```

4. Start the development servers
```bash
# Start backend server (from ecommerce-api directory)
npm run dev

# Start frontend server (from ecommerce-frontend directory)
npm start
```

## 📁 Project Structure

```
ecommerce-app/
├── ecommerce-api/          # Backend server
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   └── utils/            # Utility functions
│
└── ecommerce-frontend/    # Frontend application
    ├── public/           # Static files
    ├── src/
    │   ├── assets/      # Images and fonts
    │   ├── components/  # Reusable components
    │   ├── pages/       # Page components
    │   ├── redux/       # State management
    │   ├── utils/       # Utility functions
    │   └── App.js       # Main application component
    └── package.json
```

## 🔑 Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

## 📝 API Documentation

The API documentation is available at `/api-docs` when running the backend server.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Ramsha Arshad - [My Profile](github.com/ramsha287)

## 🙏 Acknowledgments

- [React Icons](https://react-icons.github.io/react-icons/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Stripe](https://stripe.com/)
- [MongoDB](https://www.mongodb.com/)
