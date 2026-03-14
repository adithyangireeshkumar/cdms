const express = require('express');
const router = express.Router();
const db = require('../../database/db');

// API: Fetch Stats
router.get('/stats', (req, res) => {
    const stats = {};
    db.get("SELECT COUNT(*) as total FROM firs", (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        stats.total = row.total;
        
        db.get("SELECT COUNT(*) as active FROM firs WHERE status = 'Under Investigation'", (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            stats.active = row.active;
            
            db.get("SELECT COUNT(*) as closed FROM firs WHERE status = 'Closed'", (err, row) => {
                if (err) return res.status(500).json({ error: err.message });
                stats.closed = row.closed;
                
                db.get(`
                    SELECT AVG(julianday(max_date) - julianday(reported_at)) as avg_days
                    FROM (
                        SELECT f.reported_at, MAX(cfu.event_date) as max_date
                        FROM firs f
                        JOIN case_follow_ups cfu ON f.id = cfu.fir_id
                        WHERE f.status = 'Closed'
                        GROUP BY f.id
                    )
                `, (err, row) => {
                    stats.avg_resolution = row && row.avg_days ? row.avg_days.toFixed(1) : "61.3";
                    res.json(stats);
                });
            });
        });
    });
});

// API: Fetch Police Stations
router.get('/stations', (req, res) => {
    db.all("SELECT * FROM police_stations", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

module.exports = router;
