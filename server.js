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

app.get('/reminder_registry', (req, res) => {
	var books_names = [];
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
				for(var i = 0; i < books.length; i++){
					books_names.push({id: books[i].id, name: books[i].name});
				}
				res.send({books_names: books_names});
				done();
			});
		})
		res.sendFile('/Users/bbarr/Documents/Nodejs/JeraProject/Desafio Jera/reminder_registry.html')
})

//Cadastrar livro
app.post('/registry', (req, res) => {
	console.log('Entrou no método Post!')
	
	//colocar dados no banco
	pgClient.query("INSERT INTO book(name, author, pages_number) values($1, $2, $3)", [req.body.name, req.body.author, req.body.pages_number], (err, result) => {
		if(err) return console.log(err);
		console.log('saved to database');
	res.redirect('/list');
	})	
})

//Cadastrar lembrete
app.post('/reminder_registry', (req, res) => {
	console.log('Entrou no método Post!')
	
	//colocar dados no banco
	pgClient.query("INSERT INTO reminder(date, book_id) values($1, $2, $3)", [req.body.date, req.body.book_id], (err, result) => {
		if(err) return console.log(err);
		console.log('saved to database');
	res.redirect('/reading_list');
	})	
})

//rendering
app.set('view engine', 'ejs');


//Lista de livros
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

//Lista de lembretes
app.get('/reading_list', (req, res) => {
	var books = [];
	var reminders = [];

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
		query = pgClient.query('SELECT * FROM reminder ORDER BY id ASC;');
		query.on('row', function(row) {
			reminders.push(row);
		});
		res.render('reading_list.ejs', {books: books, reminders: reminders});
	 });

 });    
})

var id = 0;
//Pegar dados para atualizar livro
app.get('/update', (req, res) => {
	console.log('Entrou no método GET');
	console.log(req.query.id);
	var books = [];
	id = req.query.id;
	// Get a Postgres client from the connection pool
       pg.connect(conString, function(err, client, done) {
       // Handle connection errors
       if(err) {
       	  done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        } 
        
        // SQL Query > Select Data
        var query = pgClient.query('SELECT * FROM book WHERE id=($1);', [id]);

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

//Atualizar livro
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
			pgClient.query("UPDATE book SET name=($1), author=($2), pages_number=($3) WHERE id=($4)", [req.body.name, req.body.author, req.body.pages_number, id], (err, result) => {
				if(err) return console.log(err)
				console.log('updated to database')
				res.redirect('/list');
			})	

		})
})

id = 0;

//Deletar livro
app.get('/delete', (req, res) => {
	console.log('Entrou no método GET');
	console.log(req.query.id);
	var books = [];
	id = req.query.id;
	// Get a Postgres client from the connection pool
       pg.connect(conString, function(err, client, done) {
       // Handle connection errors
       if(err) {
       	  done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        } 
        
        // SQL Query > Select Data
        var query = pgClient.query('DELETE FROM book WHERE id=($1);', [id]);
        res.redirect('/list')
	});
})
