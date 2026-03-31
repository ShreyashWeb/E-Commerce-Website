const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument({ margin: 50 });
const outputPath = path.join(__dirname, '..', '..', 'Module 5 by Shreyash Tekriwal.pdf');
const writeStream = fs.createWriteStream(outputPath);

doc.pipe(writeStream);

const addHeading = (title) => {
  doc.moveDown(0.8);
  doc.font('Helvetica-Bold').fontSize(14).text(title);
  doc.moveDown(0.3);
  doc.font('Helvetica').fontSize(11);
};

doc.font('Helvetica-Bold').fontSize(22).text('E-Commerce Internship Project', {
  align: 'center',
});
doc.moveDown(0.4);
doc.font('Helvetica-Bold').fontSize(18).text('Module 5: Cart Management', {
  align: 'center',
});
doc.moveDown(0.8);
doc.font('Helvetica').fontSize(11).text('Submitted by: Shreyash Tekriwal', { align: 'center' });
doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: 'center' });
doc.text('Project Type: Full-Stack Ecommerce System', { align: 'center' });

addHeading('Repository and Hosted URLs');
doc.text('GitHub Repository: https://github.com/ShreyashWeb/E-Commerce-Website');
doc.text('Frontend URL: https://e-commerce-website-woad-eta.vercel.app');
doc.text('Backend Health URL: https://ecommerce-backend-2s98.onrender.com/api/health');
doc.text('Cart API URL: https://ecommerce-backend-2s98.onrender.com/api/carts/admin/dashboard');

addHeading('Module 5 Functionalities Implemented');
doc.list([
  'Add to Cart with stock validation',
  'Update Cart quantity with real-time inventory checks',
  'Remove from Cart and recalculate totals',
  'Customer Cart Dashboard with items and grand total',
  'Admin Cart Dashboard for active carts and abandonment insights',
  'Real-time total_price storage per cart line item',
]);

doc.addPage();
addHeading('Database Design - cart table');
doc.text('Table Name: cart (existing project naming)');
doc.moveDown(0.3);
doc.list([
  'cart_id (INTEGER, Primary Key, Auto Increment)',
  'user_id (INTEGER, Foreign Key -> users.user_id, customer reference)',
  'product_id (INTEGER, Foreign Key -> products.product_id)',
  'quantity (INTEGER, number of items)',
  'total_price (DECIMAL(10,2), line total amount)',
  'created_at (DATETIME)',
  'updated_at (DATETIME)',
  'status (BOOLEAN, active/inactive cart line)',
]);

addHeading('API Endpoints');
doc.text('GET /api/carts/products');
doc.text('List products for add-to-cart form');
doc.moveDown(0.3);
doc.text('POST /api/carts/items');
doc.text('Add item to cart: customer_id, product_id, quantity');
doc.moveDown(0.3);
doc.text('PUT /api/carts/items/:id');
doc.text('Update quantity for cart item');
doc.moveDown(0.3);
doc.text('DELETE /api/carts/items/:id');
doc.text('Remove cart item (soft remove using status)');
doc.moveDown(0.3);
doc.text('GET /api/carts/:customerId');
doc.text('Fetch customer cart details and totals');
doc.moveDown(0.3);
doc.text('GET /api/carts/admin/dashboard');
doc.text('Fetch admin cart overview and abandonment stats');

doc.addPage();
addHeading('End User Documentation');
doc.text('Step 1: Open frontend and click Module 5: Cart.');
doc.text('Step 2: Select customer ID, product, and quantity.');
doc.text('Step 3: Click Add to Cart to create/update cart line item.');
doc.text('Step 4: Review customer cart table with totals.');
doc.text('Step 5: Use Update Qty to modify quantity and recalculate total.');
doc.text('Step 6: Use Remove to delete item from active cart.');
doc.text('Step 7: View admin cart dashboard for active and abandoned carts.');

addHeading('Tech Stack');
doc.list([
  'Backend: Node.js, Express.js, SQLite3',
  'Frontend: React + Vite + Axios',
  'Deployment: Render + Vercel',
  'Version Control: Git + GitHub',
]);

addHeading('Conclusion');
doc.text(
  'Module 5 Cart Management is integrated into the same hosted application, with complete CRUD-style cart operations, stock validation, customer cart view, admin cart analytics, and end-user documentation ready for submission.'
);

doc.moveDown(1.2);
doc.font('Helvetica').fontSize(10).text('End of Document - Module 5: Cart Management', {
  align: 'center',
});

doc.end();

writeStream.on('finish', () => {
  console.log(`PDF created at ${outputPath}`);
});

writeStream.on('error', (error) => {
  console.error('Error writing PDF:', error);
});
