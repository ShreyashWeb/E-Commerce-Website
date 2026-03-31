const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });

const outputPath = path.join(__dirname, 'Module-8-Review-and-Rating-Management.pdf');
const writeStream = fs.createWriteStream(outputPath);

doc.pipe(writeStream);

// Title
doc.font('Helvetica-Bold', 28)
  .text('Module 8: Review and Rating Management', { align: 'center' })
  .moveDown(0.5);

doc.font('Helvetica', 12)
  .text('E-Commerce Platform - Internship Project', { align: 'center', color: '#666' })
  .moveDown(1);

// Table of Contents
doc.font('Helvetica-Bold', 14)
  .text('Table of Contents', { underline: true })
  .moveDown(0.5);

doc.font('Helvetica', 11)
  .text('1. Introduction and Objectives', { indent: 20 })
  .text('2. Functionalities Overview', { indent: 20 })
  .text('3. Database Design', { indent: 20 })
  .text('4. Architecture & Implementation', { indent: 20 })
  .text('5. API Endpoints', { indent: 20 })
  .text('6. Frontend Components', { indent: 20 })
  .text('7. Usage Examples', { indent: 20 })
  .text('8. Deployment & Testing', { indent: 20 })
  .moveDown(1);

// Page Break
doc.addPage();

// 1. Introduction
doc.font('Helvetica-Bold', 16)
  .text('1. Introduction and Objectives', { underline: true })
  .moveDown(0.5);

doc.font('Helvetica', 11)
  .text(
    'The Review and Rating Management Module enables customers to share their product experiences and helps the platform build social proof through ratings and reviews. This module includes customer review submission, admin moderation capabilities, and public review display with rating aggregation.',
    { align: 'left' }
  )
  .moveDown(0.5);

doc.font('Helvetica-Bold', 12)
  .text('Key Objectives:')
  .moveDown(0.3);

doc.font('Helvetica', 11)
  .text('• Allow customers to submit reviews and ratings for purchased products', { indent: 20 })
  .text('• Provide admin moderation dashboard to approve/reject reviews', { indent: 20 })
  .text('• Display public reviews and average ratings on product pages', { indent: 20 })
  .text('• Prevent duplicate reviews from the same customer for one product', { indent: 20 })
  .text('• Allow customers to update and delete their own reviews', { indent: 20 })
  .text('• Track review moderation workflow (pending → approved/rejected)', { indent: 20 })
  .moveDown(0.5);

// 2. Functionalities
doc.addPage();
doc.font('Helvetica-Bold', 16)
  .text('2. Functionalities Overview', { underline: true })
  .moveDown(0.5);

const functionalities = [
  {
    title: 'Add Review',
    description: 'Customers submit new reviews with rating (1-5 stars) and optional text. System validates product/customer existence and prevents duplicate reviews.',
  },
  {
    title: 'View Product Reviews',
    description: 'Retrieve all reviews for a specific product, filter by approval status, and calculate average rating.',
  },
  {
    title: 'View Customer Reviews',
    description: 'Get all reviews submitted by a specific customer across all products.',
  },
  {
    title: 'Admin Moderation Dashboard',
    description: 'Review all submitted reviews with moderation status, approve/reject reviews, and view aggregate statistics.',
  },
  {
    title: 'Moderate Review',
    description: 'Admin action to approve (status=1), reject (status=2), or keep in pending (status=0) state.',
  },
  {
    title: 'Update Review',
    description: 'Customer can edit their own review rating and text. Updated reviews return to pending status for re-moderation.',
  },
  {
    title: 'Delete Review',
    description: 'Customer can delete their own reviews, or admin can delete any review.',
  },
];

functionalities.forEach((func, index) => {
  doc.font('Helvetica-Bold', 11)
    .text(`${index + 1}. ${func.title}`)
    .moveDown(0.2);

  doc.font('Helvetica', 10)
    .text(func.description, { align: 'left' })
    .moveDown(0.4);
});

// 3. Database Design
doc.addPage();
doc.font('Helvetica-Bold', 16)
  .text('3. Database Design', { underline: true })
  .moveDown(0.5);

doc.font('Helvetica-Bold', 12)
  .text('Reviews Table Schema:')
  .moveDown(0.3);

