const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument({ margin: 50 });
const outputPath = path.join(__dirname, '..', '..', 'Module 3 by Shreyash Tekriwal.pdf');
const writeStream = fs.createWriteStream(outputPath);

doc.pipe(writeStream);

const heading = (text) => {
  doc.moveDown(0.8);
  doc.font('Helvetica-Bold').fontSize(14).text(text);
  doc.moveDown(0.3);
  doc.font('Helvetica').fontSize(11);
};

// Cover

doc.font('Helvetica-Bold').fontSize(22).text('E-Commerce Internship Project', {
  align: 'center',
});
doc.moveDown(0.4);
doc.font('Helvetica-Bold').fontSize(18).text('Module 3: Customer Management', {
  align: 'center',
});
doc.moveDown(0.8);
doc.font('Helvetica').fontSize(11).text('Submitted by: Shreyash Tekriwal', { align: 'center' });
doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: 'center' });
doc.text('Project Type: Full-Stack Ecommerce System', { align: 'center' });

heading('Project Links');
doc.text('GitHub Repository: https://github.com/ShreyashWeb/E-Commerce-Website');
doc.text('Frontend URL: https://e-commerce-website-woad-eta.vercel.app');
doc.text('Backend URL: https://ecommerce-backend-2s98.onrender.com/api/health');

heading('Module 3 Features Implemented');
doc.list([
  'Create customer profiles with validation',
  'Customer dashboard with filters (all, active, inactive)',
  'Update customer profile details (name, email, phone)',
  'Deactivate customer accounts with soft delete pattern',
  'Reactivate inactive customer accounts',
  'Customer statistics cards (total, active, inactive)',
  'RESTful API endpoints for complete customer CRUD flow',
  'Responsive frontend table and form UI',
  'Error and success feedback handling',
]);

doc.addPage();
heading('Database Design');
doc.text('Table Used: users');
doc.moveDown(0.2);
doc.text('Columns relevant to Module 3:');
doc.list([
  'user_id (INTEGER, Primary Key, Auto Increment)',
  'full_name (VARCHAR(120), required)',
  'email (VARCHAR(150), unique, required)',
  'phone (VARCHAR(20), optional)',
  'role (VARCHAR(20), default: customer)',
  'created_at (DATETIME, default current timestamp)',
  'updated_at (DATETIME, default current timestamp)',
  'status (BOOLEAN, 1 active / 0 inactive)',
]);

heading('Soft Delete Strategy');
doc.text(
  'Customer accounts are never permanently removed. Deactivation sets status = 0 and reactivation sets status = 1. This protects referential data integrity and supports account restoration.'
);

doc.addPage();
heading('API Endpoints');
doc.text('POST /api/customers');
doc.text('Create customer with full_name, email, phone');
doc.moveDown(0.3);
doc.text('GET /api/customers?status=all|active|inactive');
doc.text('List customers with optional status filter and stats');
doc.moveDown(0.3);
doc.text('GET /api/customers/:id');
doc.text('Get customer details by ID');
doc.moveDown(0.3);
doc.text('PUT /api/customers/:id');
doc.text('Update customer details');
doc.moveDown(0.3);
doc.text('PATCH /api/customers/:id/deactivate');
doc.text('Deactivate customer account (soft delete)');
doc.moveDown(0.3);
doc.text('PATCH /api/customers/:id/reactivate');
doc.text('Reactivate inactive customer account');

heading('Technology Stack Used');
doc.list([
  'Backend: Node.js, Express.js, SQLite3',
  'Frontend: React 18, Vite, Axios',
  'Styling: CSS3 with responsive layouts',
  'Deployment: Render (backend), Vercel (frontend)',
  'Version Control: Git + GitHub',
]);

doc.addPage();
heading('End User Documentation');
doc.text('Step 1: Open frontend dashboard and choose Module 3: Customers.');
doc.text('Step 2: Use Add New Customer form to create customer profiles.');
doc.text('Step 3: View customer list with name, email, phone, status, and date.');
doc.text('Step 4: Filter customers by All, Active, or Inactive status.');
doc.text('Step 5: Edit a customer using the Edit action button.');
doc.text('Step 6: Deactivate or Reactivate customer account using action buttons.');

heading('Implementation Summary');
doc.text(
  'Module 3 is implemented with backend controller + routes, frontend API integration, dedicated customer dashboard UI, and soft delete account lifecycle. The module follows the same architecture and coding patterns as Modules 1 and 2 and is ready for deployment and review.'
);

doc.moveDown(1.2);
doc.font('Helvetica').fontSize(10).text('End of Document - Module 3: Customer Management', {
  align: 'center',
});

doc.end();

writeStream.on('finish', () => {
  console.log(`PDF created at ${outputPath}`);
});

writeStream.on('error', (err) => {
  console.error('Error writing PDF:', err);
});
