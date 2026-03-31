const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument({ margin: 50 });
const outputPath = path.join(__dirname, '..', '..', 'Module 6 by Shreyash Tekriwal.pdf');
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
doc.font('Helvetica-Bold').fontSize(18).text('Module 6: Wishlist Management', {
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
doc.text('Wishlist API URL: https://ecommerce-backend-2s98.onrender.com/api/wishlists/1');

addHeading('Module 6 Functionalities Implemented');
doc.list([
  'Add to Wishlist from product selection',
  'View Wishlist with product name, price, and stock availability',
  'Remove from Wishlist',
  'Move from Wishlist to Cart',
  'Customer-level wishlist summary',
  'Integrated module navigation in admin panel',
]);

doc.addPage();
addHeading('Database Design - wishlist table');
doc.text('Table Name: wishlist (project schema naming)');
doc.moveDown(0.3);
doc.list([
  'wishlist_id (INTEGER, Primary Key, Auto Increment)',
  'user_id (INTEGER, Foreign Key -> users.user_id, customer reference)',
  'product_id (INTEGER, Foreign Key -> products.product_id)',
  'created_at (DATETIME)',
  'updated_at (DATETIME)',
  'status (BOOLEAN, active/inactive wishlist line)',
]);

addHeading('API Endpoints');
doc.text('GET /api/wishlists/products');
doc.text('List products for add-to-wishlist form');
doc.moveDown(0.3);
doc.text('POST /api/wishlists/items');
doc.text('Add product to wishlist: customer_id, product_id');
doc.moveDown(0.3);
doc.text('GET /api/wishlists/:customerId');
doc.text('Fetch customer wishlist items and summary');
doc.moveDown(0.3);
doc.text('DELETE /api/wishlists/items/:id');
doc.text('Remove product from wishlist');
doc.moveDown(0.3);
doc.text('PATCH /api/wishlists/items/:id/move-to-cart');
doc.text('Move wishlist item to cart in one action');

doc.addPage();
addHeading('End User Documentation');
doc.text('Step 1: Open frontend and click Module 6: Wishlist.');
doc.text('Step 2: Select customer and product, then click Add to Wishlist.');
doc.text('Step 3: View customer wishlist table with product details and availability.');
doc.text('Step 4: Click Move to Cart to transfer selected wishlist item to cart.');
doc.text('Step 5: Click Remove to delete item from wishlist.');
doc.text('Step 6: Monitor total wishlist items in summary card.');

addHeading('Tech Stack');
doc.list([
  'Backend: Node.js, Express.js, SQLite3',
  'Frontend: React + Vite + Axios',
  'Deployment: Render + Vercel',
  'Version Control: Git + GitHub',
]);

addHeading('Conclusion');
doc.text(
  'Module 6 Wishlist Management is integrated with existing modules, supports save-for-later behavior, and enables one-click move-to-cart for improved conversion while maintaining full end-user documentation and hosted deployment links.'
);

doc.moveDown(1.2);
doc.font('Helvetica').fontSize(10).text('End of Document - Module 6: Wishlist Management', {
  align: 'center',
});

doc.end();

writeStream.on('finish', () => {
  console.log(`PDF created at ${outputPath}`);
});

writeStream.on('error', (error) => {
  console.error('Error writing PDF:', error);
});
