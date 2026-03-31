const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument({ margin: 50 });
const outputPath = path.join(__dirname, '..', '..', 'Module 4 by Shreyash Tekriwal.pdf');
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
doc.font('Helvetica-Bold').fontSize(18).text('Module 4: Payment Management', {
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
doc.text('Payment API URL: https://ecommerce-backend-2s98.onrender.com/api/payments');

addHeading('Module 4 Functionalities Implemented');
doc.list([
  'Process Payment: Create payment transactions for order IDs',
  'Multiple payment methods: credit card, debit card, PayPal, bank transfer',
  'Payment Dashboard: List transaction history for admins',
  'Status tracking: paid, failed, refunded',
  'Refund Payment: Refund paid transactions for cancelled/returned orders',
  'Transaction logging with payment reference and gateway name',
  'Real-time statistics cards in frontend dashboard',
]);

doc.addPage();
addHeading('Database Design - payments table');
doc.text('Table Name: payments');
doc.moveDown(0.3);
doc.list([
  'payment_id (INTEGER, Primary Key, Auto Increment)',
  'order_id (INTEGER, Foreign Key -> orders.order_id)',
  'amount (DECIMAL(10,2), payment amount)',
  'payment_method (VARCHAR(50), credit_card/debit_card/paypal/bank_transfer)',
  'payment_status (VARCHAR(50), paid/failed/refunded)',
  'transaction_ref (VARCHAR(100), transaction identifier)',
  'payment_gateway (VARCHAR(50), gateway name)',
  'created_at (DATETIME, transaction timestamp)',
  'updated_at (DATETIME, latest transaction update timestamp)',
]);

addHeading('API Endpoints');
doc.text('POST /api/payments');
doc.text('Input: order_id, payment_method, optional amount, optional payment_gateway');
doc.moveDown(0.3);
doc.text('GET /api/payments?payment_status=all|paid|failed|refunded');
doc.text('Returns transaction list + dashboard stats');
doc.moveDown(0.3);
doc.text('PATCH /api/payments/:id/refund');
doc.text('Refunds paid transaction when linked order is cancelled or returned');

doc.addPage();
addHeading('End User Documentation');
doc.text('Step 1: Open the frontend and click Module 4: Payments.');
doc.text('Step 2: In Process Payment form, enter order ID and select payment method.');
doc.text('Step 3: Submit payment to create transaction record.');
doc.text('Step 4: View transaction history in the payment dashboard table.');
doc.text('Step 5: Filter by status (Paid, Failed, Refunded) from dropdown.');
doc.text('Step 6: For cancelled/returned orders, click Refund on paid payments.');
doc.text('Step 7: Verify updated status and dashboard statistics.');

addHeading('Tech Stack');
doc.list([
  'Backend: Node.js, Express.js, SQLite3',
  'Frontend: React + Vite + Axios',
  'Deployment: Render + Vercel',
  'Version Control: Git + GitHub',
]);

addHeading('Conclusion');
doc.text(
  'Module 4 Payment Management is implemented with backend APIs, frontend admin dashboard, and refund workflow according to the assignment requirements. The module is integrated into the same deployed application links and documented for end users.'
);

doc.moveDown(1.2);
doc.font('Helvetica').fontSize(10).text('End of Document - Module 4: Payment Management', {
  align: 'center',
});

doc.end();

writeStream.on('finish', () => {
  console.log(`PDF created at ${outputPath}`);
});

writeStream.on('error', (error) => {
  console.error('Error writing PDF:', error);
});
