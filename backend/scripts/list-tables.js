const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'ecommerce.db');
const db = new sqlite3.Database(dbPath);

db.all("SELECT name FROM sqlite_master WHERE type='table';", [], (err, tables) => {
  if (err) {
    console.error('Error:', err.message);
  } else {
    console.log('Tables in database:');
    if (tables.length === 0) {
      console.log('  No tables found');
    } else {
      tables.forEach(t => console.log('  -', t.name));
    }
  }
  db.close();
});
