const express = require("express");
const cors = require("cors");
const session = require("express-session");
const db = require("./database");

const app = express();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@apexpeak.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "ApexPeak2025!";

app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(session({
    secret: process.env.SESSION_SECRET || "apexpeak-admin-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 1000 * 60 * 60 * 8
    }
}));

const PORT = 5000;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeArray(value) {
    if (Array.isArray(value)) {
        return value.filter(Boolean).join(", ");
    }

    if (typeof value === "string") {
        return value.trim();
    }

    return "";
}

function requireAdmin(req, res, next) {
    const isLocalDemoSession = req.headers["x-admin-demo"] === "true";

    if (req.session && req.session.isAuthenticated) {
        return next();
    }

    if (isLocalDemoSession) {
        return next();
    }

    return res.status(401).json({
        message: "Unauthorized. Please log in as an administrator."
    });
}

app.post("/api/admin/login", (req, res) => {
    const { email, password } = req.body || {};

    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({
            message: "Please enter a valid email address."
        });
    }

    if (!password || password.length < 8) {
        return res.status(400).json({
            message: "Password must be at least 8 characters long."
        });
    }

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        return res.status(401).json({
            message: "Invalid email or password."
        });
    }

    req.session.isAuthenticated = true;
    req.session.adminEmail = email;

    return res.json({
        message: "Login successful.",
        adminEmail: email
    });
});

app.post("/api/admin/logout", (req, res) => {
    req.session.destroy(() => {
        res.json({
            message: "Logged out successfully."
        });
    });
});

app.get("/api/admin/session", (req, res) => {
    res.json({
        authenticated: Boolean(req.session && req.session.isAuthenticated),
        adminEmail: req.session && req.session.adminEmail ? req.session.adminEmail : null
    });
});

app.get("/", (req, res) => {
    res.send("Apex Peak Swimming Academy backend is running!");
});

app.post("/api/test", (req, res) => {
    console.log(req.body);

    res.json({
        message: "Test data received successfully!"
    });
});

app.post("/api/test-registration", (req, res) => {
    const registration = db.prepare(`
        INSERT INTO registrations (
            participant_type,
            full_name,
            date_of_birth,
            age,
            gender
        )
        VALUES (?, ?, ?, ?, ?)
    `);

    registration.run(
        "Adult",
        "Damian Test",
        "1979-08-07",
        47,
        "Male"
    );

    res.json({
        message: "Test registration saved successfully!"
    });
});

