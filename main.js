const axios = require('axios');

// const express = require('express');
const API_URL = 'http://datamall2.mytransport.sg/ltaodataservice/ERPRates';
const API_KEY = 'pLVbWkqRRpKBmEwLHF//6w==';
const headers = {
    AccountKey: API_KEY,
    accept: 'application/json'
  };
  

  

module.exports = function (app) {

    // app.get("/", function (req, res) {
    //     res.render("homepage.ejs");
    //   });

    // DATA GOV API DOCUMENTATION BELOW - URL 
    app.get('/', (req, res) => {
        // Fetch real-time data from the API
        axios
            .get('https://api.data.gov.sg/v1/transport/carpark-availability')
            .then(response => {
                const jsonData = response.data;
                // Extract the carpark information from the API response
                const carparkInfo = jsonData.items[0].carpark_data;
                res.render('home.ejs', { carparkInfo: carparkInfo });
            })
            .catch(error => {
                console.error(error);
                res.status(500).send('Error fetching data from API');
            });
    });

    db.all(" SELECT * FROM userLogins", function(err,data){
  
        if(err){
          console.error(err);
          process.exit(1);
        }else{
          console.log(data);
        }
      })
    
    
  // ACTUAL VIEW FOR THE ERP-RATES WEBPAGE  
    app.get('/erp-rates', (req, res) => {
        axios
            .get(API_URL, { headers })
            .then(response => {
                const erpRates = response.data.value;
                res.render('erpRates.ejs', { erpRates: erpRates });
            })
            .catch(error => {
                console.error('Error fetching ERP rates:', error);
                res.status(500).send('Error fetching ERP rates');
            });
    });

}