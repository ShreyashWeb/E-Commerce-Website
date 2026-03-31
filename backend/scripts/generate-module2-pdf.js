const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument({ bufferPages: true });
const outputPath = path.join(
  __dirname,
  '..',
  '..',
  'Module 2 by Shreyash Tekriwal.pdf'
);
const writeStream = fs.createWriteStream(outputPath);

doc.pipe(writeStream);

// Title
doc.fontSize(24).font('Helvetica-Bold').text('E-Commerce Internship Project', {
  align: 'center',
});
doc.fontSize(18).font('Helvetica-Bold').text('Module 2: Order Management', {
  align: 'center',
  margin: 10,
});

// Candidate Info
doc.fontSize(12).font('Helvetica').moveDown(0.5);
doc.text('Submitted by: Shreyash Tekriwal', { align: 'center' });
doc.text('Date: ' + new Date().toLocaleDateString(), { align: 'center' });
doc.text('Project Type: Full-Stack Ecommerce System - Module 2', { align: 'center' });

doc.moveDown(1);
doc.fontSize(14).font('Helvetica-Bold').text('Project Links');
doc.fontSize(11).font('Helvetica');
doc.text('GitHub Repository:');
doc.text('https://github.com/ShreyashWeb/E-Commerce-Website');
doc.moveDown(0.3);
doc.text('Frontend URL:');
doc.text('https://e-commerce-website-woad-eta.vercel.app');
doc.moveDown(0.3);
doc.text('Backend Health URL:');
doc.text('https://ecommerce-backend-2s98.onrender.com/api/health');

// Module Features
doc.moveDown(1);
doc.fontSize(14).font('Helvetica-Bold').text('Module 2 Features Implemented');
doc.fontSize(11).font('Helvetica');
doc.list([
  'Place Orders from Shopping Cart',
  'Order Dashboard with Status Filters (Pending, Shipped, Delivered, Cancelled)',
  'View Order Details with Line Items and Customer Information',
  'Update Order Status (Pending → Shipped → Delivered)',
  'Cancel Orders with Business Logic Validation',
  'Soft Delete Implementation via Status Column',
  'Real-time Statistics Dashboard (Total, Pending, Shipped, Delivered)',
  'Responsive Modal Interface for Order Details',
  'RESTful API Endpoints for Order Management',
  'Error Handling and User Feedback Messages',
]);

// Database Design
doc.addPage();
doc.fontSize(14).font('Helvetica-Bold').text('Database Design');
doc.fontSize(11).font('Helvetica').moveDown(0.3);
doc.text('Order Management Tables:');
doc.moveDown(0.3);

// Orders Table
doc.font('Helvetica-Bold').text('1. Orders Table');
doc.font('Helvetica');
doc.table({
  headers: ['Column', 'Type', 'Description'],
  rows: [
    ['order_id', 'INTEGER (PK)', 'Unique order identifier'],
    ['user_id', 'INTEGER (FK)', 'Reference to users table'],
    ['total_amount', 'DECIMAL(10,2)', 'Total cost of order'],
    ['order_status', 'VARCHAR(40)', 'Status: pending/shipped/delivered/cancelled'],
    ['created_at', 'DATETIME', 'Order placement timestamp'],
    ['updated_at', 'DATETIME', 'Last update timestamp'],
    ['status', 'BOOLEAN', '1 for active, 0 for cancelled'],
  ],
});

doc.moveDown(0.5);
doc.font('Helvetica-Bold').text('2. Order Items Table');
doc.font('Helvetica');
doc.table({
  headers: ['Column', 'Type', 'Description'],
  rows: [
    ['order_item_id', 'INTEGER (PK)', 'Unique item identifier'],
    ['order_id', 'INTEGER (FK)', 'Reference to orders table'],
    ['product_id', 'INTEGER (FK)', 'Reference to products table'],
    ['quantity', 'INTEGER', 'Quantity ordered'],
    ['item_price', 'DECIMAL(10,2)', 'Price at order time'],
  ],
});

