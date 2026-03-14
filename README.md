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

## Next Modules Planned

- Authentication (Admin/User roles)
- Product Management
- Cart Management
- Order + Payment workflow
- Wishlist and user profile

