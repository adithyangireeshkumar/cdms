const PDFDocument = require('pdfkit');
const db = require('../../database/db');

function generateFIRPDF(firId, res) {
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

        doc.fontSize(16).text('KERALA POLICE', { align: 'center', bold: true });
        doc.fontSize(14).text('FIRST INFORMATION REPORT (FIR)', { align: 'center', underline: true });
        doc.moveDown();

        const labelWidth = 150;
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

        drawSection('1. Police Station Details');
        drawField('Police Station Name', fir.station_name);
        drawField('District', 'Ernakulam');
        drawField('FIR Number', fir.fir_number);
        drawField('Date & Time of Registration', fir.reported_at);
        doc.moveDown();

        drawSection('2. Type of Information');
        drawField('Written / Oral', fir.information_type);
        doc.moveDown();

        drawSection('3. Complainant/Informant Details (censored)');
        drawField('Name', fir.complainant_name);
        drawField('Age', fir.complainant_age);
        drawField('Address', fir.complainant_address);
        doc.moveDown();

        drawSection('4. Place of Occurrence');
        drawField('Address/Location', fir.incident_location);
        drawField('Distance from PS', fir.distance_from_ps);
        doc.moveDown();

        drawSection('5. Date & Time of Occurrence');
        drawField('Occurrence At', fir.occurrence_at);
        doc.moveDown();

        drawSection('6. Offense Details');
        drawField('Nature of Offense', fir.crime_type);
        drawField('Sections of Law', fir.ipc_sections);
        doc.moveDown();

        drawSection('8. Description of Incident');
        doc.fontSize(10).text(fir.incident_description, 50, doc.y, { width: 450 });
        doc.moveDown();

        drawSection('11. Action Taken');
        drawField('Officer Assigned', `${fir.officer_name} (${fir.officer_rank})`);

        doc.pipe(res);
        doc.end();
    });
}

module.exports = { generateFIRPDF };
