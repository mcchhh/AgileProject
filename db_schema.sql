
-- This makes sure that foreign_key constraints are observed and that errors will be thrown for violations
PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

-- Create your tables with SQL commands here (watch out for slight syntactical differences with SQLite)

CREATE TABLE IF NOT EXISTS carparks ( 
    id INTEGER PRIMARY KEY, 
    carparkNumber Text, 
    totalLots INTEGER, 
    lotsAvailable INTEGER,
    lotType TEXT,
    updateDatetime TEXT
);

CREATE TABLE IF NOT EXISTS carparkinfo(
    id INTEGER PRIMARY KEY,
    car_park_no TEXT,
    address TEXT,
    x_coord REAL,
    y_coord REAL,
    car_park_type TEXT,
    type_of_parking_system TEXT,
    short_term_parking TEXT,
    free_parking TEXT,
    night_parking TEXT,
    car_park_decks INTEGER,
    gantry_height REAL,
    car_park_basement INTEGER
);


CREATE TABLE IF NOT EXISTS userCredentials(
    id  INTEGER PRIMARY KEY AUTOINCREMENT, 
    loginName TEXT,
    loginEmail TEXT, 
    loginPassword INTEGER
);

CREATE TABLE IF NOT EXISTS newcarparkinfo (
    id INTEGER PRIMARY KEY,
    CarParkID TEXT,
    Area TEXT,
    Development TEXT,
    Location TEXT,
    AvailableLots INTEGER,
    LotType TEXT,
    Agency TEXT
);

-- Insert default data (if necessary here)
-- Table for the signup_form 
INSERT OR IGNORE INTO userCredentials ("loginName", "loginEmail", "loginPassword") 
VALUES ('William', 'williamlow@gmail.com', 'will08');

COMMIT;