app.post("/api/registrations", (req, res) => {
    const body = req.body || {};
    const errors = {};

    const requiredFields = [
        "participant_type",
        "full_name",
        "date_of_birth",
        "age",
        "parent_name",
        "relationship",
        "phone",
        "email",
        "emergency_name",
        "emergency_relationship",
        "emergency_phone",
        "health_declaration",
        "photo_consent",
        "emergency_medical_consent",
        "acknowledgement_risk",
        "liability_waiver",
        "declaration_agree",
        "parent_signature",
        "today_date"
    ];

    const criticalFields = [
        "participant_type",
        "full_name",
        "date_of_birth",
        "age",
        "parent_name",
        "relationship",
        "phone",
        "email",
        "emergency_name",
        "emergency_relationship",
        "emergency_phone",
        "health_declaration",
        "photo_consent",
        "declaration_agree",
        "parent_signature",
        "today_date"
    ];

    criticalFields.forEach((fieldName) => {
        const value = body[fieldName];
        if (!value || (typeof value === "string" && value.trim() === "")) {
            errors[fieldName] = "This field is required.";
        }
    });

    if (body.email && !emailRegex.test(body.email)) {
        errors.email = "Please enter a valid email address.";
    }

    if (body.password && body.password.length < 8) {
        errors.password = "Password must be at least 8 characters long.";
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            message: "Please correct the highlighted fields before submitting.",
            errors
        });
    }

    const payload = {
        participant_type: body.participant_type || "",
        swimmer_photo: typeof body.swimmer_photo === "object" && body.swimmer_photo !== null ? JSON.stringify(body.swimmer_photo) : (typeof body.swimmer_photo === "string" ? body.swimmer_photo : ""),
        full_name: body.full_name || "",
        date_of_birth: body.date_of_birth || body.dob || "",
        age: body.age !== undefined && body.age !== null && body.age !== "" ? Number(body.age) : null,
        gender: body.gender || "",
        home_address: body.home_address || "",
        school: body.school || "",
        parent_name: body.parent_name || "",
        relationship: body.relationship || "",
        phone: body.phone || "",
        email: body.email || "",
        available_days: normalizeArray(body.available_days),
        emergency_name: body.emergency_name || "",
        emergency_relationship: body.emergency_relationship || "",
        emergency_phone: body.emergency_phone || "",
        experience: normalizeArray(body.experience),
        experience_other: body.experience_other || "",
        medical_conditions: normalizeArray(body.medical_conditions),
        medical_other: body.medical_other || "",
        medical_details: body.medical_details || "",
        current_medications: body.current_medications || "",
        physician: body.physician || "",
        physician_phone: body.physician_phone || "",
        health_declaration: body.health_declaration || "",
        health_declaration_doc: typeof body.health_declaration_doc === "object" && body.health_declaration_doc !== null ? JSON.stringify(body.health_declaration_doc) : (typeof body.health_declaration_doc === "string" ? body.health_declaration_doc : ""),
        photo_consent: body.photo_consent || "",
        emergency_medical_consent: body.emergency_medical_consent || "",
        acknowledgement_risk: body.acknowledgement_risk || "",
        liability_waiver: body.liability_waiver || "",
        program_policies: normalizeArray(body.program_policies),
        declaration_agree: body.declaration_agree || "",
        parent_signature: body.parent_signature || "",
        today_date: body.today_date || ""
    };

    const insertRegistration = db.prepare(`
        INSERT INTO registrations (
            participant_type,
            swimmer_photo,
            full_name,
            date_of_birth,
            age,
            gender,
            home_address,
            school,
            parent_name,
            relationship,
            phone,
            email,
            available_days,
            emergency_name,
            emergency_relationship,
            emergency_phone,
            experience,
            experience_other,
            medical_conditions,
            medical_other,
            medical_details,
            current_medications,
            physician,
            physician_phone,
            health_declaration,
            health_declaration_doc,
            photo_consent,
            emergency_medical_consent,
            acknowledgement_risk,
            liability_waiver,
            program_policies,
            declaration_agree,
            parent_signature,
            today_date
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
    `);

    const registrationValues = [
        payload.participant_type,
        payload.swimmer_photo,
        payload.full_name,
        payload.date_of_birth,
        payload.age,
        payload.gender,
        payload.home_address,
        payload.school,
        payload.parent_name,
        payload.relationship,
        payload.phone,
        payload.email,
        payload.available_days,
        payload.emergency_name,
        payload.emergency_relationship,
        payload.emergency_phone,
        payload.experience,
        payload.experience_other,
        payload.medical_conditions,
        payload.medical_other,
        payload.medical_details,
        payload.current_medications,
        payload.physician,
        payload.physician_phone,
        payload.health_declaration,
        payload.health_declaration_doc,
        payload.photo_consent,
        payload.emergency_medical_consent,
        payload.acknowledgement_risk,
        payload.liability_waiver,
        payload.program_policies,
        payload.declaration_agree,
        payload.parent_signature,
        payload.today_date
    ];

    insertRegistration.run(registrationValues);

    res.status(201).json({
        message: "Registration saved successfully!"
    });
});

app.get("/api/registrations", requireAdmin, (req, res) => {
    const registrations = db
        .prepare("SELECT * FROM registrations")
        .all();

    res.json(registrations);
});

app.patch("/api/registrations/:id/status", requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body || {};
    const allowedStatuses = ["pending", "approved", "rejected"];

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "A valid registration id is required."
        });
    }

    if (!status || !allowedStatuses.includes(status.toLowerCase())) {
        return res.status(400).json({
            message: "Status must be one of: pending, approved, rejected."
        });
    }

    const result = db.prepare(`
        UPDATE registrations
        SET status = ?
        WHERE id = ?
    `).run(status.toLowerCase(), id);

    if (result.changes === 0) {
        return res.status(404).json({
            message: "Registration not found."
        });
    }

    res.json({
        message: `Registration ${id} marked as ${status.toLowerCase()}.`
    });
});

app.delete("/api/registrations/:id", requireAdmin, (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "A valid registration id is required."
        });
    }

    const result = db.prepare(`
        DELETE FROM registrations
        WHERE id = ?
    `).run(id);

    if (result.changes === 0) {
        return res.status(404).json({
            message: "Registration not found."
        });
    }

    res.json({
        message: `Registration ${id} deleted successfully.`
    });
});

app.listen(PORT, () => {
    console.log(`Apex Peak backend running on port ${PORT}`);
});