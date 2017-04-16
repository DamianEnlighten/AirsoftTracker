var express = require('express');
var app = express();
const sql = require('mssql');
const bodyParser = require('body-parser');

app.use(bodyParser.json());

// Add headers
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});


var config = {
    server: 'localhost',
    user: 'airsoftserver',
    password: 'testing',
    database: 'AirsoftMap'
};

init();

function init() {
    console.log("Connecting to DB");

    // connect to your database
    sql.connect(config, function (err) {

        if (err) {
            console.log(err)
            res.send({
                status: '500',
                message: 'DB Connection Error'
            });
        }
    });
}

app.get('/', function (req, res) {
    res.send({
        status: '200',
        message: 'Server Active'
    });
})

//get all users location with given code
app.get('/user/location', function (req, res) {
    var code;
    var locations = [];
    code = req.query.code;
    if (code) {
        console.log("getting locations for " + code);
        getLocations(code, res);
    }
    else {
        res.send({
            status: '400',
            message: 'bad request'
        });
    }
})

app.post('/user/location', function (req, res) {
    //Store users lcoation in BD by device ID
    var device = req.body.deviceId
    console.log("Updating location for " + device);

    if (device) {
        storeLocation(req.body, res);
    }
    else {
        res.send({
            status: '400',
            message: 'bad request'
        });
    }
})

//clean up old users/locations


app.listen(3000, function () {
    console.log('Server listening on port 3000');
})

function storeLocation(location, res) {
    // create Request object
    var request = new sql.Request();

    // query to the database and get the records
    request.query(
        `IF EXISTS (SELECT * FROM locations WHERE deviceId = '` + location.deviceId + `')
			UPDATE locations
			SET lat='`+ location.lat + `', lng='` + location.lng + `',code='` + location.code + `', name='` + location.name + `'
			WHERE deviceId = '`+ location.deviceId + `'
		ELSE
			INSERT Into locations VALUES ('`+ location.name + `',` + location.lat + `,` + location.lng + `,'` + location.code + `','` + location.deviceId + `');`, function (err, results) {

            if (err) {
                console.log(err);
                res.send({
                    status: '400',
                    message: 'bad request'
                });
            }
            else {
                res.send({ status: "200", message: "success" });
            }
        });
}

function getLocations(code, res) {
    // create Request object
    var request = new sql.Request();

    // query to the database and get the records
    request.query('SELECT * FROM locations WHERE locations.code = \'' + code + '\';', function (err, results) {
        if (err) {
            console.log(err);
            res.send({
                status: '400',
                message: 'bad request'
            });
        }
        else {
            // send records as a response
            res.send({ status: "200", message: "success", locations: results.recordset });
        }
    });
}