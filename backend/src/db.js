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
