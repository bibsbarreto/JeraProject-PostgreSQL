//server.js
const express = require('express');
const bodyParser = require('body-parser');
var pg = require('pg');
const app = express();
var http = require('http');
var url = require('url');

//extrair dados do 'form'
app.use(bodyParser.urlencoded({extended: true}))

var conString = "postgres://postgres:1234@localhost:5432/booksdb";

var pgClient = new pg.Client(conString);
pgClient.connect((err, database) => {
	if(err) return console.log(err)

	app.listen(3000, function(){
	console.log('Servidor rodando na porta 3000...');
	})
});

app.get('/', (req, res) => {
	res.sendFile('/Users/bbarr/Documents/Nodejs/JeraProject/Desafio Jera/index.html')
})

app.get('/registry', (req, res) => {
	res.sendFile('/Users/bbarr/Documents/Nodejs/JeraProject/Desafio Jera/registry.html')
})

app.post('/registry', (req, res) => {
	console.log('Entrou no método Post!')
	
	//colocar dados no banco
	pgClient.query("INSERT INTO book(name, author, pages_number) values($1, $2, $3)", [req.body.name, req.body.author, req.body.pages_number], (err, result) => {
		if(err) return console.log(err)
		console.log('saved to database')
	res.redirect('/list')
	})	
})

//rendering
app.set('view engine', 'ejs')

app.get('/list', (req, res) => {
	   var books = [];

	   // Get a Postgres client from the connection pool
       pg.connect(conString, function(err, client, done) {
       // Handle connection errors
       if(err) {
       	  done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        } 
        
        // SQL Query > Select Data
        var query = pgClient.query('SELECT * FROM book ORDER BY id ASC;');

        // Stream results back one row at a time
        query.on('row', function(row) {
            books.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            res.render('list.ejs', {books: books});
        });

	});    
})

var idUpdate = 0;

app.get('/update', (req, res) => {
	//res.sendFile('/Users/bbarr/Documents/Nodejs/JeraProject/Desafio Jera/views/update.html')
	console.log('Entrou no método GET');
	//var result = url.parse(req.url, true);
	console.log(req.query.id);
	var books = [];
	idUpdate = req.query.id;
	// Get a Postgres client from the connection pool
       pg.connect(conString, function(err, client, done) {
       // Handle connection errors
       if(err) {
       	  done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        } 
        
        // SQL Query > Select Data
        var query = pgClient.query('SELECT * FROM book WHERE id=($1);', [idUpdate]);

        // Stream results back one row at a time
        query.on('row', function(row) {
            books.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done(); 
            res.render('update.ejs', {books: books});
        });
	});
})

app.post('/update', (req, res) => {
	console.log('Entrou no método Post!')

	   //Get a Postgres client from the connection pool
       pg.connect(conString, function(err, client, done) {
	       // Handle connection errors
	       if(err) {
	       	  done();
	          console.log(err);
	          return res.status(500).json({ success: false, data: err});
	        }
	        
	        //colocar dados no banco
			pgClient.query("UPDATE book SET name=($1), author=($2), pages_number=($3) WHERE id=($4)", [req.body.name, req.body.author, req.body.pages_number, idUpdate], (err, result) => {
				if(err) return console.log(err)
				console.log('updated to database')
				res.redirect('/list');
			})	

		})
})

var idDelete = 0;

app.get('/delete', (req, res) => {
	//res.sendFile('/Users/bbarr/Documents/Nodejs/JeraProject/Desafio Jera/views/update.html')
	console.log('Entrou no método GET');
	//var result = url.parse(req.url, true);
	console.log(req.query.id);
	var books = [];
	idDelete = req.query.id;
	// Get a Postgres client from the connection pool
       pg.connect(conString, function(err, client, done) {
       // Handle connection errors
       if(err) {
       	  done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        } 
        
        // SQL Query > Select Data
        var query = pgClient.query('DELETE FROM book WHERE id=($1);', [idDelete]);
        res.redirect('/list')
	});
});