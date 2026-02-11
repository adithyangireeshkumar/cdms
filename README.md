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
├── server.js          # Express server and API routes
├── db.js              # Database configuration
├── seed.js            # Database seeding script
├── public/            # Frontend files
│   ├── index.html     # Main HTML file
│   ├── style.css      # Styling
│   └── script.js      # Client-side JavaScript
└── package.json       # Dependencies
```

## API Endpoints

- `GET /api/firs` - Get all FIRs
- `POST /api/firs` - Create new FIR
- `GET /api/cases` - Get all cases
- `GET /api/criminals` - Get criminal records
- And more...

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License
