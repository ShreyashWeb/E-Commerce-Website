const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'ecommerce.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON');

  // Insert sample users
  db.run(`
    INSERT OR IGNORE INTO users (user_id, full_name, email, password_hash, role, status)
    VALUES 
      (1, 'John Doe', 'john@example.com', 'hashed_password_1', 'customer', 1),
      (2, 'Jane Smith', 'jane@example.com', 'hashed_password_2', 'customer', 1),
      (3, 'Admin User', 'admin@example.com', 'hashed_password_3', 'admin', 1);
  `);

  // Insert sample orders
  db.run(`
    INSERT OR IGNORE INTO orders (order_id, user_id, total_amount, order_status, status)
    VALUES 
      (1, 1, 299.99, 'pending', 1),
      (2, 2, 149.50, 'shipped', 1),
      (3, 1, 450.00, 'delivered', 1),
      (4, 2, 89.99, 'pending', 1);
  `);

  // Insert sample order items
  db.run(`
    INSERT OR IGNORE INTO order_items (order_id, product_id, quantity, item_price)
    VALUES 
      (1, 1, 2, 149.99),
      (1, 2, 1, 89.99),
      (2, 1, 1, 149.50),
      (3, 3, 3, 150.00),
      (4, 2, 1, 89.99);
  `, () => {
    console.log('Sample data inserted successfully.');
    db.close();
  });
});
