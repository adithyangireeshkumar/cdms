const express = require('express');
const router = express.Router();
const db = require('../../database/db');
const pdfService = require('../services/pdfService');

// API: Fetch filtered FIRs
router.get('/', (req, res) => {
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

// API: Fetch Case Details
router.get('/:id', (req, res) => {
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

        db.all("SELECT * FROM case_follow_ups WHERE fir_id = ? ORDER BY event_date ASC", [firId], (err, followUps) => {
            if (err) return res.status(500).json({ error: err.message });
            result.follow_ups = followUps;

            db.all("SELECT * FROM news_articles WHERE fir_id = ? AND is_verified = 1", [firId], (err, news) => {
                if (err) return res.status(500).json({ error: err.message });
                result.news = news;
                res.json(result);
            });
        });
    });
});

// API: Download FIR PDF
router.get('/:id/pdf', (req, res) => {
    pdfService.generateFIRPDF(req.params.id, res);
});

module.exports = router;
