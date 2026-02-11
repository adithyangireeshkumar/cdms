const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');
const PDFDocument = require('pdfkit');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// API: Fetch filtered FIRs
app.get('/api/firs', (req, res) => {
    const { search, station_id, crime_type, status, start_date, end_date } = req.query;
    let query = `
        SELECT f.*, ps.name as station_name 
        FROM firs f
        JOIN police_stations ps ON f.station_id = ps.id
        WHERE 1=1
    `;
    const params = [];

    if (search) {
        query += ` AND (f.fir_number LIKE ? OR f.incident_location LIKE ? OR f.ipc_sections LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (station_id) {
        query += ` AND f.station_id = ?`;
        params.push(station_id);
    }
    if (crime_type) {
        query += ` AND f.crime_type = ?`;
        params.push(crime_type);
    }
    if (status) {
        query += ` AND f.status = ?`;
        params.push(status);
    }
    if (start_date) {
        query += ` AND f.reported_at >= ?`;
        params.push(start_date);
    }
    if (end_date) {
        query += ` AND f.reported_at <= ?`;
        params.push(end_date);
    }

    query += ` ORDER BY f.reported_at DESC`;

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// API: Fetch Police Stations
app.get('/api/stations', (req, res) => {
    db.all("SELECT * FROM police_stations", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// API: Fetch Case Details
app.get('/api/firs/:id', (req, res) => {
    const firId = req.params.id;
    const result = {};

    db.get(`
        SELECT f.*, ps.name as station_name, ps.location as station_location, ps.contact as station_contact,
               o.name as officer_name, o.rank as officer_rank
        FROM firs f
        JOIN police_stations ps ON f.station_id = ps.id
        JOIN officers o ON f.officer_id = o.id
        WHERE f.id = ?
    `, [firId], (err, fir) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!fir) return res.status(404).json({ error: 'FIR not found' });

        result.fir = fir;

        // Get Follow-ups
        db.all("SELECT * FROM case_follow_ups WHERE fir_id = ? ORDER BY event_date ASC", [firId], (err, followUps) => {
            if (err) return res.status(500).json({ error: err.message });
            result.follow_ups = followUps;

            // Get News Articles
            db.all("SELECT * FROM news_articles WHERE fir_id = ? AND is_verified = 1", [firId], (err, news) => {
                if (err) return res.status(500).json({ error: err.message });
                result.news = news;
                res.json(result);
            });
        });
    });
});

// API: Download FIR PDF
app.get('/api/firs/:id/pdf', (req, res) => {
    const firId = req.params.id;

    db.get(`
        SELECT f.*, ps.name as station_name, ps.location as station_location, o.name as officer_name, o.rank as officer_rank
        FROM firs f
        JOIN police_stations ps ON f.station_id = ps.id
        JOIN officers o ON f.officer_id = o.id
        WHERE f.id = ?
    `, [firId], (err, fir) => {
        if (err || !fir) return res.status(404).send('FIR not found');

        const doc = new PDFDocument({ margin: 50 });
        let filename = `FIR_${fir.fir_number.replace('/', '-')}.pdf`;
        res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
        res.setHeader('Content-type', 'application/pdf');

        // Header
        doc.fontSize(16).text('KERALA POLICE', { align: 'center', bold: true });
        doc.fontSize(14).text('FIRST INFORMATION REPORT (FIR)', { align: 'center', underline: true });
        doc.moveDown();

        const labelWidth = 150;
        const lineGap = 5;

        const drawSection = (title) => {
            doc.fontSize(12).text(title, { underline: true, bold: true });
            doc.moveDown(0.5);
        };

        const drawField = (label, value) => {
            const y = doc.y;
            doc.fontSize(10).text(label, 50, y, { width: labelWidth, bold: true });
            doc.text(`: ${value || 'N/A'}`, 50 + labelWidth, y);
            doc.moveDown(0.2);
        };

        // 1. Police Station Details
        drawSection('1. Police Station Details');
        drawField('Police Station Name', fir.station_name);
        drawField('District', 'Ernakulam');
        drawField('FIR Number', fir.fir_number);
        drawField('Date & Time of Registration', fir.reported_at);
        doc.moveDown();

        // 2. Type of Information
        drawSection('2. Type of Information');
        drawField('Written / Oral', fir.information_type);
        doc.moveDown();

        // 3. Complainant/Informant Details (censored)
        drawSection('3. Complainant/Informant Details (censored)');
        drawField('Name', fir.complainant_name);
        drawField('Father\'s/Mother\'s Name', '********');
        drawField('Age', fir.complainant_age);
        drawField('Gender', 'Male/Female');
        drawField('Address', fir.complainant_address);
        drawField('Contact Number', '********');
        drawField('Occupation', 'Private Service');
        doc.moveDown();

        // 4. Place of Occurrence
        drawSection('4. Place of Occurrence');
        drawField('Address/Location', fir.incident_location);
        drawField('Distance from Police Station', fir.distance_from_ps);
        doc.moveDown();

        // 5. Date & Time of Occurrence
        drawSection('5. Date & Time of Occurrence');
        drawField('Occurrence At', fir.occurrence_at);
        doc.moveDown();

        // 6. Offense Details
        drawSection('6. Offense Details');
        drawField('Nature of Offense', fir.crime_type);
        drawField('Sections of Law', fir.ipc_sections);
        doc.moveDown();

        // 7. Accused Details (If Known)
        drawSection('7. Accused Details (If Known)');
        drawField('Name(s)', fir.accused_details);
        drawField('Address(es)', 'Unknown');
        drawField('Description', 'N/A');
        doc.moveDown();

        // 8. Description of Incident (Facts of the Case)
        drawSection('8. Description of Incident (Facts of the Case)');
        doc.fontSize(10).text(fir.incident_description, 50, doc.y, { width: 450 });
        doc.moveDown();

        // 9. Witness Details (If Any)
        drawSection('9. Witness Details (If Any)');
        drawField('Name(s)', fir.witness_details);
        doc.moveDown();

        // 10. Property Involved (If Any)
        drawSection('10. Property Involved (If Any)');
        drawField('Description', fir.property_details);
        drawField('Value', 'N/A');
        doc.moveDown();

        // 11. Action Taken
        drawSection('11. Action Taken');
        drawField('Investigation Started', 'Yes');
        drawField('Officer Assigned', `${fir.officer_name} (${fir.officer_rank})`);
        doc.moveDown();

        // 12. Signature/Thumb Impression
        drawSection('12. Signature/Thumb Impression');
        doc.moveDown(2);
        const sigY = doc.y;
        doc.fontSize(10).text('--------------------------', 50, sigY);
        doc.text('Informant\'s Signature', 50, sigY + 15);
        doc.text('--------------------------', 350, sigY);
        doc.text('Officer\'s Signature & Rank', 350, sigY + 15);
        doc.moveDown(2);

        // 13. Date & Time of Dispatch to Court
        drawSection('13. Date & Time of Dispatch to Court');
        drawField('Dispatch At', fir.dispatch_at);

        doc.pipe(res);
        doc.end();
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
