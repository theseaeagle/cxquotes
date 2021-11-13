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
				//console.log(row);
				//create json
				var o = {} // empty Object
				var key = 'data';
				o[key] = []; // empty Array, which you can push() values into


				var data = {
					quoteAuthor: row.quoteAuthor,
					quoteText: row.quoteText
				};
				o[key].push(data);
				//console.log(JSON.stringify(o));
				//quoteFromDB = JSON.stringify(o);
				success(o);
			});
		});
		//console.log(quoteFromDB);
   });
   
   
});


app.get('/', function (req, res) {
	getQuote.then(function(result){
		ress = result; // Now you can use res everywhere
		
	});
	
	getQuote.then(res.send.bind(res));

	//console.log(getQuote.result);
    //res.send();
});


app.listen(3001, function () {
  console.log('Example app listening on port 3001!');
});
