# BloomTech Hub Ecommerce Store

## Overview

BloomTech Hub Ecommerce Store is a modern, full-featured ecommerce platform with a React + TypeScript frontend and a Node.js/Express + MySQL backend. It provides a seamless online shopping experience for customers and a robust admin interface for store management, with integrated payment gateways including M-Pesa and Pesapal.

---

## Features

### Customer-Facing
- **Product Catalog**: Browse a wide range of products with detailed descriptions, images, and prices
- **Product Detail Pages**: View comprehensive information about each product, including images, specifications, and related items
- **Shopping Cart**: Add, remove, and update products in your cart with real-time price calculations
- **Wishlist**: Save products for later viewing
- **Checkout Process**: Streamlined checkout flow with multiple payment options
- **Payment Integration**: 
  - M-Pesa mobile money payments (for orders under KSH 500,000)
  - Pesapal card and mobile money payments (for orders under KSH 500,000)
  - **Bank Transfer System**: For high-value orders (KSH 500,000+) with proforma invoice generation
  - Secure payment processing with webhook callbacks
- **Newsletter Signup**: Subscribe to updates and promotions (real backend integration)
- **Product Reviews**: Submit and view reviews; reviews are visible to admin for moderation
- **Quote System**: Request custom quotes for bulk orders or special requirements
- **Back-in-Stock Alerts**: Get notified when out-of-stock items become available
- **Contact Form**: Customer support and inquiry system
- **Pickup Point Selection**: Choose from all 47 counties in Kenya for order pickup
- **Responsive Design**: Fully optimized for desktops, tablets, and all phone sizes
- **Modern UI Components**: Utilizes shadcn-ui and Tailwind CSS for a clean and consistent look
- **Context Management**: Uses React Context for managing cart, auth, and wishlist state
- **Custom Hooks**: Includes reusable hooks for mobile detection, toast notifications, wishlist, reviews, and more
- **404 Not Found Page**: Friendly error page for invalid routes

### Admin Panel
- **Dashboard**: Visualize key stats (products, orders, users, reviews, revenue, newsletter subscribers) with responsive charts
- **Product Management**: View, filter, add, edit, and manage all products with image uploads
- **Order Management**: Track orders, update statuses, and manage fulfillment
- **Bank Transfer Orders**: Dedicated interface for managing high-value bank transfer orders with payment confirmation
- **User Management**: View and manage user accounts, roles, and permissions
- **Review Moderation**: Approve/reject reviews; only approved reviews show on the storefront
- **Quote Management**: Handle custom quote requests and convert them to orders
- **Contact Messages**: Manage customer inquiries and support requests with simplified status tracking (New/Read)
- **Newsletter Subscribers**: View all newsletter signups in real time
- **Transaction Tracking**: Monitor payment transactions and statuses

- **Mobile-First Admin**: All tables, charts, and navigation are fully mobile responsive
- **Role-Based Access**: Admin and superadmin roles, with superadmin protected from self-deactivation
- **Data Export**: Export data to CSV format for analysis

### Backend
- **RESTful API**: Provides endpoints for authentication, cart, orders, wishlist, reviews, newsletter, payments, and more
- **MySQL Database**: Robust relational database with Sequelize ORM
- **Authentication**: JWT-based authentication and authorization middleware
- **Payment Processing**: 
  - M-Pesa STK push integration (for orders under KSH 500,000)
  - Pesapal payment gateway integration (for orders under KSH 500,000)
  - **Bank Transfer System**: Proforma invoice generation and payment confirmation for high-value orders
  - Webhook handling for payment callbacks
- **Order Management**: Place, track, and manage orders with status updates
- **Wishlist Management**: Add/remove products from wishlist
- **Cart Management**: Add/remove/update cart items
- **Quote System**: Handle custom quote requests and conversions
- **Contact System**: Manage customer inquiries and support requests
- **Newsletter**: Subscribe and view subscribers via API
- **Email Integration**: Nodemailer for transactional emails with templated email support
- **File Upload**: Multer for handling image uploads
- **Logging & Security**: Uses morgan for logging, dotenv for environment variables, and CORS for security

