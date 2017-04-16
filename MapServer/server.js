var express = require('express');
var app = express();
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'me',
    password: 'secret',
    database: 'my_db'
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
    res.send({
        status: '200',
        players:[]
    });
})

app.post('/user/location', function (req, res) {
    //Store users lcoation in BD by device ID

    res.send({ status: "200", message: "success" });
})

//clean up old users/locations


app.listen(3000, function () {
    console.log('Server listening on port 3000')
})


function storeLocation() {

    connection.connect();

    connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
        if (error) console.error(error);
        console.log('The solution is: ', results[0].solution);
    });

    connection.end();
}

function getLocations() {

    connection.connect();

    connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
        if (error) console.error(error);
        console.log('The solution is: ', results[0].solution);
    });

    connection.end();
}