// SERVER-SIDE 

const axios = require('axios'); // Library required for LTA API documentation 
const ejs = require('ejs');
const express = require('express');
const serverless = require('serverless-http');
// const mainRoutes = require('./routes/main');
const sqlite3 = require('sqlite3').verbose();
const path = require('path'); // Import the 'path' module
const cron = require('node-cron');
const fs = require('fs');
const csvParser = require('csv-parser');
const { rejects } = require('assert');
const app = express();
const router = express.Router();
const port = 5000;

const db = new sqlite3.Database('database.db');


const API_URL = 'https://api.data.gov.sg/v1/transport/carpark-availability';
const API_URL_ERP = 'http://datamall2.mytransport.sg/ltaodataservice/ERPRates';
const API_KEY = 'pLVbWkqRRpKBmEwLHF//6w==';

app.set("views", path.join(__dirname, "views")); // Use 'path.join' for cross-platform compatibility
app.set("view engine", "ejs");


app.use(express.static(__dirname + '/public'));



//Insert intial data
(async()=>{
  try{
    //CSV to table
    fs.createReadStream('./data/HDBCarparkInformation.csv')
    .pipe(csvParser())
    .on('data', async (row)=>{
      const {car_park_no, address, x_coord, y_coord, car_park_type, type_of_parking_system, short_term_parking, free_parking, night_parking, car_park_decks, gantry_height, car_park_basement } = row;
      await db.run('INSERT INTO carparkinfo (car_park_no, address, x_coord, y_coord, car_park_type, type_of_parking_system, short_term_parking, free_parking, night_parking, car_park_decks, gantry_height, car_park_basement) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [car_park_no, address, x_coord, y_coord, car_park_type, type_of_parking_system, short_term_parking, free_parking, night_parking, car_park_decks, gantry_height, car_park_basement]);
    })
    .on('end', ()=>{
      console.log('CSV file processing completed.');
    });

    //Insert Intial data
    const response = await axios.get(API_URL);
    const apiData = response.data.items[0].carpark_data;
    
    apiData.forEach(async (carpark)=> {
      const { carpark_number, carpark_info, update_datetime} = carpark;
      const { total_lots, lots_available, lot_type} = carpark_info[0];

      await db.run('INSERT INTO carparks (carparkNumber, totalLots, lotsAvailable, lotType, updateDatetime) VALUES (?,?,?,?,?)',
      [carpark_number, total_lots, lots_available, lot_type, update_datetime]);

    });
    
    console.log('Intial data inserted successfully');


    //For ERP rates
    const erpResponse = await axios.get(API_URL_ERP, {
      headers: {
        AccountKey: API_KEY,
        accept: 'application/json'
      }
    });
    const erpData = erpResponse.data;

    for(const erpRate of erpData.value){
      const { VehicleType, DayType, StartTime, EndTime, ZoneID, ChargeAmount, EffectiveDate } = erpRate;

      await db.run('INSERT INTO erprates (VehicleType, DayType, StartTime, EndTime, ZoneID, ChargeAmount, EffectiveDate) VALUES (?,?,?,?,?,?,?)',
      [VehicleType,DayType,StartTime,EndTime,ZoneID,ChargeAmount,EffectiveDate]);
    }
    console.log('ERP data inserted succesfully');
    
  }catch(error){
    console.error('Error inserting intial data',error);
  }
})();

//Update data in database every 5 mins
cron.schedule('*/5 * * * *', async()=>{
  try{
    const response = await axios.get(API_URL);
    const apiData = response.data.items[0].carpark_data;

    apiData.forEach(async (carpark)=>{
      const { carpark_number, carpark_info, update_datetime} = carpark;
      const { total_lots, lots_available} = carpark_info[0];

      await db.run('UPDATE carparks SET totalLots = ?, lotsAvailable =?, updateDatetime =? WHERE carparkNumber = ?',
      [total_lots, lots_available, update_datetime, carpark_number]);  
    });
    console.log('Data updated successfully');
  } catch(error) {
    console.error('Error updating data', error);
  }
});

//ErpRates on ejs
app.get('/test', async (req, res) => {
  try {
      db.all('SELECT * FROM erprates', (err, rows) => {
          if (err) {
              console.error(err);
              res.status(500).send('An error occurred.');
          } else {
              //res.json(rows);
              res.render('test',{erpRatesData: rows});
          }
      });
  } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred.');
  }
});

