# E-Commerce-Website

This is my internship project for an Ecommerce system.

I have completed **Module 1 (Category Management)** and **Module 2 (Order Management)** in this repository.

## Candidate Details

- Name: Shreyash Tekriwal
- Project: Ecommerce Website
- Internship Modules: Module 1 - Category Management & Module 2 - Order Management
- Tech Stack: React, Node.js, Express, SQL

## Tech Stack

- Frontend: React + Vite + Axios  
- Backend: Node.js + Express
- Database: SQLite (relational SQL schema, easy local setup)

## Modules Completed

### Module 1: Category Management
- Create new category
- Category dashboard with list and product count
- Update category name and description
- Soft delete/deactivate using status column
- Product reassignment check before category deactivation

### Module 2: Order Management
- View all customer orders with status filters
- Order dashboard with pending/shipped/delivered/cancelled statistics
- Update order status (Pending → Shipped → Delivered)
- Cancel orders with validation (cannot cancel shipped/delivered)
- Order details modal with order items and customer information
- Soft delete implementation via status column

## Live Deployment Links

- **Frontend**: https://e-commerce-website-woad-eta.vercel.app
- **Backend Health**: https://ecommerce-backend-2s98.onrender.com/api/health

## Project Structure

- `frontend/`: React user interface with Vite build tool
- `backend/`: Express API + SQL schema + database logic
- `backend/scripts/`: Utility scripts for database management

## Database Tables Included

- `users` - User accounts and authentication
- `categories` - Product categories
- `products` - Product catalog
- `cart` - Shopping cart items
- `orders` - Customer orders
- `order_items` - Order line items
- `payment` - Payment records
- `wishlist` - User wishlist items

## How To Run

### 1. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment files

**Backend** (`.env`):
```
NODE_ENV=development
PORT=5000
```

**Frontend** (`.env`):
```
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Start backend server

```bash
cd backend && npm run dev
```

Backend runs on: `http://localhost:5000`

### 4. Start frontend server (new terminal)

```bash
cd frontend && npm run dev
```

Frontend runs on: `http://localhost:5173`

## APIs Reference

### Module 1 - Category Management

- `GET /api/health` - Health check
- `GET /api/categories?status=all|active|inactive` - List categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `PATCH /api/categories/:id/status` - Change category status

### Module 2 - Order Management

- `POST /api/orders` - Place order from cart
- `GET /api/orders?order_status=pending|shipped|delivered` - List orders with filters
- `GET /api/orders/:id` - Get order details with items
- `PUT /api/orders/:id/status` - Update order status
- `PATCH /api/orders/:id/cancel` - Cancel order

## Sample API Requests

### Create Category

```json
POST /api/categories
{
  "category_name": "Electronics",
  "description": "Phones, laptops, and accessories"
}
```

### Update Order Status

```json
PUT /api/orders/1/status
{
  "order_status": "shipped"
}
```

### Cancel Order

```
PATCH /api/orders/1/cancel
```

## Module Features Documentation

### Module 1: Category Management - End User Guide

1. **Open Dashboard** - Frontend loads with category list and stats
2. **Create Category** - Fill form with name and description, click Create
3. **Update Category** - Click Edit, modify details, click Save Changes
4. **Deactivate Category** - Click Deactivate, optionally reassign products
5. **Activate Category** - Filter to Inactive, click Activate
6. **Use Filters** - Switch between All, Active, and Inactive views

### Module 2: Order Management - End User Guide

1. **View Orders** - Dashboard displays all orders with customer details
2. **Filter Orders** - Use status filter to view Pending, Shipped, or Delivered orders
3. **View Order Details** - Click View button to see order items and customer info
4. **Update Status** - From order details modal, update order status as it progresses through workflow
5. **Cancel Order** - Cancel pending orders before shipment
6. **Track Statistics** - Stats cards show total and status breakdown

## End User Screenshots

### Module 1 Screenshots

- Dashboard Overview - ![Overview](frontend/public/screenshots/dashboard-overview.png)
- Filter Inactive State - ![Inactive Filter](frontend/public/screenshots/filter-inactive-empty.png)
- Create Form - ![Create Form](frontend/public/screenshots/create-category-form-filled.png)
- Success Message - ![Success](frontend/public/screenshots/category-created-success.png)
- Deactivated View - ![Deactivated](frontend/public/screenshots/category-deactivated-inactive-view.png)

## Architecture Highlights

- **Soft Delete Pattern**: Uses `status` column (1 for active, 0 for inactive) for data integrity
- **Modular Frontend**: Single App component with navigation between modules
- **RESTful API**: Standard HTTP methods for CRUD operations
- **Responsive Design**: Mobile-friendly CSS Grid layouts
- **Error Handling**: Comprehensive error messages at API and UI levels
- **Separated Concerns**: Controllers handle business logic, routes handle HTTP routing

## Next Modules Planned

- Module 3: Product Management (CRUD + inventory)
- Module 4: Authentication (Admin/User roles)
- Module 5: Cart Management (add/remove items, quantity updates)
- Module 6: Payments and checkout workflow
- Module 7: Wishlist and user profile management
- Module 8: Advanced features (reviews, search, recommendations)
