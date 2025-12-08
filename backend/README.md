# Farm2Fork Backend API

A complete Node.js/Express backend API for the Farm2Fork e-commerce application.

## Features

- User authentication with JWT
- Product management
- Shopping cart functionality
- Order processing
- MongoDB database integration
- CORS enabled for frontend integration

## Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── cartController.js    # Cart management logic
│   ├── orderController.js   # Order processing logic
│   └── productController.js # Product management logic
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── models/
│   ├── Cart.js              # Cart schema
│   ├── Order.js             # Order schema
│   ├── Product.js           # Product schema
│   └── User.js              # User schema
├── routes/
│   ├── authRoutes.js        # Authentication routes
│   ├── cartRoutes.js        # Cart routes
│   ├── orderRoutes.js       # Order routes
│   └── productRoutes.js     # Product routes
├── utils/
│   └── jwt.js               # JWT utility functions
├── .env                     # Environment variables
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore file
├── package.json             # Project dependencies
└── server.js                # Express server entry point
```

## Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Ensure MongoDB is running locally or update MONGODB_URI in .env

4. Start the server:
```bash
npm start
# or for development with auto-restart:
npm run dev
```

The server will run on http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (authenticated)
- `PUT /api/auth/profile` - Update user profile (authenticated)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product

### Cart













































- `GET /api/cart` - Get user cart (authenticated)
- `POST /api/cart` - Add item to cart (authenticated)
- `PUT /api/cart/:id` - Update cart item (authenticated)
- `DELETE /api/cart/:id` - Remove cart item (authenticated)

### Orders
- `GET /api/orders` - Get user orders (authenticated)
- `POST /api/orders` - Place new order (authenticated)

## Authentication

Protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Environment Variables

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)

## CORS Configuration

The API is configured to accept requests from http://localhost:5173 (frontend URL).

## Database Models

### User
- name (String, required)
- email (String, required, unique)
- password (String, required, hashed)
- createdAt (Date)

### Product
- name (String, required)
- description (String, required)
- price (Number, required)
- image (String, required)
- stock (Number, required)
- createdAt (Date)

### Cart
- userId (ObjectId, ref: User)
- productId (ObjectId, ref: Product)
- quantity (Number, required)
- createdAt (Date)

### Order
- userId (ObjectId, ref: User)
- products (Array of product details)
- totalPrice (Number, required)
- status (String, enum: pending/processing/shipped/delivered/cancelled)
- createdAt (Date)
