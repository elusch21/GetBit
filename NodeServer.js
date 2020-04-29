const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://QSEJ:Comp20Final@cluster0-wdjde.mongodb.net/test?retryWrites=true&w=majority";
var http = require('http');
var url = require('url');

var port = process.env.PORT || 3000; //heroku stuff

console.log("hosted on port " + port);

/*README!!!! This is our Server. 
It has defined inputs and outputs.
Inputs should come on the query string.
op: string. "new" for new user, "login" for login, "add" for add coin, "remove" for remove coin.
fullname, username and password should come in as fullname, username, and password respectively.
eg: www.<our-url>.com/?op=new&fullname=admin&username=test&password=testpass*/

http.createServer(function (req, res) {
	//parse url, decide operation
	var qobj = url.parse(req.url, true).query;
	var op = qobj.op;
	var fullname = qobj.fullname, username = qobj.username, password = qobj.password, coin = qobj.coin;

	//MAIN CONTROL FLOW: DECISION BASED ON OP PARAMETER//
	if (op == "new") {
		/*INSERTION INTO MONGO/SIGNUP REQUEST
		input: username, password
		output:
			success - string/boolean: 'true' if successfully added, 'false' otherwise
			reason - if success false, is a string holding reason, else null
			coins - empty array of coins for js purposes*/

		var myObj = { "Username": username, "Password": password};
		MongoClient.connect(uri, function(err, db) {
			if (err) {
				//failure
				res.writeHead(301, {'Location': 'https://elusch21.github.io/GetBit/SignUp.html?success=false&reason=connect_fail'});
				throw err;
			}
			// access database called "GetBit"
			var dbo = db.db("GetBit");
			dbo.collection("User_Info").find(myObj).toArray(function(err, result) {
				if (err) {
					res.writeHead(301, {'Location': 'https://elusch21.github.io/GetBit/SignUp.html?success=false&reason=connect_fail'});
					throw err;
				}
				if (result.length != 0) {
					db.close();
					res.writeHead(301, {'Location': 'https://elusch21.github.io/GetBit/SignUp.html?success=false&reason=bad_acct'})
					res.end();
				} else {
					var myObj = { "Full Name": fullname, "Username": username, "Password": password, "Coins": []};
					// insert entry in the MongoDB database w/ collection called "User_Info"
					dbo.collection("User_Info").insertOne(myObj, function(err, resp) {
						if (err) {
							res.writeHead(301, {'Location': 'https://elusch21.github.io/GetBit/SignUp.html?success=false&reason=insert_fail'});
							throw err;
						}
						console.log("New User Created");
						db.close();
						res.writeHead(301,{'Location':'https://elusch21.github.io/GetBit/Account.html?success=true&username=' + username + '&password=' + password});
						res.end();
					});
				}
			});
		});
	} else if (op == "login") {
		/*LOG IN REQUEST
		input: username
		output:
			success - string/boolean: 'true' if successful authentication, 'false' otherwise
			reason - if success false, is a string holding reason, else null
			coins - array of all coins that successfully authenticated user has tracked*/

		var myObj = { "Username": username };
		MongoClient.connect(uri, function(err, db) {
			if (err) {
				//failure
				res.writeHead(301, {'Location': 'https://elusch21.github.io/GetBit/Login.html?success=false&reason=connect_fail'});
				throw err;
			}
			// access database called "GetBit"
			var dbo = db.db("GetBit");
			// find user in the MongoDB database w/ collection called "User_Info"
			dbo.collection("User_Info").find(myObj).toArray(function(err, result) {
				if (err) {
					res.writeHead(301, {'Location': 'https://elusch21.github.io/GetBit/Login.html?success=false&reason=connect_fail'});
					throw err;
				}
				// No users with entered username exists
				if(result.length == 0) {
					db.close();
					res.writeHead(301, {'Location': 'https://elusch21.github.io/GetBit/Login.html?success=false&reason=login_fail'});
					res.end();
				} else { 
				// User with entered username exists
					var flag = 0, index;
					for(i=0; i<result.length; i++) {
						if(result[i]["Password"] == password) {
							flag = 1;
							index = i;
						}
					}
					if(flag == 0) { // If password is entered incorrectly
						db.close();
						res.writeHead(301, {'Location': 'https://elusch21.github.io/GetBit/Login.html?success=false&reason=wrong_pass'});
						res.end();
					} else { // If password is entered correctly
						console.log("Building string, coins.length: " + result[index]["Coins"].length);
						var string = 'https://elusch21.github.io/GetBit/Account.html?success=true&username=' + username + '&password=' + password +'&coins=[';
						for(i = 0; i < result[index]["Coins"].length; i++) {
							string += "'" + result[index]["Coins"][i] + "'";
							if(i < result[index]["Coins"].length-1) {
								string += ",";
							}
						}
						string += ']';
						console.log(string);
						db.close();
						res.writeHead(301,{'Location': string});
						res.end();
					}
				}
			});
		});
	} else if (op == "add") {
		/*ADD COIN
		input: username, password, coin
		output:
			success - string/boolean: 'true' if successful addition, 'false' otherwise
			reason - if success false, is a string holding reason, else null
			coins - array of all coins that successfully authenticated user has tracked*/
		var myObj = { "Username": username, "Password": password };
		MongoClient.connect(uri, function(err, db) {
			if (err) {
				//failure
				res.writeHead(301, {'Location': 'https://elusch21.github.io/GetBit/Account.html?success=false&reason=connect_fail'});
				throw err;
				console.log("connect error");
			}
			// access database called "GetBit"
			var dbo = db.db("GetBit");
			// update the user's coins in the MongoDB database w/ collection called "User_Info"
			dbo.collection("User_Info").updateOne(myObj, { $push: { Coins: {$each: [coin]} } }, function(err, resol) {
				if (err) {
					res.writeHead(301, {'Location': 'https://elusch21.github.io/GetBit/Account.html?success=false&reason=connect_fail'});
					throw err;
					console.log("update error");
				} else if (resol.modifiedCount == 1) { // successful update, now need to query user to build return string
					dbo.collection("User_Info").find(myObj).toArray(function(err, result) {
						if (err) {
							res.writeHead(301, {'Location': 'https://elusch21.github.io/GetBit/Login.html?success=false&reason=connect_fail'});
							throw err;
						}
						if(result.length != 1) {
							db.close();
							//unthinkable
							res.writeHead(301, {'Location': 'https://elusch21.github.io/GetBit/Login.html?success=false&reason=login_fail'});
							res.end();
						} else { //correct path
							console.log("Building string, coins.length: "+ result[0]["Coins"].length);
							var string = 'https://elusch21.github.io/GetBit/Account.html?success=true&username=' + username + '&password=' + password +'&coins=[';
							for(i = 0; i < result[0]["Coins"].length; i++) {
								string += "'" + result[0]["Coins"][i] + "'";
								if(i < result[0]["Coins"].length-1) {
									string += ", ";
								}
							}
							string += ']';
							console.log(string);
							db.close();
							res.writeHead(301,{'Location': string});
							res.end();
						}
					});
				} else {
					//the unthinkable! Shouldn't happen!
				}
			});
		});
	} else if (op == 'remove') {
		/*REMOVE COIN
		input: username, password, coin
		output:
			success - string/boolean: 'true' if successful removal, 'false' otherwise
			reason - if success false, is a string holding reason, else null
			coins - array of all coins that successfully authenticated user has tracked*/
		var myObj = { "Username": username, "Password": password };
		MongoClient.connect(uri, function(err, db) {
			if (err) {
				//failure
				res.writeHead(301, {'Location': 'https://elusch21.github.io/GetBit/Account.html?success=false&reason=connect_fail'});
				throw err;
				console.log("connect error");
			}
			// access database called "GetBit"
			var dbo = db.db("GetBit");
			// update the user's coins in the MongoDB database w/ collection called "User_Info"
			dbo.collection("User_Info").updateOne(myObj, { $pull: { Coins: coin } }, function(err, resol) {
				if (err) {
					res.writeHead(301, {'Location': 'https://elusch21.github.io/GetBit/Account.html?success=false&reason=connect_fail'});
					throw err;
					console.log("update error");
				} else if (resol.modifiedCount == 1) { // successful update, now need to query user to build return string
					dbo.collection("User_Info").find(myObj).toArray(function(err, result) {
						if (err) {
							res.writeHead(301, {'Location': 'https://elusch21.github.io/GetBit/Login.html?success=false&reason=connect_fail'});
							throw err;
						}
						if(result.length != 1) {
							db.close();
							//unthinkable
							res.writeHead(301, {'Location': 'https://elusch21.github.io/GetBit/Login.html?success=false&reason=login_fail'});
							res.end();
						} else { //correct path
							console.log("Building string, coins.length: " + result[0]["Coins"].length);
							var string = 'https://elusch21.github.io/GetBit/Account.html?success=true&username=' + username + '&password=' + password +'&coins=[';
							for(i = 0; i < result[0]["Coins"].length; i++) {
								string += "'" + result[0]["Coins"][i] + "'";
								if(i < result[0]["Coins"].length-1) {
									string += ", ";
								}
							}
							string += ']';
							console.log(string);
							db.close();
							res.writeHead(301,{'Location': string});
							res.end();
						}
					});
				} else {
					//the unthinkable! Shouldn't happen!
				}
			});
		});
	} else {
		//the unthinkable! Shouldn't happen!
	}
}).listen(port);