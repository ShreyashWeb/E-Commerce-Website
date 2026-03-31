const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '..', 'ecommerce.db');
const schemaPath = path.join(__dirname, 'database', 'schema.sql');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to database.');
    initializeSchema();
  }
});

function initializeSchema() {
  db.run('PRAGMA foreign_keys = ON');

  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
  const statements = schemaSql
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);

  let index = 0;

  function executeNext() {
    if (index >= statements.length) {
      ensureUsersPhoneColumn();
      ensurePaymentsTable();
      ensureCartTotalPriceColumn();
      console.log('Database schema initialized successfully.');
      return;
    }

    const statement = statements[index];
    index++;

    db.run(statement, (err) => {
      if (err) {
        console.error('Error executing statement:', err.message);
      }
      executeNext();
    });
  }

  executeNext();
}

function ensurePaymentsTable() {
  db.run(
    `CREATE TABLE IF NOT EXISTS payments (
      payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      payment_method VARCHAR(50) NOT NULL,
      payment_status VARCHAR(50) NOT NULL DEFAULT 'paid',
      transaction_ref VARCHAR(100),
      payment_gateway VARCHAR(50) NOT NULL DEFAULT 'simulated_gateway',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(order_id)
    )`,
    (error) => {
      if (error) {
        console.error('Error ensuring payments table:', error.message);
        return;
      }

      db.get(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'payment'",
        (tableCheckError, row) => {
          if (tableCheckError) {
            console.error('Error checking legacy payment table:', tableCheckError.message);
            return;
          }

          if (!row) {
            return;
          }

          db.run(
            `INSERT INTO payments (order_id, amount, payment_method, payment_status, transaction_ref, payment_gateway, created_at, updated_at)
             SELECT
               order_id,
               amount,
               payment_method,
               LOWER(COALESCE(payment_status, 'paid')),
               transaction_ref,
               'simulated_gateway',
               COALESCE(created_at, CURRENT_TIMESTAMP),
               COALESCE(created_at, CURRENT_TIMESTAMP)
             FROM payment
             WHERE NOT EXISTS (
               SELECT 1 FROM payments p
               WHERE p.order_id = payment.order_id
                 AND p.transaction_ref = payment.transaction_ref
             )`,
            (migrationError) => {
              if (migrationError) {
                console.error('Error migrating legacy payment rows:', migrationError.message);
                return;
              }

              console.log('Migration checked: legacy payment rows copied into payments table.');
            },
          );
        },
      );
    },
  );
}

function ensureUsersPhoneColumn() {
  db.all('PRAGMA table_info(users)', (error, columns) => {
    if (error) {
      console.error('Error checking users table schema:', error.message);
      return;
    }

    const hasPhoneColumn = columns.some((column) => column.name === 'phone');
    if (hasPhoneColumn) {
      return;
    }

    db.run('ALTER TABLE users ADD COLUMN phone VARCHAR(20)', (alterError) => {
      if (alterError) {
        console.error('Error adding phone column to users table:', alterError.message);
        return;
      }
      console.log('Migration applied: added phone column to users table.');
    });
  });
}

function ensureCartTotalPriceColumn() {
  db.all('PRAGMA table_info(cart)', (error, columns) => {
    if (error) {
      console.error('Error checking cart table schema:', error.message);
      return;
    }

    const hasTotalPriceColumn = columns.some((column) => column.name === 'total_price');
    if (hasTotalPriceColumn) {
      return;
    }

    db.run('ALTER TABLE cart ADD COLUMN total_price DECIMAL(10,2) NOT NULL DEFAULT 0', (alterError) => {
      if (alterError) {
        console.error('Error adding total_price column to cart table:', alterError.message);
        return;
      }

      db.run(
        `UPDATE cart
         SET total_price = (
           SELECT ROUND(COALESCE(p.price, 0) * cart.quantity, 2)
           FROM products p
           WHERE p.product_id = cart.product_id
         )`,
        (updateError) => {
          if (updateError) {
            console.error('Error backfilling total_price for cart table:', updateError.message);
            return;
          }
          console.log('Migration applied: added total_price column to cart table.');
        },
      );
    });
  });
}

const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(error) {
      if (error) {
        reject(error);
        return;
      }
      resolve({ id: this.lastID, changes: this.changes });
    });
  });

const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(row);
    });
  });

const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(rows);
    });
  });

module.exports = {
  db,
  run,
  get,
  all,
};
