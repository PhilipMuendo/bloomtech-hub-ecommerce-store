# BloomTech Hub Ecommerce Store

## Overview

BloomTech Hub Ecommerce Store is a modern, full-featured ecommerce platform designed to provide a seamless online shopping experience. Built with the latest web technologies, it offers a fast, responsive, and user-friendly interface for both customers and administrators.

## Features

- **Product Catalog**: Browse a wide range of products with detailed descriptions, images, and prices.
- **Product Detail Pages**: View comprehensive information about each product, including images, specifications, and related items.
- **Shopping Cart**: Add, remove, and update products in your cart with real-time price calculations.
- **Checkout Process**: Streamlined checkout flow for a smooth purchasing experience.
- **Responsive Design**: Fully optimized for desktops, tablets, and mobile devices.
- **Modern UI Components**: Utilizes shadcn-ui and Tailwind CSS for a clean and consistent look.
- **Context Management**: Uses React Context for managing cart state and other global data.
- **Custom Hooks**: Includes reusable hooks for mobile detection, toast notifications, and more.
- **404 Not Found Page**: Friendly error page for invalid routes.

## Technologies Used

- **Vite**: Lightning-fast build tool for modern web projects.
- **React**: Component-based UI library for building interactive interfaces.
- **TypeScript**: Strongly-typed superset of JavaScript for safer code.
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
- **shadcn-ui**: Accessible and customizable React UI components.

## Getting Started

### Prerequisites
- Node.js (v16 or higher recommended)
- npm (v8 or higher)

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd bloomtech-hub-ecommerce-store

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173` by default.

## Project Structure

- `src/components/` — Reusable UI components (Header, Footer, ProductCard, etc.)
- `src/pages/` — Main pages (Home, Shop, Cart, ProductDetail, About, NotFound)
- `src/context/` — React Context for global state (e.g., CartContext)
- `src/data/` — Static data (e.g., products list)
- `src/hooks/` — Custom React hooks
- `src/lib/` — Utility functions

## Customization

You can easily extend the platform by adding new pages, components, or integrating with backend APIs for real product data, authentication, and order management.

## Deployment

You can deploy this project to any static hosting provider (e.g., Vercel, Netlify, GitHub Pages) or your own server. To build for production:

```sh
npm run build
```

The output will be in the `dist/` folder.

## License

This project is for educational and demonstration purposes. You may modify and use it as needed for your own projects.