doc.font('Helvetica', 10)
  .text(
    'CREATE TABLE IF NOT EXISTS reviews (\n' +
    '  review_id INTEGER PRIMARY KEY AUTOINCREMENT,\n' +
    '  product_id INTEGER NOT NULL,\n' +
    '  customer_id INTEGER NOT NULL,\n' +
    '  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),\n' +
    '  review_text VARCHAR(1000),\n' +
    '  status INTEGER DEFAULT 0,\n' +
    '  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n' +
    '  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n' +
    '  UNIQUE(product_id, customer_id),\n' +
    '  FOREIGN KEY (product_id) REFERENCES products(product_id),\n' +
    '  FOREIGN KEY (customer_id) REFERENCES users(user_id)\n' +
    ');',
    { font: 'Courier', size: 9 }
  )
  .moveDown(0.5);

doc.font('Helvetica-Bold', 11)
  .text('Column Definitions:')
  .moveDown(0.3);

const columns = [
  { name: 'review_id', type: 'INTEGER', desc: 'Primary key, auto-increment' },
  { name: 'product_id', type: 'INTEGER', desc: 'Foreign key to products table' },
  { name: 'customer_id', type: 'INTEGER', desc: 'Foreign key to users table' },
  { name: 'rating', type: 'INTEGER', desc: 'Rating value 1-5, enforced via CHECK constraint' },
  { name: 'review_text', type: 'VARCHAR(1000)', desc: 'Optional review comment' },
  {
    name: 'status',
    type: 'INTEGER',
    desc: '0=Pending moderation, 1=Approved, 2=Rejected',
  },
  { name: 'created_at', type: 'DATETIME', desc: 'Timestamp when review was created' },
  { name: 'updated_at', type: 'DATETIME', desc: 'Timestamp of last update' },
];

doc.font('Helvetica', 10);
columns.forEach((col) => {
  doc.text(`• ${col.name} (${col.type}): ${col.desc}`, { indent: 15 });
});

doc.moveDown(0.5);

doc.font('Helvetica-Bold', 11)
  .text('Constraints:')
  .moveDown(0.3);

doc.font('Helvetica', 10)
  .text('• UNIQUE(product_id, customer_id): Prevents duplicate reviews from same customer for one product', { indent: 15 })
  .text('• CHECK (rating >= 1 AND rating <= 5): Ensures valid rating range', { indent: 15 })
  .text('• FOREIGN KEY constraints: Maintain referential integrity', { indent: 15 });

// 4. Architecture & Implementation
doc.addPage();
doc.font('Helvetica-Bold', 16)
  .text('4. Architecture & Implementation', { underline: true })
  .moveDown(0.5);

doc.font('Helvetica-Bold', 12)
  .text('Backend Architecture:')
  .moveDown(0.3);

doc.font('Helvetica', 10)
  .text('File: backend/src/controllers/reviewsController.js')
  .text('• 7 exported functions implementing all review operations')
  .text('• Input validation and business logic enforcement')
  .text('• Error handling with descriptive messages')
  .moveDown(0.3);

doc.text('File: backend/src/routes/reviews.js')
  .text('• 7 HTTP endpoints for review operations')
  .text('• Proper HTTP method utilization (GET/POST/PUT/DELETE/PATCH)')
  .text('• Request/response handling')
  .moveDown(0.3);

doc.text('Database Integration (backend/src/db.js):')
  .text('• ensureReviewsTable() creates reviews table on startup')
  .text('• SQLite promise wrapper for async/await support')
  .text('• Automatic database initialization')
  .moveDown(0.5);

doc.font('Helvetica-Bold', 12)
  .text('Frontend Architecture:')
  .moveDown(0.3);

doc.font('Helvetica', 10)
  .text('File: frontend/src/api.js')
  .text('• 7 async API methods for backend communication')
  .text('• Axios-based HTTP client with error handling')
  .text('• Base URL from environment variables')
  .moveDown(0.3);

doc.text('File: frontend/src/ReviewManagement.jsx')
  .text('• Multi-tab component: Dashboard, Add, Product, Customer')
  .text('• Admin moderation interface with approve/reject actions')
  .text('• Customer review submission and management')
  .text('• Real-time status updates')
  .moveDown(0.3);

// 5. API Endpoints
doc.addPage();
doc.font('Helvetica-Bold', 16)
  .text('5. API Endpoints', { underline: true })
  .moveDown(0.5);

