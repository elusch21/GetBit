const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://QSEJ:Comp20Final@cluster0-wdjde.mongodb.net/test?retryWrites=true&w=majority";
var http = require('http');
var url = require('url');

var port = process.env.PORT || 3000; //heroku stuff

console.log("hosted on port " + port);

/*README!!!! This is our Server. It has defined inputs and outputs.
inputs should come on the query string.
op: string. "new" for new user, "login" for login, "add" for add coin.
fullname, username and hashed password should come in as fullname, username, and password respectively
just do a form submit basically
eg: www.<our-url>.com/?op=new&fullname=admin&username=test&password=<sha512encryptedpass>*/

http.createServer(function (req, res) {
	console.log("Here!");
	//parse url, decide operation
	var qobj = url.parse(req.url, true).query;
	var op = qobj.op;
	var fullname = qobj.fullname, username = qobj.username, password = qobj.password, coin = qobj.coin;
	if (op == "new") {
		/*INSERTION INTO MONGO
		input: username, hashed password
		output:
			success - string/boolean: 'true' if successfully added, 'false' otherwise
			reason - if success false, is a string holding reason, else null
			coins - empty array of coins for js purposes*/
		//code here
		var myObj = { "Full Name": fullname, "Username": username, "Password": password, "Coins": };
		MongoClient.connect(uri, function(err, db) {
			if (err) {
				//failure
				res.writeHead(301, {'Location': 'https://elusch21.github.io/GetBit/Account.html?success=false&reason=connect_fail'});
				throw err;
			}
	   		// access database called "GetBit"
	    	var dbo = db.db("GetBit");
	    	// insert entry in the MongoDB database w/ collection called "User_Info"  
			dbo.collection("User_Info").insertOne(myObj, function(err, resp) {
	        	if (err) {
	        		res.writeHead(301, {'Location': 'https://elusch21.github.io/GetBit/Account.html?success=false&reason=insert_fail'});
	        		throw err;
	        	}
	        
	        	console.log("New User Created");
	        	db.close();
	        	res.writeHead(301,{'Location':'https://elusch21.github.io/GetBit/Account.html?success=true'});
	        	//res.writeHead(301, {'Location':'C:/Users/Ethan/OneDrive/MyDocuments/1Tufts/Soph/Sem2/Comp20/GetBit/Account.html/?success=true'});
	        	res.end();
    		});
		});
	} else if (op == "login") {
		/*LOG IN REQUEST
		input: username, hashed password
		output:
			success - string/boolean: 'true' if successful authentication, 'false' otherwise
			reason - if success false, is a string holding reason, else null
			coins - array of all coins that successfully authenticated user has tracked*/
		
		var myObj = { "Username": username, "Password": password };
		MongoClient.connect(uri, function(err, db) {
			if (err) {
				//failure
				res.writeHead(301, {'Location': 'https://elusch21.github.io/GetBit/Account.html?success=false&reason=connect_fail'});
				throw err;
			}
	   		// access database called "GetBit"
	    	var dbo = db.db("GetBit");

	    	// find user in the MongoDB database w/ collection called "User_Info"  
	    	dbo.collection("User_Info").find(myObj).toArray(function(err, result) {
		    	if (err) {
		    		res.writeHead(301, {'Location': 'https://elusch21.github.io/GetBit/Account.html?success=false&reason=connect_fail'}); 
		    		throw err;
		    	}
		    	
		    	if(result.length == 0) {
		    		db.close();
		    		res.writeHead(301, {'Location': 'https://elusch21.github.io/GetBit/Account.html?success=false&reason=login_fail'});
		    		res.end();
		    	} else if(result[0]["Coins"] == undefined) {
		    		db.close();
		    		res.writeHead(301,{'Location':'https://elusch21.github.io/GetBit/Account.html?success=true&coins='});
		    		res.end();
		    	} else {
		    		var string = "https://elusch21.github.io/GetBit/Account.html?success=true&coins="
		    		for(i=0; i<result[0]["Coins"].length; i++) {
		    			string += result[0]["Coins"][i];
		    			if(i < result[0]["Coins"].length-1) {
		    				string += ",";
		    			}
		    		}
		    		db.close();
		    		res.writeHead(301,{'Location': string});
		    		res.end();
		    	}
		  	});
		});
		
	} else if (op == "add") {
		/*ADD COIN
		input: username, hashed password
		output:
			success - string/boolean: 'true' if successful authentication, 'false' otherwise
			reason - if success false, is a string holding reason, else null
			coins - array of all coins that successfully authenticated user has tracked*/
		/*
		var myObj = { "Username": username, "Password": password };
		MongoClient.connect(uri, function(err, db) {
			if (err) {
				//failure
				res.writeHead(301, {'Location': 'https://elusch21.github.io/GetBit/Account.html?success=false&reason=connect_fail'});
				throw err;
			}
		   	// access database called "GetBit"
		    var dbo = db.db("GetBit");

		    // find user in the MongoDB database w/ collection called "User_Info"  
		    dbo.collection("User_Info").find(myObj).toArray(function(err, result) {
			   	if (err) 
			   		throw err;

			   	dbo.collection("User_Info").update(
				   myObj,   // Query parameter
				   { $push: { Coins: coin } }
				)
			   	db.close();
			   	//res.writeHead(301,{'Location': string});
			   	res.end();
			});
		});
		*/
	}
}).listen(port);