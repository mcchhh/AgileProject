// SERVER-SIDE 

const axios = require('axios');  //Library required for the LTA API documentation 
const ejs = require('ejs');
const express = require('express');


const app = express();
const port = 3000;

// LTA API DOCUMENTATION BELOW - URL 
// Set your LTA DataMall API key - ERP RATES
const API_KEY = 'pLVbWkqRRpKBmEwLHF//6w==';

// Define the API endpoint
const API_URL = 'http://datamall2.mytransport.sg/ltaodataservice/ERPRates';

// Set request headers with your API key
const headers = {
  AccountKey: API_KEY,
  accept: 'application/json'
};


app.set("views",__dirname + "/views"); // Set the views directory
app.set("view engine", "ejs"); // Set the view engine to EJS 
app.engine("html", require("ejs").renderFile);


// DATA GOV API DOCUMENTATION BELOW - URL 
app.get('/', (req, res) => {
  // Fetch real-time data from the API
  axios
    .get('https://api.data.gov.sg/v1/transport/carpark-availability')
    .then(response => {
      const jsonData = response.data;
      // Extract the carpark information from the API response
      const carparkInfo = jsonData.items[0].carpark_data;
      res.render('index.html', { carparkInfo: carparkInfo });
    })
    .catch(error => {
      console.error(error);
      res.status(500).send('Error fetching data from API');
    });
});


// ERP RATES WITHOUT RENDERING & ONLY HAVE THE DATA BUT NOT THE PRICING. 
// MIGHT BE ABLE TO REMOVE THIS VIEW AS IT IS NOT NEEDED. 
app.get('/get-erp-rates', (req, res) => {
  axios.get(API_URL, { headers })
    .then(response => {
      const erpRates = response.data.value;
      res.json({ erpRates: erpRates });
    })
    .catch(error => {
      console.error('Error fetching ERP rates:', error);
      res.status(500).send('Error fetching ERP rates');
    });
});

// ACTUAL VIEW FOR THE ERP-RATES WEBPAGE  
app.get('/erp-rates', (req, res) => {
  axios.get(API_URL, { headers })
    .then(response => {
      const erpRates = response.data.value;
      res.render('erpRates.html', { erpRates: erpRates });
    })
    .catch(error => {
      console.error('Error fetching ERP rates:', error);
      res.status(500).send('Error fetching ERP rates');
    });
});


app.get("/", function (req, res) {
  res.render("index.html")
})


app.listen(port, () => console.log(`Example app listening on port ${port}!`));

