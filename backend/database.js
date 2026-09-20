const Database = require("better-sqlite3");

const db = new Database("apexpeak.db");

console.log("Apex Peak database connected!");
db.exec(`
    CREATE TABLE IF NOT EXISTS registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'pending',

        participant_type TEXT,
        swimmer_photo TEXT,
        full_name TEXT,
        date_of_birth TEXT,
        age INTEGER,
        gender TEXT,
        home_address TEXT,
        school TEXT,

        parent_name TEXT,
        relationship TEXT,
        phone TEXT,
        email TEXT,
        available_days TEXT,

        emergency_name TEXT,
        emergency_relationship TEXT,
        emergency_phone TEXT,

        experience TEXT,
        experience_other TEXT,

        medical_conditions TEXT,
        medical_other TEXT,
        medical_details TEXT,
        current_medications TEXT,
        physician TEXT,
        physician_phone TEXT,

        health_declaration TEXT,
        health_declaration_doc TEXT,
        photo_consent TEXT,
        emergency_medical_consent TEXT,
        acknowledgement_risk TEXT,
        liability_waiver TEXT,
        program_policies TEXT,
        declaration_agree TEXT,
        parent_signature TEXT,
        today_date TEXT
    )
`);
module.exports = db;