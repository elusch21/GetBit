const MongoClient = require('mongodb').MongoClient;
// insert mongodb access here --> const uri = 
var http = require('http');
var url = require('url');

http.createServer(function (req, res) {
	res.writeHead(200, {'Content-Type': 'text/html'});
	var qobj = url.parse(req.url, true).query;
	var fullname = qobj.fullname, username = qobj.username, password = qobj.password;
	var myObj = { "Full Name": fullname, "Username": username, "Password": password };

	MongoClient.connect(uri, function(err, db) {
		if (err)	throw err;
	   	
	   	// access database called "GetBit"
	    var dbo = db.db("GetBit");

	    // insert entry in the MongoDB database w/ collection called "User_Info"  
		dbo.collection("User_Info").insertOne(myObj, function(err, res) {
	        if (err)	throw err;
	        
	        console.log("1 entry inserted :)");
	        db.close();
    	});
	});
	//res.end();
}).listen(8080);