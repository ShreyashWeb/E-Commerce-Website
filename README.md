# E-Commerce-Website

This is my internship project for an Ecommerce system.

I have completed Module 1 (Category Management) in this repository.

## Candidate Details

- Name: Shreyash Tekriwal
- Project: Ecommerce Website
- Internship Module: Module 1 - Category Management
- Tech Stack: React, Node.js, Express, SQL

## Tech Stack

- Frontend: React + Vite + Axios
- Backend: Node.js + Express
- Database: SQLite (relational SQL schema, easy local setup)

## Module Completed

- Category Management
- Features implemented:
  - Create new category
  - Category dashboard with list and product count
  - Update category name and description
  - Soft delete/deactivate using status column
  - Product reassignment check before category deactivation

## Project Structure

- `frontend/`: React user interface
- `backend/`: Express API + SQL schema + database logic

## Database Tables Included

- `users`
- `categories`
- `products`
- `cart`
- `orders`
- `order_items`
- `payment`
- `wishlist`

## How To Run

### 1. Install dependencies

```bash
cd backend
npm install
cd ../frontend
npm install
```

### 2. Configure environment files

Backend

```bash
cp backend/.env.example backend/.env
```

Frontend

```bash
cp frontend/.env.example frontend/.env
```

### 3. Start backend server

```bash
cd backend
npm run dev
```

Backend URL: `http://localhost:5000`

### 4. Start frontend server

```bash
cd frontend
npm run dev
```

Frontend URL: `http://localhost:5173`

## APIs Used In Module 1

- `GET /api/health`
- `GET /api/categories?status=all|active|inactive`
- `POST /api/categories`
- `PUT /api/categories/:id`
- `PATCH /api/categories/:id/status`

### Sample Request - Create Category

```json
{
  "category_name": "Books",
  "description": "Academic and non-academic books"
}
```

### Sample Request - Deactivate With Product Reassignment

```json
{
  "status": false,
  "replacementCategoryId": 2
}
```

## End User Documentation

This section is for end user flow of Module 1.

### Live Links

- Frontend: https://e-commerce-website-woad-eta.vercel.app
- Backend Health: https://ecommerce-backend-2s98.onrender.com/api/health

### How to use this module

### 1. Open dashboard

1. Open the frontend link in browser.
2. Category dashboard page will open.
3. You can see category list and top stats cards.

### 2. Create new category

1. In left form, enter category name.
2. Add short description.
3. Click Create Category button.
4. Success message will show and category appears in table.

### 3. Update category

1. Click Edit button from any row.
2. Selected category data will come into form.
3. Change name or description.
4. Click Save Changes.

### 4. Deactivate category (soft delete)

1. Click Deactivate button in actions.
2. If category has products, system asks for replacement category id.
3. Category status changes to Inactive.
4. Data is not deleted from database, only status is changed.

### 5. Activate category again

1. Change filter to Inactive.
2. Click Activate button for that category.
3. Category will move back to Active list.

### 6. Use filter options

1. Filter dropdown has All, Active, Inactive.
2. You can check records based on selected status.
3. Empty table message is shown if no category in that filter.

## End User Screenshots (Module 1)

Screenshots preview in README:

### 1. Dashboard Overview

![Dashboard Overview](frontend/public/screenshots/dashboard-overview.png)

### 2. Inactive Filter With Empty State

![Inactive Filter Empty State](frontend/public/screenshots/filter-inactive-empty.png)

### 3. Create Category Form Filled

![Create Category Form](frontend/public/screenshots/create-category-form-filled.png)

### 4. Category Created Success

![Category Created Success](frontend/public/screenshots/category-created-success.png)

### 5. Category Deactivated And Filtered Inactive

![Category Deactivated Inactive View](frontend/public/screenshots/category-deactivated-inactive-view.png)

## Next Modules Planned

- Authentication (Admin/User roles)
- Product Management
- Cart Management
- Order + Payment workflow
- Wishlist and user profile
