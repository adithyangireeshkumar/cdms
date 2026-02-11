const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'crime_transparency.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Police Stations
    db.run(`CREATE TABLE IF NOT EXISTS police_stations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        location TEXT,
        contact TEXT
    )`);

    // Officers
    db.run(`CREATE TABLE IF NOT EXISTS officers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        rank TEXT,
        station_id INTEGER,
        FOREIGN KEY (station_id) REFERENCES police_stations(id)
    )`);

    // FIRs
    db.run(`CREATE TABLE IF NOT EXISTS firs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fir_number TEXT UNIQUE NOT NULL,
        reported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        incident_location TEXT,
        distance_from_ps TEXT,
        occurrence_at DATETIME,
        information_type TEXT DEFAULT 'Written',
        crime_type TEXT,
        ipc_sections TEXT,
        status TEXT DEFAULT 'Open',
        complainant_name TEXT,
        complainant_age INTEGER,
        complainant_address TEXT,
        complainant_contact TEXT,
        accused_details TEXT,
        incident_description TEXT,
        witness_details TEXT,
        property_details TEXT,
        dispatch_at DATETIME,
        officer_id INTEGER,
        station_id INTEGER,
        FOREIGN KEY (officer_id) REFERENCES officers(id),
        FOREIGN KEY (station_id) REFERENCES police_stations(id)
    )`);

    // Case Follow-ups
    db.run(`CREATE TABLE IF NOT EXISTS case_follow_ups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fir_id INTEGER,
        event_date DATETIME,
        description TEXT,
        FOREIGN KEY (fir_id) REFERENCES firs(id)
    )`);

    // News Articles
    db.run(`CREATE TABLE IF NOT EXISTS news_articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fir_id INTEGER,
        title TEXT,
        source TEXT,
        pub_date DATETIME,
        link TEXT,
        is_verified BOOLEAN DEFAULT 0,
        FOREIGN KEY (fir_id) REFERENCES firs(id)
    )`);
});

module.exports = db;
