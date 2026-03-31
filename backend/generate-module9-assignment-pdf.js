const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const repoLink = 'https://github.com/ShreyashWeb/E-Commerce-Website';
const frontendLink = 'https://e-commerce-website-woad-eta.vercel.app';
const backendLink = 'https://ecommerce-backend-2s98.onrender.com';

const outputPath = path.join(__dirname, '..', 'Module 9 by Shreyash Tekriwal.pdf');
const doc = new PDFDocument({ size: 'A4', margin: 50 });
const stream = fs.createWriteStream(outputPath);

doc.pipe(stream);

function title(text) {
  doc.font('Helvetica-Bold').fontSize(18).fillColor('#111111').text(text);
  doc.moveDown(0.4);
}

function heading(text) {
  doc.font('Helvetica-Bold').fontSize(13).fillColor('#111111').text(text);
  doc.moveDown(0.2);
}

function body(text, options = {}) {
  doc.font('Helvetica').fontSize(11).fillColor('#222222').text(text, options);
}

title('Module 9: Coupon and Discount Management');
body('Internship Assignment Submission');
body(`Date: ${new Date().toLocaleDateString('en-GB')}`);
doc.moveDown(0.5);

heading('Introduction');
body('The Coupon and Discount Management Module allows admins to create and manage discount codes and special offers. This helps businesses improve conversions by providing discounts at checkout.');

doc.moveDown(0.4);
heading('Functionalities Implemented');
body('1. Create Coupon/Discount Code');
body('- Admin can create coupon code with percentage or fixed discount value.');
body('- Coupon includes validity window and usage limit.');
body('2. Coupon Dashboard');
body('- Dashboard shows all coupons with active/inactive/expired filters.');
body('- Actions include edit, activate/deactivate, and soft delete.');
body('3. Apply Coupon at Checkout');
body('- Customer can apply coupon with order total.');
body('- System validates active status and validity period, then returns updated total.');
body('4. Deactivate/Delete Coupon');
body('- Soft delete implemented by setting status to inactive.');

doc.moveDown(0.4);
heading('Database Design');
body('Table Name: coupons');
doc.moveDown(0.2);
body('coupon_id (int, pk, auto_increment): Unique identifier for each coupon.');
body('coupon_code (varchar(50)): Unique code used by customers during checkout.');
body('discount_type (varchar(50)): Percentage or Fixed Amount.');
body('discount_value (decimal(10,2)): Discount value.');
body('valid_from (datetime): Coupon validity start date.');
body('valid_to (datetime): Coupon validity end date.');
body('usage_limit (int): Maximum number of times coupon can be used.');
body('status (boolean): True active, False inactive.');
body('created_at (datetime): Coupon creation timestamp.');
body('updated_at (datetime): Coupon update timestamp.');

doc.moveDown(0.4);
heading('Assignment Details');
body('GitHub Repository Link:');
body(repoLink, { indent: 18, underline: true, link: repoLink });
body('URL of Module Hosted on Free Server:');
body(frontendLink, { indent: 18, underline: true, link: frontendLink });
body('Backend API URL:');
body(backendLink, { indent: 18, underline: true, link: backendLink });
body('Module Access: Open frontend URL and click Module 9: Coupons in sidebar.');

doc.moveDown(0.4);
heading('End User Documentation');
body('For Admin:');
body('- Open Module 9 and go to Create Coupon tab.');
body('- Fill coupon code, discount type, value, dates, and usage limit.');
body('- Save coupon and verify in dashboard.');
body('- Use dashboard actions to edit, deactivate, activate, or delete coupon.');
body('For Checkout Validation:');
body('- Go to Apply at Checkout tab.');
body('- Enter coupon code and order total.');
body('- System displays discount amount and final payable total.');

body('Validation Rules:');
body('- Coupon code must be unique.');
body('- Percentage discount cannot exceed 100.');
body('- valid_to must be greater than valid_from.');
body('- Inactive or expired coupons are rejected at checkout.');

doc.moveDown(0.8);
body('Code is pushed to GitHub and deployed on free hosting platforms as required.');

doc.end();

stream.on('finish', () => {
  console.log(`PDF generated successfully: ${outputPath}`);
});

stream.on('error', (error) => {
  console.error('Error generating PDF:', error);
  process.exit(1);
});
