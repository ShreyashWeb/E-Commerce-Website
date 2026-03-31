const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument({ size: 'A4', margin: 50 });
const outputPath = path.join(__dirname, 'Module-8-Assignment-Submission.pdf');
const stream = fs.createWriteStream(outputPath);

doc.pipe(stream);

const repoLink = 'https://github.com/ShreyashWeb/E-Commerce-Website';
const hostedAppLink = 'https://e-commerce-website-woad-eta.vercel.app';
const hostedApiLink = 'https://ecommerce-backend-2s98.onrender.com';

function sectionTitle(text) {
  doc.moveDown(0.6);
  doc.font('Helvetica-Bold').fontSize(14).fillColor('#111111').text(text);
  doc.moveDown(0.2);
}

function body(text, opts = {}) {
  doc.font('Helvetica').fontSize(11).fillColor('#222222').text(text, opts);
}

// Cover
body('Internship Assignment Submission', { align: 'center' });
doc.moveDown(0.4);
doc.font('Helvetica-Bold').fontSize(22).fillColor('#000000').text('Module 8: Review and Rating Management', { align: 'center' });
doc.moveDown(0.5);
body('E-Commerce Website Project', { align: 'center' });
body(`Submission Date: ${new Date().toLocaleDateString('en-GB')}`, { align: 'center' });

doc.moveDown(1.2);
sectionTitle('Required Details');
body('1. GitHub Repository Link:');
body(repoLink, { indent: 20, link: repoLink, underline: true });
doc.moveDown(0.4);
body('2. URL of Module Hosted on Free Server:');
body(hostedAppLink, { indent: 20, link: hostedAppLink, underline: true });
body('Module access path: Open the above URL and click "Module 8: Reviews" from the left sidebar.', { indent: 20 });
doc.moveDown(0.4);
body('3. Backend API Base URL (deployed on free server):');
body(hostedApiLink, { indent: 20, link: hostedApiLink, underline: true });

// End-user documentation
sectionTitle('End User Documentation - Module 8');
body('Module 8 allows customers to submit ratings and reviews for products and allows administrators to moderate those reviews before they are publicly shown.');

sectionTitle('Main Features');
body('- Add new review with rating (1 to 5 stars) and optional text comment.');
body('- View reviews product-wise and customer-wise.');
body('- Admin moderation dashboard for pending, approved, and rejected reviews.');
body('- Edit and delete review support with role-based checks.');
body('- Review statistics including total reviews and average rating.');

sectionTitle('How to Use (End User Steps)');
body('Step 1: Open the deployed application URL and click "Module 8: Reviews".');
body('Step 2: Use "Add Review" tab to submit a review. Enter Product ID, Customer ID, rating, and review text.');
body('Step 3: Use "Product Reviews" tab to fetch reviews for a product by Product ID.');
body('Step 4: Use "Customer Reviews" tab to view all reviews by a specific customer.');
body('Step 5: Admin users can use "Admin Dashboard" tab to approve, reject, edit, or delete reviews.');

sectionTitle('Status Meaning');
body('- Pending (0): Waiting for admin moderation.');
body('- Approved (1): Visible to users where approved filter is applied.');
body('- Rejected (2): Not approved by admin.');

sectionTitle('Validation Rules');
body('- Rating must be between 1 and 5.');
body('- Same customer cannot create duplicate review for the same product.');
body('- Product and customer IDs must exist in the system.');

sectionTitle('Assignment Completion Note');
body('Code has been pushed to GitHub and the application has been deployed on free hosting services (Vercel for frontend and Render for backend). This PDF is uploaded in the same repository link as requested.');

// Footer
doc.moveDown(1.2);
doc.font('Helvetica-Oblique').fontSize(10).fillColor('#555555').text('Submitted for Internship Assignment - Module 8', { align: 'center' });

doc.end();

stream.on('finish', () => {
  console.log(`Assignment PDF generated: ${outputPath}`);
});

stream.on('error', (err) => {
  console.error('PDF generation error:', err);
  process.exit(1);
});
