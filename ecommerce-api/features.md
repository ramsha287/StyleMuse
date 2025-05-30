0.Auth Model Features
🔹 Authentication (Auth) Model Features
✅ 1. Register User (Sign Up)
Create a new user with name, email, password, and role.
Hash the password before storing it in the database.
✅ 2. Login User (Sign In)
Authenticate user using email and password.
Compare entered password with stored hashed password.
Generate a JWT token on successful login.
✅ 3. Logout User
Invalidate user session/token.
Implement token blacklisting (optional).
✅ 4. Forgot Password (Reset Password via Email)
Generate and send a reset token via email.
Allow user to reset password using the token.
✅ 5. Update User Profile
Update name, email, avatar, etc.
Ensure email uniqueness when updating.
✅ 6. Change Password
Verify old password before updating.
✅ 7. Delete Account
Allow users to permanently delete their account.
✅ 8. Get User Detail
Retrieve user details (id, name, email, role).



1. User Model Features
🔹 User Management Features
✅ 1. Get All Users (Admin Only)
Retrieve a list of all users from the database.
Access restricted to admin users only.
✅ 2. Get User by ID (Admin & User)
Retrieve details of a specific user by their ID.
Admins can fetch any user; users can only fetch their own data.
✅ 3. Assign Roles (Admin Only)
Allow admins to update user roles (e.g., user, admin, seller).
Ensure only authorized users (admins) can modify roles.
✅ 5. Delete User (Admin Only)
Allow admins to delete user accounts.
Implement soft deletion or permanent removal based on requirements.
✅ 6. Verify email
✅ 7.resendVerificationEmail


2. Product Model Features
🔹 Product Management
✅ Create a Product (Admin)
✅ Update Product Details (Admin)
✅ Delete a Product (Admin)
✅ Get All Products (Pagination, Filtering, Sorting)
✅ Get a Single Product by ID
✅ Search Products by Name, Description, Category, and Brand
✅ Get Products by Category
✅ Get Products by Brand

🔹 Inventory Management
✅ Update Stock Quantity
✅ Mark Product as Out of Stock

3. Category Model Features
🔹 Category Management
✅ Create a Category (Admin)
✅ Update a Category (Admin)
✅ Delete a Category (Admin)
✅ Get All Categories
✅ Get a Single Category

4. Brand Model Features
🔹 Brand Management
✅ Create a Brand (Admin)
✅ Update a Brand (Admin)
✅ Delete a Brand (Admin)
✅ Get All Brands
✅ Get a Single Brand

5. Coupon Model Features
🔹 Discount Management
✅ Create a Discount Coupon (Admin)
✅ Update Coupon Details (Admin)
✅ Delete a Coupon (Admin)
✅ Get All Coupons
✅ Apply Coupon to Cart (User)

6. Payment Model Features
🔹 Payment Processing
✅ Process Payment via PayPal, Stripe, Razorpay, etc.
✅ Save Transaction Details
✅ Verify Payment Status
✅ Refund Processing (Admin)

7. Review Model Features
🔹 Product Reviews & Ratings
✅ Add a Review for a Product (User)
✅ Update User's Review
✅ Delete User's Review
✅ Get All Reviews for a Product
✅ Get Average Rating for a Product
✅ Prevent Users from Reviewing Same Product Multiple Times

8. Order Model Features
🔹 Order Management
✅ Create an Order (User)
✅ Get Order Details (User)
✅ Get All Orders (Admin)
✅ Cancel an Order (User)
✅ Update Order Status (Admin) (Pending, Shipped, Delivered, Cancelled)
✅ Track Order Status

9. Cart Model Features
🔹 Shopping Cart
✅ Add Item to Cart
✅ Update Cart Item Quantity
✅ Remove Item from Cart
✅ Get User's Cart
✅ Empty Cart after Checkout

10. Wishlist Model Features
🔹 Wishlist Management
✅ Add Product to Wishlist
✅ Remove Product from Wishlist
✅ Get User’s Wishlist
✅ Move Item from Wishlist to Cart

11. Shipping Method Model Features
🔹 Shipping & Delivery Options
✅ Add Shipping Method (Admin)
✅ Update Shipping Method (Admin)
✅ Delete Shipping Method (Admin)
✅ Get All Shipping Methods
✅ Select Shipping Method at Checkout

Additional Features
🔹 Admin Dashboard (Manage Users, Orders, Products, etc.)
🔹 Product Recommendations (Similar Products, Best Sellers)
🔹 Order Invoice Generation
🔹 Product Availability Notifications (Stock Updates)
🔹 Multi-Currency & Multi-Language Support