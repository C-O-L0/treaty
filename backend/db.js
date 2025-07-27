const Database = require("better-sqlite3");
const path = require("path");

// Connect to database file. It will be created if it doesn't exist.
const db = new Database(path.resolve("saas.db"), { fileMustExist: false });

console.log("Connected to the database.");

// SQL schema for templates
const createTemplatesTable = `
    CREATE TABLE IF NOT EXISTS templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    questions TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP);
`;

// SQL schema for testimonials
const createTestimonialsTable = `
    CREATE TABLE IF NOT EXISTS testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_id INTEGER NOT NULL,
    answers TEXT NOT NULL,
    media_url TEXT, -- Optional media URL for testimonials
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES templates(id));
`;

const createTrackingEventstable = `
    CREATE TABLE IF NOT EXISTS tracking_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id TEXT NOT NULL,
    template_id INTEGER NOT NULL,
    event_type TEXT NOT NULL, -- e.g. 'generated', 'opened', 'submitted'
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES templates(id));
`;

// Execute the SQL statements to create tables
db.exec(createTemplatesTable);
db.exec(createTestimonialsTable);
db.exec(createTrackingEventstable);

console.log("Database schema created.");

// Export the database connection
module.exports = db;
