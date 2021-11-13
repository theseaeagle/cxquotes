var express = require('express');
var rp = require('request-promise');
var unirest = require('unirest');
var app = express();



app.set("view engine", "ejs");

//Database
var fs = require('fs');
var dbFile = 'quotes.db';
var exists = fs.existsSync(dbFile);
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(dbFile);

// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(function(){
  if (exists) {
    //db.run('CREATE TABLE Track (id INTEGER PRIMARY KEY, lastNumber INTEGER)');
	db.prepare(`CREATE TABLE IF NOT EXISTS Track (id INTEGER PRIMARY KEY, lastNumber INTEGER)`).run().finalize();
    console.log('New table Track created!');
	//insert defaultStatus
	
	db.run(`INSERT INTO Track (id,lastNumber) VALUES(?,?)`, [1,1], function(err) {
		if (err) {
		  //return console.log(err.message);
		}
		// get the last insert id
		console.log(`A row has been inserted with rowid ${this.lastID}`);
	});

  }
});
//End Database

//function getQuote(quoteFromDB){
const getQuote = new Promise((success) =>	{
    db.serialize(function(callback) {
		var quoteFromDB="";
		db.get("SELECT * FROM Track WHERE Id = 1", (err, row)=>{
			var lastnumber= parseInt(row.lastNumber,10);
			var nextnumber = lastnumber+1;
			var updatesql = 'UPDATE Track SET  lastNumber=' + nextnumber + ' WHERE id=1';
			db.run(updatesql,function(err) { 
				if (err || this.changes==0) {
					//console.error(err.message);
					var insertsql = 'INSERT INTO Track(id,lastNumber)  VALUES(1,1)';
					db.run(insertsql);
				}
				console.log('Row(s) updated: ${this.changes}');
				//return;
			});
			//Get Quotes
			db.get("SELECT * FROM quotes WHERE Id =" + lastnumber, (err, row)=>{
				//console.log(JSON.stringify(o));
				//quoteFromDB = JSON.stringify(o);
    				//res.end(JSON.stringify({ data: {quoteAuthor: row.quoteAuthor} }));
				var data = JSON.stringify({ data: {quoteAuthor: row.quoteAuthor, quoteText: row.quoteText}});
				success(data);
			});
		});
		//console.log(quoteFromDB);
   });
   
   
});


app.get('/ifttt/v1/queries/quote', function (req, res) {
	getQuote.then(function(result){
		ress = result; // Now you can use res everywhere
		
	});
	res.setHeader('Content-Type', 'application/json');
	getQuote.then(res.end.bind(res));
	//getQuote.then(res.json.bind(res));

	//console.log(getQuote.result);
    //res.send();
});

app.post('/ifttt/v1/test/setup', function (req, res) {
	var ifttchannelkey = req.get("IFTTT-Channel-Key");
	var ifttservicekey = req.get("IFTTT-Service-Key");
	//var ifttchannelkey = req.headers['IFTTT-Channel-Key']; 
	//var ifttservicekey = req.headers['IFTTT-Service-Key'];
	
	console.log("KEYS ARE" + ifttchannelkey + " " + ifttservicekey);
	
	if(ifttchannelkey=="INVALID"){
		res.status(400).json({ "errors": {"message": 'Edit successful!'}});
		//var data = JSON.stringify({ data: {quoteAuthor: row.quoteAuthor, quoteText: row.quoteText}});
		//var data2 = JSON.stringify({ errors: {message: Something Wrong, code: 2}});
		//res.end(data2)
	}
	if(ifttservicekey=="INVALID"){
		
	     res.status(400).json({ "errors": {"message": 'Edit successful!'}});
		//var data = JSON.stringify({ data: {quoteAuthor: row.quoteAuthor, quoteText: row.quoteText}});
		//var data2 = JSON.stringify({ errors: {message: Something Wrong, code: 2}});
		//res.end(data2)	
		
	}
	
	getQuote.then(function(result){
		ress = result; // Now you can use res everywhere
		
	});
	res.setHeader('Content-Type', 'application/json');
	getQuote.then(res.end.bind(res));
	//getQuote.then(res.json.bind(res));

	//console.log(getQuote.result);
    //res.send();
});


app.listen(process.env.PORT, function () {
  console.log('Example app listening on port 3001!');
});
