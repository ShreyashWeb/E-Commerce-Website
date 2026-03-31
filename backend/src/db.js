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