// API Endpoints
doc.addPage();
doc.fontSize(14).font('Helvetica-Bold').text('API Endpoints');
doc.fontSize(11).font('Helvetica').moveDown(0.3);

doc.font('Helvetica-Bold').text('POST /api/orders');
doc.font('Helvetica');
doc.text('Place a new order from cart items');
doc.text('Request Params: user_id, shipping_address');
doc.moveDown(0.3);

doc.font('Helvetica-Bold').text('GET /api/orders');
doc.font('Helvetica');
doc.text('Retrieve orders with optional status filter');
doc.text('Query Params: order_status (optional: pending, shipped, delivered)');
doc.moveDown(0.3);

doc.font('Helvetica-Bold').text('GET /api/orders/:id');
doc.font('Helvetica');
doc.text('Get order details with line items');
doc.moveDown(0.3);

doc.font('Helvetica-Bold').text('PUT /api/orders/:id/status');
doc.font('Helvetica');
doc.text('Update order status');
doc.text('Request Params: order_status (pending, shipped, delivered)');
doc.moveDown(0.3);

doc.font('Helvetica-Bold').text('PATCH /api/orders/:id/cancel');
doc.font('Helvetica');
doc.text('Cancel an order (soft delete)');
doc.text('Validation: Cannot cancel shipped/delivered orders');

// Tech Stack
doc.moveDown(1);
doc.fontSize(14).font('Helvetica-Bold').text('Technology Stack');
doc.fontSize(11).font('Helvetica').moveDown(0.3);
doc.list([
  'Backend: Node.js, Express.js, SQLite3',
  'Frontend: React 18, Vite, Axios',
  'Styling: CSS3 (Responsive Grid, Flexbox, Modal)',
  'Deployment: Vercel (Frontend), Render (Backend)',
  'Version Control: Git, GitHub',
  'Database: SQLite with relational schema',
]);

// Key Features
doc.addPage();
doc.fontSize(14).font('Helvetica-Bold').text('Key Technical Features');
doc.fontSize(11).font('Helvetica').moveDown(0.3);
doc.list([
  'Soft Delete Pattern: Uses status column for non-destructive deletes',
  'Business Logic Validation: Prevents canceling shipped/delivered orders',
  'Status Workflow: Enforces order status progression (pending → shipped → delivered)',
  'Modular Architecture: Separate controllers, routes, and middleware',
  'Error Handling: Comprehensive error messages and HTTP status codes',
  'Responsive UI: Mobile-friendly modal and table layouts',
  'Real-time Statistics: Dynamic calculation of order statistics',
  'RESTful Design: Standard HTTP methods (GET, POST, PUT, PATCH)',
]);

// User Documentation
doc.moveDown(1);
doc.fontSize(14).font('Helvetica-Bold').text('End User Documentation');
doc.fontSize(11).font('Helvetica').moveDown(0.3);

doc.font('Helvetica-Bold').text('How to Use Module 2 - Order Management');
doc.font('Helvetica').moveDown(0.3);

doc.text('Step 1: Access Dashboard');
doc.text('  • Navigate to the frontend URL', { indent: 20 });
doc.text('  • Click on "Module 2: Orders" in the left navigation', { indent: 20 });
doc.moveDown(0.2);

doc.text('Step 2: View Orders');
doc.text('  • Dashboard displays all orders in table format', { indent: 20 });
doc.text('  • Each row shows: Order ID, Customer Name, Email, Amount, Items, Status, Date', { indent: 20 });
doc.moveDown(0.2);

doc.text('Step 3: Filter Orders');
doc.text('  • Use Status Filter dropdown to show specific order types', { indent: 20 });
doc.text('  • Options: All Orders, Pending, Shipped, Delivered', { indent: 20 });
doc.moveDown(0.2);

