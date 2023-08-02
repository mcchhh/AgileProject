// SERVER-SIDE 

const axios = require('axios'); // Library required for LTA API documentation 
const ejs = require('ejs');
const express = require('express');
const path = require('path'); // Import the 'path' module

const app = express();
const port = 4000;

const API_KEY = 'pLVbWkqRRpKBmEwLHF//6w==';

const main = require('./main'); // Import the main.js module


// Define the API endpoint
const API_URL = 'http://datamall2.mytransport.sg/ltaodataservice/ERPRates';

// Set request headers with your API key
const headers = {
  AccountKey: API_KEY,
  accept: 'application/json'
};


app.set("views", path.join(__dirname, "views")); // Use 'path.join' for cross-platform compatibility
app.set("view engine", "ejs");


// Use 'express.static' middleware to serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'css')));

// DATA GOV API route and other routes defined in main.js
main(app);


// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));



    // ERP RATES WITHOUT RENDERING & ONLY HAVE THE DATA BUT NOT THE PRICING. 
  // MIGHT BE ABLE TO REMOVE THIS VIEW AS IT IS NOT NEEDED. 
//   app.get('/get-erp-rates', (req, res) => {
//     axios.get(API_URL, { headers })
//       .then(response => {
//         const erpRates = response.data.value;
//         res.json({ erpRates: erpRates });
//       })
//       .catch(error => {
//         console.error('Error fetching ERP rates:', error);
//         res.status(500).send('Error fetching ERP rates');
//       });
//   });