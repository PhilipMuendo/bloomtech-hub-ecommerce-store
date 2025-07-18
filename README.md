# BloomTech Hub Ecommerce Store

## Overview

BloomTech Hub Ecommerce Store is a modern, full-featured ecommerce platform with a React + TypeScript frontend and a Node.js/Express + MongoDB backend. It provides a seamless online shopping experience for customers and a robust admin interface for store management.

---

## Features

### Customer-Facing
- **Product Catalog**: Browse a wide range of products with detailed descriptions, images, and prices.
- **Product Detail Pages**: View comprehensive information about each product, including images, specifications, and related items.
- **Shopping Cart**: Add, remove, and update products in your cart with real-time price calculations.
- **Wishlist**: Save products for later viewing.
- **Checkout Process**: Streamlined checkout flow for a smooth purchasing experience.
- **Newsletter Signup**: Subscribe to updates and promotions (real backend integration).
- **Product Reviews**: Submit and view reviews; reviews are visible to admin for moderation.
- **Responsive Design**: Fully optimized for desktops, tablets, and all phone sizes. No horizontal scroll on any device.
- **Modern UI Components**: Utilizes shadcn-ui and Tailwind CSS for a clean and consistent look.
- **Context Management**: Uses React Context for managing cart, auth, and wishlist state.
- **Custom Hooks**: Includes reusable hooks for mobile detection, toast notifications, wishlist, reviews, and more.
- **404 Not Found Page**: Friendly error page for invalid routes.

### Admin Panel
- **Dashboard**: Visualize key stats (products, orders, users, reviews, revenue, newsletter subscribers) with responsive charts.
- **Product, User, and Review Management**: View, filter, and manage all products, users, and reviews.
- **Review Moderation**: Approve/reject reviews; only approved reviews show on the storefront.
- **Newsletter Subscribers**: View all newsletter signups in real time.
- **Mobile-First Admin**: All tables, charts, and navigation are fully mobile responsive with horizontal scroll for wide tables.
- **Role-Based Access**: Admin and superadmin roles, with superadmin protected from self-deactivation.

### Backend
- **RESTful API**: Provides endpoints for authentication, cart, orders, wishlist, reviews, newsletter, and more.
- **MongoDB Models**: User, Product, Order, CartItem, Wishlist, Review, Newsletter, BackInStockAlert.
- **Authentication**: JWT-based authentication and authorization middleware.
- **Order Management**: Place and view orders.
- **Wishlist Management**: Add/remove products from wishlist.
- **Cart Management**: Add/remove/update cart items.
- **Newsletter**: Subscribe and view subscribers via API.
- **Logging & Security**: Uses morgan for logging, dotenv for environment variables, and CORS for security.

---

## Technologies Used

### Frontend
- **Vite**: Lightning-fast build tool for modern web projects.
- **React**: Component-based UI library for building interactive interfaces.
- **TypeScript**: Strongly-typed superset of JavaScript for safer code.
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
- **shadcn-ui**: Accessible and customizable React UI components.

### Backend
- **Node.js**: JavaScript runtime for server-side development.
- **Express**: Fast, unopinionated web framework for Node.js.
- **MongoDB**: NoSQL database for storing application data.
- **Mongoose**: ODM for MongoDB.
- **JWT**: Secure authentication.
- **Morgan**: HTTP request logger.
- **Dotenv**: Environment variable management.

---

## Getting Started

### Prerequisites
- Node.js (v16 or higher recommended)
- npm (v8 or higher)
- MongoDB (local or cloud instance)

### Installation

#### 1. Clone the repository
```sh
git clone <YOUR_GIT_URL>
cd bloomtech-hub-ecommerce-store
```

#### 2. Install frontend dependencies
```sh
npm install
```

#### 3. Install backend dependencies
```sh
cd backend
npm install
cd ..
```

#### 4. Set up environment variables
- Create a `.env` file in `backend/` with the following:
  ```env
  MONGO_URI=<your_mongodb_connection_string>
  JWT_SECRET=<your_jwt_secret>
  PORT=5000
  ```

#### 5. Start the backend server
```sh
cd backend
npm run dev
```
- The backend API will run at `http://localhost:5000`

#### 6. Start the frontend dev server
```sh
npm run dev
```
- The frontend app will be available at `http://localhost:8081` by default.

---

## Deployment

### Frontend (Vercel)
- Deploy the frontend to [Vercel](https://vercel.com/) for free. Connect your repo, set the root to the frontend directory, and use the default Vite build settings.

### Backend (Render)
- Deploy the backend to [Render](https://render.com/) (free tier available). Connect your repo, set the root to the backend directory, and set environment variables as above.
- Use [Neon](https://neon.tech/) or [Supabase](https://supabase.com/) for a free cloud database if MongoDB Atlas free tier is unavailable.

---

## Project Structure

- `src/components/` — Reusable UI components (Header, Footer, ProductCard, etc.)
- `src/pages/` — Main pages (Home, Shop, Cart, ProductDetail, About, NotFound, Admin, etc.)
- `src/context/` — React Context for global (Auth, Cart, Wishlist)
- `src/data/` — Static data (e.g., products list)
- `src/hooks/` — Custom React hooks
- `src/lib/` — Utility functions
- `src/assets/` — Images and static assets
- `backend/models/` — Mongoose models (User, Product, Order, CartItem, Wishlist, Review, Newsletter, BackInStockAlert)
- `backend/controllers/` — Route logic for API endpoints
- `backend/routes/` — Express route definitions
- `backend/middleware/` — Auth and other middleware
- `backend/config/` — Database connection config
- `backend/server.js` — Express app entry point

---

## Backend API Endpoints (Highlights)

- `POST   /api/auth/register` — Register a new user
- `POST   /api/auth/login` — Login and receive JWT
- `GET    /api/products` — List all products
- `GET    /api/products/:id` — Get product details
- `GET    /api/products/featured` — Get featured products
- `POST   /api/reviews` — Submit a product review
- `GET    /api/reviews` — Admin: fetch all reviews
- `PUT    /api/reviews/:id/status` — Admin: approve/reject review
- `POST   /api/newsletter` — Subscribe to newsletter
- `GET    /api/subscribers` — Admin: fetch newsletter subscribers
- `GET    /api/cart` — Get user's cart
- `POST   /api/cart` — Add item to cart
- `PUT    /api/cart/:itemId` — Update cart item
- `DELETE /api/cart/:itemId` — Remove item from cart
- `GET    /api/orders` — Get user's orders
- `POST   /api/orders` — Place a new order
- `GET    /api/wishlist` — Get user's wishlist
- `POST   /api/wishlist` — Add item to wishlist
- `DELETE /api/wishlist/:itemId` — Remove item from wishlist

---

## Scripts

### Frontend
- `npm run dev` — Start Vite dev server
- `npm run build` — Build for production
- `npm run preview` — Preview production build
- `npm run lint` — Lint code

### Backend
- `npm run dev` — Start backend with nodemon (auto-restart on changes)
- `npm start` — Start backend normally

---

## License

MIT




