var express = require('express');
var app = express();
const sql = require('mssql');
var bodyParser = require('body-parser');

app.use(bodyParser.json());

var config = {
    server: 'localhost',
    user: 'airsoftserver',
    password: 'testing',
    database: 'AirsoftMap'
};

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
	if (code) {
		console.log("getting locations for "+code);
		getLocations(code,res);
	}
	else{
		res.send({
			status: '400',
			message: 'bad request'
		});
	}
})

app.post('/user/location', function (req, res) {
    //Store users lcoation in BD by device ID
	var device= req.body.deviceId
	if (device) {
		console.log("Updating location for "+ device);
		storeLocation(req.body,res);
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

function storeLocation(location,res) {
	// connect to your database
    sql.connect(config, function (err) {
    
        if (err) {
			console.log(err)
			res.send({
				status: '500',
				message: 'DB Connection Error'
			});
		}

        // create Request object
        var request = new sql.Request();
           
        // query to the database and get the records
        request.query(
		`IF EXISTS (SELECT * FROM locations WHERE deviceId = '`+location.deviceId+`')
			UPDATE locations
			SET lat='`+location.lat+`', lng='`+location.lng+`',code='`+location.code+`', name='`+location.name+`'
			WHERE deviceId = '`+location.deviceId+`'
		ELSE
			INSERT Into locations VALUES ('`+location.name+`',`+location.lat+`,`+location.lng+`,'`+location.code+`','`+location.deviceId+`');`, function (err, results) {
            
            if (err) {			
				console.log(err);
				res.send({
					status: '400',
					message: 'bad request'
				});
			}
			else{
				res.send({ status: "200", message: "success" });
			}
            sql.close();
        });
    });
}

function getLocations(code,res) {
	
	// connect to your database
    sql.connect(config, function (err) {
    
        if (err) {
			console.log(err)
			res.send({
				status: '500',
				message: 'DB Connection Error'
			});
		}

        // create Request object
        var request = new sql.Request();
           
        // query to the database and get the records
        request.query('SELECT * FROM locations WHERE locations.code = \''+code+'\';', function (err, results) {
            console.log(results);
            if (err) {			
				console.log(err);
				res.send({
					status: '400',
					message: 'bad request'
				});
			}
			else
			{
				// send records as a response
				res.send({ status: "200", message: "success", locations:results.recordset });
			}
            sql.close();
        });
    });
}