const endpoints = [
  {
    method: 'POST',
    path: '/api/reviews',
    desc: 'Add new review',
    body: '{ product_id, customer_id, rating, review_text }',
  },
  {
    method: 'GET',
    path: '/api/reviews/product/:product_id',
    desc: 'Get reviews for product (filter by status)',
    params: '?status=approved|pending|all',
  },
  {
    method: 'GET',
    path: '/api/reviews/customer/:customer_id',
    desc: "Get all reviews by customer",
    params: 'None',
  },
  {
    method: 'GET',
    path: '/api/reviews/admin/dashboard',
    desc: 'Admin dashboard with stats (total, approved, pending, rejected, avg_rating)',
    params: '?status=all|approved|pending|rejected',
  },
  {
    method: 'PATCH',
    path: '/api/reviews/:review_id/moderate',
    desc: 'Approve or reject review',
    body: '{ action: "approve"|"reject" }',
  },
  {
    method: 'PUT',
    path: '/api/reviews/:review_id',
    desc: 'Update review (customer can update own reviews)',
    body: '{ rating, review_text, customer_id }',
  },
  {
    method: 'DELETE',
    path: '/api/reviews/:review_id',
    desc: 'Delete review (customer owns or admin)',
    body: '{ customer_id, is_admin }',
  },
];

doc.font('Helvetica', 10);
endpoints.forEach((endpoint, index) => {
  doc.font('Helvetica-Bold', 10)
    .text(`${index + 1}. ${endpoint.method} ${endpoint.path}`)
    .moveDown(0.2);

  doc.font('Helvetica', 9)
    .text(endpoint.desc, { indent: 10 })
    .moveDown(0.1);

  if (endpoint.body) {
    doc.text(`Body: ${endpoint.body}`, { indent: 10, color: '#666' });
  }

  if (endpoint.params) {
    doc.text(`Params: ${endpoint.params}`, { indent: 10, color: '#666' });
  }

  doc.moveDown(0.3);
});

// 6. Frontend Components
doc.addPage();
doc.font('Helvetica-Bold', 16)
  .text('6. Frontend Components', { underline: true })
  .moveDown(0.5);

doc.font('Helvetica-Bold', 12)
  .text('ReviewManagement.jsx - Tab Views:')
  .moveDown(0.3);

doc.font('Helvetica', 10)
  .text('Admin Dashboard Tab:', { underline: true })
  .text('• Displays all reviews with moderation status', { indent: 15 })
  .text('• Filter by approved/pending/rejected', { indent: 15 })
  .text('• Shows statistics: total, approved, pending, rejected, average rating', { indent: 15 })
  .text('• Action buttons: Edit, Approve, Reject, Delete', { indent: 15 })
  .moveDown(0.3);

doc.text('Add Review Tab:', { underline: true })
  .text('• Form for customers to submit new review', { indent: 15 })
  .text('• Fields: Product ID, Customer ID, Rating (1-5), Review Text', { indent: 15 })
  .text('• Input validation and duplicate prevention', { indent: 15 })
  .moveDown(0.3);

doc.text('Product Reviews Tab:', { underline: true })
  .text('• Search reviews by product ID', { indent: 15 })
  .text('• Filter by approval status', { indent: 15 })
  .text('• Display reviews with customer name, rating, and text', { indent: 15 })
  .moveDown(0.3);

doc.text('Customer Reviews Tab:', { underline: true })
  .text('• Search reviews by customer ID', { indent: 15 })
  .text('• Display customer\'s reviews across all products', { indent: 15 })
  .text('• Edit/Delete actions for customer\'s own reviews', { indent: 15 });

// 7. Usage Examples
doc.addPage();
doc.font('Helvetica-Bold', 16)
  .text('7. Usage Examples', { underline: true })
  .moveDown(0.5);

doc.font('Helvetica-Bold', 12)
  .text('Example 1: Customer Submits Review')
  .moveDown(0.2);

doc.font('Helvetica', 9)
  .text(
    'POST /api/reviews\n' +
    'Body: {\n' +
    '  "product_id": 1,\n' +
    '  "customer_id": 5,\n' +
    '  "rating": 5,\n' +
    '  "review_text": "Excellent product, highly recommended!"\n' +
    '}',
    { font: 'Courier', size: 9 }
  )
  .moveDown(0.3);

doc.font('Helvetica-Bold', 12)
  .text('Example 2: Admin Approves Review')
  .moveDown(0.2);

doc.font('Helvetica', 9)
  .text(
    'PATCH /api/reviews/10/moderate\n' +
    'Body: {\n' +
    '  "action": "approve"\n' +
    '}',
    { font: 'Courier', size: 9 }
  )
  .moveDown(0.3);

