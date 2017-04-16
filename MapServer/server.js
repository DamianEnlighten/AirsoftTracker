var express = require('express');
var app = express();
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'airsoftserver',
    password: 'serverTime',
    database: 'AirsoftMap'
});

//Server=localhost\SQLEXPRESS;Database=master;Trusted_Connection=True;

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
    locations = getLocations(code);

    if (locations !== 'error') {
        res.send({
            status: '200',
            players: locations,
            message: 'success' 
        });
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

    //INSERT INTO locations (name,lat,lng,code)
    //VALUES('Squad 1', 42.2398235, -83.2351095, 'ghost');
    console.log(req.data);

    res.send({ status: "200", message: "success" });
})

//clean up old users/locations


app.listen(3000, function () {
    console.log('Server listening on port 3000')
})


function storeLocation(location) {

    connection.connect();
    connection.query('INSERT INTO locations VALUES (' + location.name + ',' + location.lat + ',' + location.lng + ',' + location.code + ',' + location.deviceId +') ON DUPLICATE KEY UPDATE;', function (error, results, fields) {
        if (error) console.error(error);
        console.log('The solution is: ', results[0].solution);
    });

    connection.end();
}

function getLocations(code) {

    connection.connect();
    connection.query('SELECT * FROM locations WHERE locations.code = '+code+';', function (error, results, fields) {
        if (error) {
            console.error(error);
            return 'error';
        }
        console.log('The solution is: ', results);
        return results;
    });

    connection.end();
}