---

## Technologies Used

### Frontend
- **Vite**: Lightning-fast build tool for modern web projects
- **React 18**: Component-based UI library for building interactive interfaces
- **TypeScript**: Strongly-typed superset of JavaScript for safer code
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **shadcn-ui**: Accessible and customizable React UI components
- **React Router**: Client-side routing for single-page application
- **React Query**: Data fetching and caching library
- **Framer Motion**: Animation library for smooth transitions
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation library

### Backend
- **Node.js**: JavaScript runtime for server-side development
- **Express**: Fast, unopinionated web framework for Node.js
- **MySQL**: Relational database for storing application data
- **Sequelize**: ORM for MySQL database management
- **JWT**: Secure authentication with JSON Web Tokens
- **bcryptjs**: Password hashing for security
- **Morgan**: HTTP request logger
- **Dotenv**: Environment variable management
- **Multer**: File upload handling
- **Nodemailer**: Email sending functionality
- **CORS**: Cross-origin resource sharing

### Payment Gateways
- **M-Pesa**: Mobile money payment integration
- **Pesapal**: Multi-payment method gateway
- **Webhook Handling**: Secure payment callback processing

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v8 or higher)
- MySQL (v8.0 or higher)
- Git

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

#### 4. Set up MySQL database
```sh
# Create database
mysql -u root -p
CREATE DATABASE bloomtech_db;
CREATE DATABASE bloomtech_db_test;
EXIT;
```

#### 5. Set up environment variables
- Create a `.env` file in `backend/` with the following:
  ```env
  # Database Configuration
  DB_HOST=localhost
  DB_USER=root
  DB_PASSWORD=your_mysql_password
  DB_NAME=bloomtech_db
  DB_TEST_NAME=bloomtech_db_test
  
  # JWT Configuration
  JWT_SECRET=your_jwt_secret_key
  
  # Server Configuration
  PORT=5000
  NODE_ENV=development
  
  # Email Configuration
  EMAIL_HOST=smtp.gmail.com
  EMAIL_PORT=587
  EMAIL_USER=your_email@gmail.com
  EMAIL_PASS=your_email_app_password
  
  # M-Pesa Configuration
  MPESA_CONSUMER_KEY=your_mpesa_consumer_key
  MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
  MPESA_SHORTCODE=your_mpesa_shortcode
  MPESA_PASSKEY=your_mpesa_passkey
  MPESA_CALLBACK_URL=https://your-domain.com/api/payments/mpesa/callback
  
  # Pesapal Configuration
  PESAPAL_CONSUMER_KEY=your_pesapal_consumer_key
  PESAPAL_CONSUMER_SECRET=your_pesapal_consumer_secret
  PESAPAL_CALLBACK_URL=https://your-domain.com/api/payments/pesapal/callback
  ```

#### 6. Set up the database
```sh
cd backend
npm run db:setup
npm run migrate
npm run db:seed
cd ..
```

#### 7. Start the backend server
```sh
cd backend
npm run dev
```
- The backend API will run at `http://localhost:5000`

#### 8. Start the frontend dev server
```sh
npm run dev
```
- The frontend app will be available at `http://localhost:5173` by default

---

## Database Setup

The project uses MySQL with Sequelize ORM. The database includes the following main tables:

- **Users**: User accounts, authentication, and profiles
- **Products**: Product catalog with images and details
- **Orders**: Order management and tracking
- **OrderItems**: Individual items within orders
- **CartItems**: Shopping cart functionality
- **Wishlists**: User wishlist management
- **Reviews**: Product reviews and ratings
- **Quotes**: Custom quote requests
- **QuoteItems**: Items within custom quotes
- **Transactions**: Payment transaction records
- **BackInStockAlerts**: Stock notification system
- **Newsletters**: Newsletter subscription management