app.get('/', (req,res)=>{
  res.render('index.ejs');
})

app.get('/signup', (req,res)=>{
  res.render('signup.ejs');
})

// Define a route to render the loggedin.ejs page
app.get('/loggedinhome', (req, res) => {
  res.render('loggedinhome.ejs'); // Replace 'loggedin' with your actual template name
});
// app.get('/home', (req, res) => {
//     db.all('SELECT * FROM carparks', (err, rows) => {
//         if (err) {
//             console.error(err);
//             return res.sendStatus(500);
//         }
//         res.render('home', { carparks: rows }); // Pass the 'carparks' data to the template
//     });
// });
app.get('/locations', async(req,res)=>{
  try{
   let carparkInfoData = await new Promise((resolve, reject)=>{
    db.all('SELECT car_park_no, address, car_park_type, short_term_parking, free_parking, night_parking, type_of_parking_system FROM carparkinfo', (err, rows)=>{
      if(err){
        reject(err);
      } else{
        resolve(rows);
      }
    });
   });

   let carparksData = await new Promise((resolve, reject)=>{
    db.all('SELECT carparkNumber, totalLots, lotsAvailable FROM carparks', (err, rows)=>{
      if(err){
        reject(err);
      } else{
        resolve(rows);
      }
    });
   });

   // Sort the carparksData array by carparkNumber
   carparksData = carparksData.slice().sort((a, b) => a.carparkNumber.localeCompare(b.carparkNumber));
   
   
   res.render('locations', {carparkInfoData, carparksData});
  //  res.render('map');
  } catch(error){
    console.error('Error fetching data:', error);
    res.status(500).send('An error occurred while fetching data.');
  }
});

app.get('/loggedinlocations', async(req,res)=>{
  try{
   let carparkInfoData = await new Promise((resolve, reject)=>{
    db.all('SELECT car_park_no, address, car_park_type, short_term_parking, free_parking, night_parking, type_of_parking_system FROM carparkinfo', (err, rows)=>{
      if(err){
        reject(err);
      } else{
        resolve(rows);
      }
    });
   });

   let carparksData = await new Promise((resolve, reject)=>{
    db.all('SELECT carparkNumber, totalLots, lotsAvailable FROM carparks', (err, rows)=>{
      if(err){
        reject(err);
      } else{
        resolve(rows);
      }
    });
   });

   // Sort the carparksData array by carparkNumber
   carparksData = carparksData.slice().sort((a, b) => a.carparkNumber.localeCompare(b.carparkNumber));
   
   
   res.render('loggedinlocations', {carparkInfoData, carparksData});
  //  res.render('map');
  } catch(error){
    console.error('Error fetching data:', error);
    res.status(500).send('An error occurred while fetching data.');
  }
});
   

app.get('/reservations', (req, res) => {
  res.render('reservations.ejs');
});

app.get('/reservedLot', (req, res) => {
  res.render('reservedLot.ejs');
});

app.get('/home', (req, res) => {
  res.render('index.ejs');
});

app.get('/about', (req, res) => {
  res.render('about.ejs');
});

app.get('/loggedinabout', (req, res) => {
  res.render('loggedinabout.ejs');
});

app.get('/favourites', (req, res) => {
  res.render('favourite.ejs');
});

app.get('/get-first-5', async (req, res) => {
  try {
      db.all('SELECT * FROM carparks LIMIT 5', (err, rows) => {
          if (err) {
              console.error(err);
              res.status(500).send('An error occurred.');
          } else {
              res.json(rows);
          }
      });
  } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred.');
  }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

app.use('/.netlify/home', router);
module.exports.handler = serverless(app);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

