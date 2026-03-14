const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const firRoutes = require('./routes/firs');
const statsRoutes = require('./routes/stats');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Register Routes
app.use('/api/firs', firRoutes);
app.use('/api', statsRoutes);

app.listen(PORT, () => {
    console.log(`Modular Server running at http://localhost:${PORT}`);
});