- **ContactMessages**: Customer support and inquiry management

---

## Payment Integration

### M-Pesa Integration
- STK push for mobile money payments
- Webhook callbacks for payment confirmation
- Transaction status tracking

### Pesapal Integration
- Multi-payment method support (cards, mobile money)
- Secure payment processing
- Real-time payment status updates

### Bank Transfer System
- Automatic detection for orders exceeding KSH 500,000
- Proforma invoice generation with business bank details
- Email notifications to customers with payment instructions
- Manual payment confirmation by admin team
- Tax invoice generation upon payment approval

### Payment Flow
1. User selects payment method during checkout
2. Payment gateway integration initiates payment
3. User completes payment on gateway
4. Webhook callback updates order status
5. User receives confirmation

---

## Deployment

### Frontend (Vercel/Netlify)
- Deploy the frontend to [Vercel](https://vercel.com/) or [Netlify](https://netlify.com/)
- Connect your repository and set the build command to `npm run build`
- Set environment variables for API endpoints

### Backend (Render/Railway)
- Deploy the backend to [Render](https://render.com/) or [Railway](https://railway.app/)
- Set environment variables for database and payment gateways
- Configure webhook URLs for payment callbacks

### Database (Cloud)
- Use [PlanetScale](https://planetscale.com/), [Railway](https://railway.app/), or [Supabase](https://supabase.com/) for MySQL hosting
- Update database connection strings in environment variables

---

## Project Structure

```
bloomtech-hub-ecommerce-store/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Main application pages
│   ├── context/            # React Context providers
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── types/              # TypeScript type definitions
│   └── assets/             # Static assets
├── backend/
│   ├── controllers/        # API route handlers
│   ├── models/             # Sequelize models
│   ├── routes/             # Express route definitions
│   ├── middleware/         # Authentication and other middleware
│   ├── migrations/         # Database migrations
│   ├── scripts/            # Database setup and utility scripts
│   └── config/             # Database and app configuration
├── public/                 # Static files
└── docs/                   # Documentation
```

---

## API Endpoints

### Authentication
- `POST   /api/auth/register` — Register a new user
- `POST   /api/auth/login` — Login and receive JWT
- `POST   /api/auth/verify-email` — Verify email address
- `POST   /api/auth/resend-verification` — Resend verification email
- `POST   /api/auth/forgot-password` — Request password reset
- `POST   /api/auth/reset-password` — Reset password

### Products
- `GET    /api/products` — List all products
- `GET    /api/products/:id` — Get product details
- `GET    /api/products/featured` — Get featured products
- `POST   /api/products` — Admin: Create new product
- `PUT    /api/products/:id` — Admin: Update product
- `DELETE /api/products/:id` — Admin: Delete product

### Orders
- `GET    /api/orders` — Get user's orders
- `POST   /api/orders` — Place a new order
- `GET    /api/orders/:id` — Get order details
- `PUT    /api/orders/:id/status` — Admin: Update order status

### Cart
- `GET    /api/cart` — Get user's cart
- `POST   /api/cart` — Add item to cart
- `PUT    /api/cart/:itemId` — Update cart item
- `DELETE /api/cart/:itemId` — Remove item from cart

### Wishlist
- `GET    /api/wishlist` — Get user's wishlist
- `POST   /api/wishlist` — Add item to wishlist
- `DELETE /api/wishlist/:itemId` — Remove item from wishlist

### Reviews
- `GET    /api/reviews` — Get product reviews
- `POST   /api/reviews` — Submit a product review
- `PUT    /api/reviews/:id/status` — Admin: Approve/reject review

### Payments
- `POST   /api/payments/mpesa/initiate` — Initiate M-Pesa payment
- `POST   /api/payments/mpesa/callback` — M-Pesa webhook callback
- `POST   /api/payments/pesapal/initiate` — Initiate Pesapal payment
- `POST   /api/payments/pesapal/callback` — Pesapal webhook callback

### Admin
- `GET    /api/admin/dashboard` — Admin dashboard statistics
- `GET    /api/admin/users` — Admin: Get all users
- `GET    /api/admin/orders` — Admin: Get all orders
- `GET    /api/admin/quotes` — Admin: Get all quotes
- `GET    /api/admin/newsletter` — Admin: Get newsletter subscribers
- `GET    /api/admin/contact-messages` — Admin: Get contact messages

### Bank Transfer
- `GET    /api/bank-transfer/bank-details` — Get business bank details
- `POST   /api/bank-transfer/generate-invoice/:orderId` — Generate proforma invoice
- `POST   /api/bank-transfer/confirm-payment/:orderId` — Confirm bank transfer payment
- `GET    /api/bank-transfer/orders` — Get bank transfer orders

### Contact
- `POST   /api/contact` — Submit contact form
- `GET    /api/contact/messages` — Admin: Get contact messages
- `PUT    /api/contact/messages/:id/status` — Admin: Update message status
- `DELETE /api/contact/messages/:id` — Admin: Delete contact message

---

## Available Scripts

### Frontend
- `npm run dev` — Start Vite dev server
- `npm run build` — Build for production
- `npm run preview` — Preview production build
- `npm run lint` — Lint code with ESLint

### Backend
- `npm run dev` — Start backend with nodemon (auto-restart on changes)
- `npm start` — Start backend normally
- `npm test` — Run tests
- `npm run migrate` — Run database migrations
- `npm run migrate:undo` — Undo last migration
- `npm run db:setup` — Set up database tables
- `npm run db:seed` — Seed database with sample data
- `npm run db:reset` — Reset database (undo all migrations, migrate, seed)

---

## Environment Variables

### Required Environment Variables
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bloomtech_db
DB_TEST_NAME=bloomtech_db_test

# JWT
JWT_SECRET=your_jwt_secret

# Server
PORT=5000
NODE_ENV=development

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password

# M-Pesa
MPESA_CONSUMER_KEY=your_mpesa_key
MPESA_CONSUMER_SECRET=your_mpesa_secret
MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://your-domain.com/api/payments/mpesa/callback

# Pesapal
PESAPAL_CONSUMER_KEY=your_pesapal_key
PESAPAL_CONSUMER_SECRET=your_pesapal_secret
PESAPAL_CALLBACK_URL=https://your-domain.com/api/payments/pesapal/callback
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Support

For support, email support@bloomtechub.com or create an issue in the repository.

---

## Changelog

### v2.1.0 (Current)
- **Bank Transfer System**: Added support for high-value orders (KSH 500,000+) with proforma invoice generation
- **Contact System**: Implemented customer support and inquiry management with simplified status tracking
- **Pickup Points**: Added all 47 counties in Kenya for order pickup selection
- **Email Templates**: Enhanced email system with templated emails for invoices and notifications
- **Admin Enhancements**: Added dedicated bank transfer orders management interface
- **Payment Thresholds**: Automatic payment method selection based on order value
- **Simplified Contact Management**: Streamlined contact message status to New/Read only
- **Enhanced Security**: Improved validation and error handling

### v2.0.0
- Migrated from MongoDB to MySQL with Sequelize ORM
- Added M-Pesa and Pesapal payment integrations
- Enhanced admin dashboard with comprehensive analytics
- Improved user experience with better UI/UX
- Added quote system for custom orders
- Implemented back-in-stock alerts
- Enhanced security with improved authentication
- Added comprehensive error handling and logging

### v1.0.0
- Initial release with basic ecommerce functionality
- MongoDB backend with Mongoose ODM
- Basic payment processing
- Admin dashboard
- User authentication and authorization




