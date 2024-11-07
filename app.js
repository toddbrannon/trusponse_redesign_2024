const express = require('express');
const path = require('path');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON bodies
app.use(express.json());
// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.render('index', { title: 'Trusponse - AI-Powered Business Solutions' });
});

app.get('/get-started', (req, res) => {
  res.render('get-started', { title: 'Get Started - TruSponse' });
});

app.post('/submit-service-selection', async (req, res) => {
  console.log('Service Account Email:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
  console.log('Sheet ID:', process.env.GOOGLE_SHEET_ID);
  console.log('Private Key Length:', process.env.GOOGLE_PRIVATE_KEY.length);
  try {
    const auth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, auth);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0]; // Assumes it's the first sheet

    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      contactMethod, 
      services,
      message
    } = req.body;

    const timeSubmitted = new Date().toISOString();
    
    const serviceColumns = [
      'Data Management & Analysis',
      'Web Development',
      'AI Automation & Agents',
      'Business Intelligence',
      'Chatbots',
      'Custom Software Solutions'
    ];

    const rowData = {
      'Timestamp': timeSubmitted,
      'First Name': firstName,
      'Last Name': lastName,
      'Email': email,
      'Phone': phone,
      'Contact Preference': contactMethod,
      'Message': message
    };

    serviceColumns.forEach(service => {
      rowData[service] = services && services.includes(service.toLowerCase().replace(/\s+/g, '')) ? 'X' : '';
    });

    await sheet.addRow(rowData);

    console.log('Form Submission Data:', req.body);
    res.send('Form submitted successfully!');
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).send('An error occurred while submitting the form.');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});