doc.text('Step 4: View Order Details');
doc.text('  • Click "View" button in any row to open order modal', { indent: 20 });
doc.text('  • Modal shows complete order information including items and customer details', { indent: 20 });
doc.moveDown(0.2);

doc.text('Step 5: Update Order Status');
doc.text('  • From order details modal, click status update buttons', { indent: 20 });
doc.text('  • Available actions depend on current status', { indent: 20 });
doc.text('  • Pending orders can be marked as Shipped or Cancelled', { indent: 20 });
doc.text('  • Shipped orders can be marked as Delivered', { indent: 20 });
doc.moveDown(0.2);

doc.text('Step 6: Cancel Orders');
doc.text('  • Only pending orders can be cancelled', { indent: 20 });
doc.text('  • System confirms cancellation with user prompt', { indent: 20 });

// Statistics
doc.addPage();
doc.fontSize(14).font('Helvetica-Bold').text('Module Statistics');
doc.fontSize(11).font('Helvetica').moveDown(0.3);

doc.text('Frontend Components: 2 (Categories, Orders)');
doc.text('Backend Controllers: 1 (Orders)');
doc.text('API Endpoints: 5 (POST, GET list, GET detail, PUT status, PATCH cancel)');
doc.text('Database Tables: 2 (orders, order_items) + shared schema');
doc.text('Lines of Code (Backend): ~250');
doc.text('Lines of Code (Frontend): ~300');
doc.text('CSS Styling: ~400 lines');
doc.moveDown(0.5);

doc.fontSize(14).font('Helvetica-Bold').text('Deployment Information');
doc.fontSize(11).font('Helvetica').moveDown(0.3);
doc.text('Frontend Deployment: Vercel');
doc.text('Backend Deployment: Render');
doc.text('Database: SQLite (local) / Will use PostgreSQL for production scaling');
doc.text('CI/CD: Automated deployment on Git push');
doc.moveDown(0.5);

// Conclusion
doc.fontSize(14).font('Helvetica-Bold').text('Conclusion');
doc.fontSize(11).font('Helvetica').moveDown(0.3);
doc.text(
  'Module 2 successfully demonstrates order management capabilities for an ecommerce platform. ' +
    'The implementation includes a complete backend API with business logic validation, a responsive ' +
    'frontend interface with modal-based order details, and proper database design with soft delete patterns. ' +
    'The module is production-ready and follows industry best practices for RESTful API design and React component architecture.'
);

// Footer
doc.addPage();
doc.fontSize(12).font('Helvetica-Bold').text('Technical Implementation Details', {
  align: 'center',
});
doc.moveDown(0.5);
doc.fontSize(10).font('Helvetica');

doc.text('Backend Architecture:');
doc.list([
  'Express middleware stack: CORS, Helmet, Morgan logging',
  'Database abstraction layer with Promise-based query functions',
  'Error handler middleware for centralized error management',
  'Controller-based business logic separation',
]);

doc.moveDown(0.3);
doc.text('Frontend Architecture:');
doc.list([
  'React hooks: useState, useEffect, useMemo for state management',
  'Axios HTTP client with environment-based configuration',
  'Modal component for detailed order viewing',
  'Responsive CSS Grid and Flexbox layout',
  'Status-based conditional rendering for actions',
]);

doc.moveDown(0.3);
doc.text('Security Considerations:');
doc.list([
  'Input validation on all API endpoints',
  'CORS enabled for cross-origin requests',
  'Helmet middleware for security headers',
  'Foreign key constraints in database schema',
  'Status-based authorization (prevent invalid status transitions)',
]);

doc.moveDown(1);
doc.fontSize(10).font('Helvetica').text(
  'End of Document - Module 2: Order Management',
  {
    align: 'center',
  }
);

doc.end();

writeStream.on('finish', () => {
  console.log(`PDF created at ${outputPath}`);
});

writeStream.on('error', (err) => {
  console.error('Error writing PDF:', err);
});
