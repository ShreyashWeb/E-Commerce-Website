const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument({ margin: 50 });
const outputPath = path.join(__dirname, '..', '..', 'Module 7 by Shreyash Tekriwal.pdf');
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
doc.font('Helvetica-Bold').fontSize(18).text('Module 7: Shipping Management', {
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
doc.text('Shipping API URL: https://ecommerce-backend-2s98.onrender.com/api/shippings/dashboard');

addHeading('Module 7 Functionalities Implemented');
doc.list([
  'Shipping Cost Calculation based on order amount and weight',
  'Create Shipping Records for orders with auto-generated tracking numbers',
  'Admin Shipping Dashboard with filters and statistics',
  'Track Shipment by tracking number (customer-facing)',
  'Update Shipping Information (courier, tracking, status)',
  'Shipping Status Management (Shipped, In Transit, Delivered)',
  'Real-time shipping statistics and cost tracking',
  'Random courier assignment from major carriers',
]);

doc.addPage();
addHeading('Database Design - shipping table');
doc.text('Table Name: shipping');
doc.moveDown(0.3);
doc.list([
  'shipping_id (INTEGER, Primary Key, Auto Increment)',
  'order_id (INTEGER, Foreign Key -> orders.order_id, unique)',
  'courier_service (VARCHAR(100), name of courier provider)',
  'tracking_number (VARCHAR(100), unique tracking identifier)',
  'shipping_status (VARCHAR(50), Shipped/In Transit/Delivered)',
  'shipping_cost (DECIMAL(10,2), calculated shipping charge)',
  'created_at (DATETIME, when shipping was initiated)',
  'updated_at (DATETIME, last update timestamp)',
]);

addHeading('Shipping Cost Calculation Algorithm');
doc.text('Base Cost Calculation:');
doc.text('- Order Amount > $100: $3.00 base', { indent: 20 });
doc.text('- Order Amount > $50: $4.00 base', { indent: 20 });
doc.text('- Order Amount <= $50: $5.00 base', { indent: 20 });
doc.moveDown(0.2);
doc.text('Weight-based addition:');
doc.text('- Per kg: +$0.50', { indent: 20 });
doc.moveDown(0.2);
doc.text('Example: $75 order, 2kg = $4.00 + (2 * $0.50) = $5.00');

doc.addPage();
addHeading('API Endpoints');
doc.text('GET /api/shippings/dashboard');
doc.text('Admin view all shipments with optional status filter', { indent: 20 });
doc.text('Query params: ?shipping_status=Shipped|In Transit|Delivered');
doc.moveDown(0.3);
doc.text('POST /api/shippings');
doc.text('Create shipping record: order_id, courier_service, tracking_number, shipping_cost', { indent: 20 });
doc.moveDown(0.3);
doc.text('GET /api/shippings/track/:tracking_number');
doc.text('Customer track shipment by tracking number', { indent: 20 });
doc.moveDown(0.3);
doc.text('GET /api/shippings/order/:order_id');
doc.text('Get shipping info for specific order', { indent: 20 });
doc.moveDown(0.3);
doc.text('PATCH /api/shippings/:shipping_id');
doc.text('Update shipping info: courier, tracking, status', { indent: 20 });
doc.moveDown(0.3);
doc.text('GET /api/shippings/calculate-cost');
doc.text('Calculate shipping cost: ?order_amount=X&weight=Y', { indent: 20 });

doc.addPage();
addHeading('End User Documentation');

doc.font('Helvetica-Bold').fontSize(12).text('For Admin Users:', { underline: true });
doc.moveDown(0.3);
doc.text('1. Open frontend and click Module 7: Shipping in sidebar');
doc.text('2. On Admin Dashboard tab: View all shipments with status, courier, tracking, and cost');
doc.text('3. Use Status Filter dropdown to view Shipped, In Transit, or Delivered shipments');
doc.text('4. Click Create Shipping tab to create new shipping record for an order');
doc.text('5. Enter Order ID (required), optionally courier and tracking number');
doc.text('6. Click Update Shipping tab and select a shipment to edit courier, tracking, or status');
doc.text('7. Use Cost Calculator tab to determine shipping for order amount and weight');

doc.moveDown(0.5);
doc.font('Helvetica-Bold').fontSize(12).text('For Customers:', { underline: true });
doc.moveDown(0.3);
doc.text('1. Click Track Shipment tab');
doc.text('2. Enter tracking number provided by seller');
doc.text('3. View shipment status: Shipped, In Transit, or Delivered');
doc.text('4. See courier service name and shipping cost');
doc.text('5. Confirm order status and customer information');

addHeading('Features Highlighted');
doc.list([
  'Automatic tracking number generation format: TRACK_{timestamp}_{random}',
  'Random courier assignment from: FedEx, UPS, DHL, Amazon, Local Courier',
  'Responsive dashboard with real-time stats and pagination',
  'Soft-delete safe design with status fields',
  'Order-to-Shipping one-to-one relationship enforcement',
  'Duplicate tracking number prevention',
  'Full RESTful API design with proper HTTP methods',
  'Error handling and validation at controller level',
]);

doc.addPage();
addHeading('Tech Stack');
doc.list([
  'Backend: Node.js, Express.js, SQLite3',
  'Frontend: React + Vite + Axios',
  'Deployment: Render (Backend) + Vercel (Frontend)',
  'Version Control: Git + GitHub',
  'PDF Generation: PDFKit (Node.js)',
]);

addHeading('Module Integration');
doc.text(
  'The Shipping module is deeply integrated with the existing e-commerce system. ' +
  'It can be triggered automatically when orders are placed (Module 2), and integrates ' +
  'with the payment system (Module 4) to only allow shipping creation for paid orders.',
);

doc.addPage();
addHeading('Conclusion');
doc.text(
  'Module 7 Shipping Management is fully integrated into the same hosted application at ' +
  'https://e-commerce-website-woad-eta.vercel.app (frontend) and ' +
  'https://ecommerce-backend-2s98.onrender.com (backend). ' +
  'The module provides complete shipping operations including cost calculation, shipment tracking, admin management, and end-user documentation.',
);

doc.moveDown(1);
doc.font('Helvetica-Bold').fontSize(12).text('Submission Details:');
doc.text('GitHub Commit: To be verified at https://github.com/ShreyashWeb/E-Commerce-Website');
doc.text('All 7 modules are deployed live and accessible through the frontend URL.');
doc.text('Database schema, controllers, routes, and frontend components are complete.');

doc.end();

writeStream.on('finish', () => {
  console.log(`PDF generated successfully: ${outputPath}`);
});

writeStream.on('error', (err) => {
  console.error('Error generating PDF:', err);
});