doc.font('Helvetica-Bold', 12)
  .text('Example 3: Get Product Reviews')
  .moveDown(0.2);

doc.font('Helvetica', 9)
  .text(
    'GET /api/reviews/product/1?status=approved\n' +
    'Response: {\n' +
    '  "data": [\n' +
    '    {\n' +
    '      "review_id": 5,\n' +
    '      "product_name": "Product A",\n' +
    '      "full_name": "John Doe",\n' +
    '      "rating": 5,\n' +
    '      "review_text": "Great!",\n' +
    '      "status": 1,\n' +
    '      "created_at": "2024-01-15 10:30:00"\n' +
    '    }\n' +
    '  ]\n' +
    '}',
    { font: 'Courier', size: 8 }
  );

// 8. Deployment & Testing
doc.addPage();
doc.font('Helvetica-Bold', 16)
  .text('8. Deployment & Testing', { underline: true })
  .moveDown(0.5);

doc.font('Helvetica-Bold', 12)
  .text('Local Testing Steps:')
  .moveDown(0.3);

doc.font('Helvetica', 10)
  .text('1. Start backend server: npm start (in backend/)', { indent: 10 })
  .text('2. Database initializes with reviews table', { indent: 10 })
  .text('3. Frontend component accessible at Module 8 in navigation', { indent: 10 })
  .text('4. Test each tab: Dashboard, Add, Product, Customer', { indent: 10 })
  .text('5. Verify approve/reject moderation flow', { indent: 10 })
  .text('6. Test duplicate review prevention', { indent: 10 })
  .moveDown(0.5);

doc.font('Helvetica-Bold', 12)
  .text('Production Deployment:')
  .moveDown(0.3);

doc.font('Helvetica', 10)
  .text('Backend: Deployed to Render.com', { indent: 10 })
  .text('• Automatic deployment from GitHub main branch', { indent: 10 })
  .text('• Reviews endpoints available on https://ecommerce-backend-2s98.onrender.com/api/reviews', { indent: 10 })
  .moveDown(0.3);

doc.text('Frontend: Deployed to Vercel.com', { indent: 10 })
  .text('• Automatic deployment from GitHub main branch', { indent: 10 })
  .text('• Frontend accessible at https://e-commerce-website-woad-eta.vercel.app', { indent: 10 })
  .text('• Module 8 navigation available in sidebar', { indent: 10 })
  .moveDown(0.5);

doc.font('Helvetica-Bold', 12)
  .text('Test Coverage:')
  .moveDown(0.3);

doc.font('Helvetica', 10)
  .text('✓ Add review - validates product/customer, prevents duplicates', { indent: 10 })
  .text('✓ Get product reviews - filters by status, calculates average', { indent: 10 })
  .text('✓ Admin dashboard - shows stats and all reviews', { indent: 10 })
  .text('✓ Moderate review - approve/reject workflow', { indent: 10 })
  .text('✓ Update review - customer can edit, status resets', { indent: 10 })
  .text('✓ Delete review - permission checks enforced', { indent: 10 })
  .moveDown(1);

// Summary
doc.addPage();
doc.font('Helvetica-Bold', 16)
  .text('Summary', { underline: true })
  .moveDown(0.5);

doc.font('Helvetica', 11)
  .text(
    'Module 8 successfully implements a complete review and rating management system for the e-commerce platform. The module includes database schema with proper constraints, backend controllers and routes for all operations, and a comprehensive React frontend with multiple views for customers and administrators.',
    { align: 'left' }
  )
  .moveDown(0.5)
  .text(
    'The system ensures data integrity through unique constraints on (product_id, customer_id), enforces rating ranges with CHECK constraints, and provides a complete moderation workflow. The frontend component offers tabbed interfaces for different user roles, making it easy to manage reviews at scale.',
    { align: 'left' }
  )
  .moveDown(0.5)
  .text(
    'All endpoints have been tested and verified on production environments (Render for backend, Vercel for frontend). The implementation follows established patterns from previous modules, ensuring consistency and maintainability across the platform.',
    { align: 'left' }
  );

// End document properly
doc.end();

writeStream.on('finish', () => {
  console.log(`PDF generated successfully: ${outputPath}`);
  process.exit(0);
});

writeStream.on('error', (err) => {
  console.error('Error writing PDF:', err);
  process.exit(1);
});
