const db = require('./db');

const stations = [
    { name: 'Kakkanad Police Station', location: 'Kakkanad, Kochi', contact: '0484-2422201' },
    { name: 'Kalamassery Police Station', location: 'Kalamassery, Kochi', contact: '0484-2555502' },
    { name: 'Aluva Police Station', location: 'Aluva, Kochi', contact: '0484-2622203' }
];

const officers = [
    { name: 'Sajan Mathew', rank: 'Circle Inspector', station_id: 1 },
    { name: 'Priya Nair', rank: 'Sub-Inspector', station_id: 1 },
    { name: 'Ramesh K.', rank: 'Sub-Inspector', station_id: 2 },
    { name: 'Anita George', rank: 'Circle Inspector', station_id: 2 },
    { name: 'Binu Pappu', rank: 'Sub-Inspector', station_id: 3 },
    { name: 'Sreejith Ravi', rank: 'Circle Inspector', station_id: 3 }
];

const accusedNames = [
    'Shibu (a) Minnal Shibu',
    'Georgekutty Vakkachan',
    'Digambaran Namboothiri',
    'Pappan (a) Pappan Shaji',
    'Antony Varghese',
    'Sunny Kurien',
    'Appunni Nair',
    'Kishore Kumar',
    'Soman Pillai',
    'Raju (a) Kidu Raju'
];

const newsSources = [
    { name: 'The Hindu', link: 'https://www.thehindu.com' },
    { name: 'Malayala Manorama', link: 'https://www.manoramaonline.com' },
    { name: 'Mathrubhumi', link: 'https://www.mathrubhumi.com' },
    { name: 'Asianet News', link: 'https://www.asianetnews.com' }
];

function getRandomDateWithinMonth(dayOffset) {
    const date = new Date();
    date.setDate(date.getDate() - dayOffset);
    date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);
    return date.toISOString().replace('T', ' ').substring(0, 19);
}

db.serialize(() => {
    // Insert Stations
    const stmtStation = db.prepare(`INSERT INTO police_stations (name, location, contact) VALUES (?, ?, ?)`);
    stations.forEach(s => stmtStation.run(s.name, s.location, s.contact));
    stmtStation.finalize();

    // Insert Officers
    const stmtOfficer = db.prepare(`INSERT INTO officers (name, rank, station_id) VALUES (?, ?, ?)`);
    officers.forEach(o => stmtOfficer.run(o.name, o.rank, o.station_id));
    stmtOfficer.finalize();

    // Insert FIRs (3 per day for 30 days = 90 total)
    for (let d = 0; d < 30; d++) {
        for (let i = 0; i < 3; i++) {
            const dateStr = getRandomDateWithinMonth(d);
            const occurrenceDate = getRandomDateWithinMonth(d + 0.5);
            const stationId = (Math.floor(Math.random() * 3) + 1);
            const officerId = (stationId - 1) * 2 + (Math.floor(Math.random() * 2) + 1);

            let crimeType = 'Theft';
            const dayCounter = d + 1;
            if (dayCounter % 2 === 0 && i === 0) crimeType = 'Murder';
            else if (i === 1) crimeType = 'Accident';
            else if ((dayCounter % 3 === 0 && i === 2) || (dayCounter % 3 === 1 && i === 2 && dayCounter % 2 !== 0)) crimeType = 'Assault';
            else crimeType = 'Robbery';

            const firNum = `${(d * 3 + i + 1).toString().padStart(3, '0')}/2026`;
            const status = Math.random() > 0.3 ? 'Under Investigation' : (Math.random() > 0.5 ? 'Closed' : 'Open');

            const complainantName = `Citizen ${Math.floor(Math.random() * 1000)}`;
            const ipcSections = crimeType === 'Murder' ? 'IPC 302' : (crimeType === 'Assault' ? 'IPC 323, 341' : 'IPC 279, 337');
            const accused = accusedNames[Math.floor(Math.random() * accusedNames.length)];

            db.run(`INSERT INTO firs (
                fir_number, reported_at, incident_location, distance_from_ps, occurrence_at, 
                information_type, crime_type, ipc_sections, status, 
                complainant_name, complainant_age, complainant_address, complainant_contact,
                accused_details, incident_description, witness_details, property_details, 
                dispatch_at, officer_id, station_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    firNum, dateStr, 'Main Road, Kochi', '2.5 KM East', occurrenceDate,
                    'Written', crimeType, ipcSections, status,
                    complainantName, 30 + Math.floor(Math.random() * 20), 'Sector 4, Kochi', '9876543210',
                    accused, `A case of ${crimeType} involving ${accused} was reported in the locality.`, 'Local residents and eyewitnesses', 'None',
                    dateStr, officerId, stationId
                ],
                function (err) {
                    if (err) return console.error(err.message);
                    const firId = this.lastID;

                    db.run(`INSERT INTO case_follow_ups (fir_id, event_date, description) VALUES (?, ?, ?)`,
                        [firId, dateStr, 'FIR Registered and Investigation Commenced.']);

                    // Add news articles for most cases (80% frequency)
                    if (Math.random() > 0.2) {
                        const source = newsSources[Math.floor(Math.random() * newsSources.length)];
                        db.run(`INSERT INTO news_articles (fir_id, title, source, pub_date, link, is_verified) VALUES (?, ?, ?, ?, ?, ?)`,
                            [firId, `Public Safety Alert: ${crimeType} reported in Kochi`, source.name, dateStr, source.link, 1]);
                    }
                }
            );
        }
    }
});

console.log('Seeding initiated...');
setTimeout(() => {
    db.close();
    console.log('Database seeded and connection closed.');
}, 5000);
