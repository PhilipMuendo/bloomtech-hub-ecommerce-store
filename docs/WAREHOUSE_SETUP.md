# Warehouse Staff Panel Setup

## Overview
The warehouse staff panel allows warehouse personnel to view orders, customer details, and process orders by changing their status from 'pending' to 'processing'.

## Features

### Warehouse Staff Capabilities:
- **View Orders**: See all orders with customer details
- **Search Orders**: Search by customer name, email, or order ID
- **Process Orders**: Change order status from 'pending' to 'processing'
- **View Customer Details**: See customer information including name, email, phone, and shipping address
- **View Order Items**: See detailed list of items in each order

### Access Control:
- **Warehouse Staff**: Can access warehouse panel and process orders
- **Admin**: Can access both admin panel and warehouse panel
- **SuperAdmin**: Can access admin panel, warehouse panel, and all system features

## Setup Instructions

### 1. Database Migration
Run the migration to add the warehouse role:
```bash
cd backend
npm run migrate
```

### 2. Create Warehouse User
Run the script to create a test warehouse user:
```bash
cd backend
node scripts/create-warehouse-user.js
```

This creates a user with:
- Email: `warehouse@bloomtech.com`
- Password: `warehouse123`
- Role: `warehouse`

### 3. Access the Warehouse Panel
1. Login with warehouse credentials
2. Click on your profile dropdown in the header
3. Select "Warehouse Panel" (green icon)
4. You'll be redirected to `/warehouse`

## User Roles

### Warehouse Staff (`warehouse`)
- Can view and process orders
- Can see customer details
- Cannot access admin panel features

### Admin (`admin`)
- Can access both admin panel and warehouse panel
- Full administrative capabilities

### SuperAdmin (`superadmin`)
- Can access admin panel, warehouse panel, and all system features
- Highest level of access

## API Endpoints

### Warehouse-Accessible Endpoints:
- `GET /api/orders` - Get all orders
- `PUT /api/orders/:id/status` - Update order status (warehouse can change to 'processing')

### Middleware:
- `requireWarehouse` - Allows warehouse, admin, and superadmin access
- `requireAdmin` - Allows admin and superadmin access
- `requireSuperAdmin` - Allows only superadmin access

## Security Features

1. **Role-Based Access Control**: Users can only access features appropriate to their role
2. **Protected Routes**: Warehouse panel is protected and requires authentication
3. **Status Validation**: Only pending orders can be processed
4. **Audit Trail**: Order status changes are logged

## Testing

### Test Warehouse User Login:
1. Go to `/login`
2. Use credentials:
   - Email: `warehouse@bloomtech.com`
   - Password: `warehouse123`
3. After login, you should see "Warehouse Panel" in the dropdown

### Test Order Processing:
1. Create some test orders with 'pending' status
2. Login as warehouse user
3. Go to warehouse panel
4. Click "Process" on pending orders
5. Verify status changes to 'processing'

## Troubleshooting

### Common Issues:

1. **Warehouse Panel not showing in dropdown**
   - Check user role is set to 'warehouse'
   - Verify user is logged in

2. **Cannot process orders**
   - Ensure order status is 'pending'
   - Check user has warehouse role or higher

3. **Database migration errors**
   - Ensure all previous migrations are run
   - Check database connection

### Support:
For issues, check the backend logs and ensure all migrations have been applied successfully. 