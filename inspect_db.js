const db = require('./db');

db.serialize(() => {
    db.all("PRAGMA table_info(firs)", (err, rows) => {
        if (err) console.error(err);
        else console.table(rows);
    });
    db.all("SELECT * FROM firs LIMIT 1", (err, rows) => {
        if (err) console.error(err);
        else console.log("First FIR row:", rows[0]);
    });
    db.close();
});
