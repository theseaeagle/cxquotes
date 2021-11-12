var express = require("express");
var rp = require('request-promise');
var unirest = require('unirest');

const express_app = express()
const port = 3000

express_app.set("view engine", "ejs");


//Database
var fs = require('fs');
var dbFile = 'data/sqlite.db';
var exists = fs.existsSync(dbFile);
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(dbFile);

// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(function(){
  if (!exists) {
    db.run('CREATE TABLE Dreams (id INTEGER PRIMARY KEY, dream TEXT,parameters TEXT,parameter2 TEXT,user TEXT, time DATETIME DEFAULT CURRENT_TIMESTAMP)');
    db.run('CREATE TABLE Songs (id INTEGER PRIMARY KEY, songpath TEXT,songname TEXT, artist TEXT,time DATETIME DEFAULT CURRENT_TIMESTAMP)');
    console.log('New table Dreams created!');
    
    // insert default dreams
    db.serialize(function() {
      db.run('INSERT INTO Dreams (id,dream,time) VALUES ("1","No Command",strftime("%s","now"))');
    });
  }
  else {
    console.log('Database "Dreams" ready to go!');
    db.each('SELECT * from Dreams', function(err, row) {
      if ( row ) {
        console.log('record:', row);
      }
    });
  }
});

//End Database




function updateDB(command,parameter,parametertwo,email){
    db.serialize(function() {
        var updatesql = 'UPDATE Dreams SET  dream="' + command + '", parameters="'+ parameter +'",parameter2="' + parametertwo + '",user="' + email + '", time=strftime("%s","now") WHERE user="' + email + '"';
        db.run(updatesql,function(err) { 
          if (err || this.changes==0) {
            //console.error(err.message);
            var insertsql = 'INSERT INTO Dreams(dream,parameters,parameter2,user,time)  VALUES("' + command + '", "' + parameter + '","' + parametertwo + '","' + email + '", strftime("%s","now"))';
            db.run(insertsql);
          }
            console.log('Row(s) updated: ${this.changes}');
            return;
        });
   });
}




express_app.get('/', function(request, response) {
  user = request.query.email;
  db.all('SELECT * from Dreams WHERE user="'+ user + '"', function(err, rows) {
    response.send(JSON.stringify(rows));
  });
});

express_app.get('/tos', function(request, response) {
  response.sendFile(__dirname + '/views/tos.html');
});

express_app.get('/pp', function(request, response) {
  response.sendFile(__dirname + '/views/pp.html');
});

express_app.get('/songs', function(request, response) {
  response.sendFile(__dirname + '/songs/NoTearsLeftToCry.mp3');
});


express_app.get('/uploadsongs', function(request, response) {
  response.sendFile(__dirname + '/managesongs/managesongs.html');
});



express_app.listen(PORT, () => console.log("Listening on port " + PORT + "."));
