# Crime Data Management System (CDMS)

A comprehensive crime data management platform for storing, organizing, and retrieving structured data related to FIRs, criminal profiles, victims, police officers, cases, evidence, and news articles.

## Features

- **FIR Management**: Register and track First Information Reports
- **Criminal Profiles**: Maintain detailed criminal records and history
- **Case Tracking**: Monitor case lifecycle from registration to closure
- **Evidence Management**: Store and organize case evidence
- **News Integration**: Link verified news articles to relevant cases
- **Role-Based Access**: Different access levels for administrators, police officers, and public
- **Advanced Querying**: Generate crime statistics and analysis reports

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite
- **Frontend**: HTML, CSS, JavaScript

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/CDMS.git
cd CDMS
```

2. Install dependencies:
```bash
npm install
```

3. Initialize the database:
```bash
node seed.js
```

4. Start the server:
```bash
node server.js
```

5. Open your browser and navigate to:
```
http://localhost:3000
```

## Project Structure

```
CDMS/
├── backend/                # Server Layer (Node.js/Express)
│   ├── app.js              # Server entry point
│   ├── routes/             # API Router modules
│   │   ├── firs.js         # FIR & Case endpoints
│   │   └── stats.js        # Statistics & Stations endpoints
│   └── services/           # Business logic services
│       └── pdfService.js   # PDF generation module
├── database/               # Data Layer (SQLite)
│   ├── db.js               # Database configuration
│   ├── seed.js             # Initial data seeding
│   ├── inspect_db.js       # Database inspection tool
│   └── crime_transparency.db # Local database (git-ignored)
└── frontend/               # Presentation Layer (HTML/CSS/JS)
    ├── index.html          # Hero Landing Page
    ├── portal.html         # Data Transparency Portal
    ├── css/                # Stylesheets
    ├── js/                 # Client-side logic
    └── assets/             # Media & animations
```

## Development Team
- **Abin Mathew Biju**
- **Adithyan Gireesh Kumar**
- **Amal Mathew Abraham**

## Installation & Running

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Integrated Server**:
   ```bash
   node backend/app.js
   ```

3. **Access the Portal**:
   Open `http://localhost:3000` in your browser.

## API Architecture
The system follows a RESTful pattern with modular routing:
- `GET /api/firs` - Search/Filter FIR records
- `GET /api/stats` - Live crime statistics
- `GET /api/firs/:id/pdf` - Dynamic PDF report generation

## Contributing
Contributions are welcome! Please follow the architectural patterns established in the `backend/` and `frontend/` folders.

## License
MIT License
