ecommerce-api/
│── node_modules/           # Installed dependencies
│── src/
│   │── config/             # Configuration files (DB, env, etc.)
│   │   ├── db.js           # MongoDB connection setup
│   │   ├── cloudinary.js   # Cloudinary config for image uploads
│   │   ├── payment.js      # Payment gateway (Stripe, PayPal) config
│   │   ├── dotenv.js       # Load environment variables
│   │
│   │── models/             # Database models (Mongoose Schemas)
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Category.js
│   │   ├── Brand.js
│   │   ├── Coupon.js
│   │   ├── Payment.js
│   │   ├── Review.js
│   │   ├── Order.js
│   │   ├── Cart.js
│   │   ├── Wishlist.js
│   │   ├── ShippingMethod.js
│   │
│   │── controllers/        # Controller logic for handling requests
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── productController.js
│   │   ├── categoryController.js
│   │   ├── brandController.js
│   │   ├── couponController.js
│   │   ├── paymentController.js
│   │   ├── reviewController.js
│   │   ├── orderController.js
│   │   ├── cartController.js
│   │   ├── wishlistController.js
│   │   ├── shippingController.js
│   │
│   │── routes/             # API routes
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── productRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── brandRoutes.js
│   │   ├── couponRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── wishlistRoutes.js
│   │   ├── shippingRoutes.js
│   │
│   │── middlewares/        # Middleware functions
│   │   ├── authMiddleware.js     # Protect routes (JWT authentication)
│   │   ├── errorMiddleware.js    # Error handling middleware
│   │   ├── uploadMiddleware.js   # File upload handler
│   │
│   │── utils/              # Utility functions/helpers
│   │   ├── sendEmail.js        # Email sending function (OTP, Reset Password)
│   │   ├── generateToken.js    # JWT token generator
│   │   ├── logger.js           # Logging utility
│   │
│   │── views/              # EJS templates (if needed)
│   │
│   │── server.js           # Main application entry point
│   │── app.js              # Express app setup
│
│── .env                    # Environment variables
│── .gitignore               # Git ignore file
│── package.json             # Project dependencies
│── README.md                # Project documentation


ecommerce-frontend/
│
├── public/
│   └── index.html
│
├── src/
│
│   ├── api/                        # All API calls (Axios wrappers)
│   │   ├── auth.js                 # Login/Register APIs
│   │   ├── product.js              # Product listing, detail APIs
│   │   ├── cart.js                 # Cart-related APIs
│   │   ├── order.js                # Order APIs
│   │   └── axiosConfig.js          # Axios base config
│
│   ├── assets/                     # Static files like images, icons
│   │   └── logo.png
│
│   ├── components/                 # Reusable UI components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── ProductCard.jsx
│   │   ├── Loader.jsx
│   │   └── ProtectedRoute.jsx      # For authenticated routes
│
│   ├── pages/                      # Page-level components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── Cart.jsx
│   │   ├── Wishlist.jsx
│   │   ├── Profile.jsx
│   │   ├── Orders.jsx
│   │   └── NotFound.jsx
│
│   ├── admin/                      # Admin dashboard pages
│   │   ├── Dashboard.jsx
│   │   ├── ManageProducts.jsx
│   │   ├── ManageUsers.jsx
│   │   └── ManageOrders.jsx
│
│   ├── store/                      # Redux Toolkit (if using Redux)
│   │   ├── index.js                # configureStore
│   │   ├── authSlice.js
│   │   ├── productSlice.js
│   │   └── cartSlice.js
│
│   ├── styles/                     # Custom CSS/Tailwind config
│   │   └── index.css
│
│   ├── utils/                      # Helper functions
│   │   ├── formatPrice.js
│   │   ├── authUtils.js            # Token & user utils
│   │   └── constants.js
│
│   ├── App.jsx                     # Main App component with routes
│   ├── main.jsx                    # Entry point (ReactDOM.render)
│   ├── .env                        # For storing API base URLs
│   ├── tailwind.config.js          # If using Tailwind
│   ├── postcss.config.js           # Tailwind config
│   └── vite.config.js              # If using Vite (optional)
│
├── .gitignore
├── package.json
└── README.md
