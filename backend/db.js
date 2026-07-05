const Database = require("better-sqlite3");
const path = require("path");

// Path to the SQLite database file
const dbPath = path.join(__dirname, "database", "water.db");

// Connect to the database (creates the file if it doesn't exist)
const db = new Database(dbPath);

// Create the table if it doesn't already exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS water_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    glasses INTEGER NOT NULL,
    time TEXT NOT NULL,
    date TEXT NOT NULL
  )
`).run();

console.log("✅ Connected to SQLite database.");
console.log("✅ water_logs table is ready.");

module.exports = db;