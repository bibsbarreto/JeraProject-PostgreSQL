//server.js
const express = require('express');
const bodyParser = require('body-parser');
var pg = require('pg');
const app = express();
var http = require('http');
var url = require('url');

//extrair dados do 'form'
app.use(bodyParser.urlencoded({extended: true}))

var conString = "postgres://postgres:1234@localhost:5432/linksdb";

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

//Cadastrar livro
app.post('/registry', (req, res) => {
	console.log('Entrou no método Post!')
	//colocar dados no banco
	pgClient.query("INSERT INTO study_link(title, link, category) values($1, $2, $3)", [req.body.title, req.body.link, req.body.category], (err, result) => {
		if(err) return console.log(err);
		console.log('saved to database');
	res.redirect('/list');
	})	
})

//rendering
app.set('view engine', 'ejs');

//Lista de livros
app.get('/list', (req, res) => {
	   var study_links = [];

	   // Get a Postgres client from the connection pool
       pg.connect(conString, function(err, client, done) {
       // Handle connection errors
       if(err) {
       	  done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        } 
        
        // SQL Query > Select Data
        var query = pgClient.query('SELECT * FROM study_link ORDER BY id ASC;');

        // Stream results back one row at a time
        query.on('row', function(row) {
            study_links.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
			done();
            res.render('list.ejs', {study_links: study_links});
        });

	});    
})

//Lista de busca
app.get('/search', (req, res) => {
	var study_links = [];
	res.render('search.ejs');
})

var id = 0;
//Pegar dados para atualizar livro
app.get('/update', (req, res) => {
	console.log('Entrou no método GET');
	var study_links = [];
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
        var query = pgClient.query('SELECT * FROM study_link WHERE id=($1);', [id]);

        // Stream results back one row at a time
        query.on('row', function(row) {
            study_links.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done(); 
            res.render('update.ejs', {study_links: study_links});
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
			pgClient.query("UPDATE study_link SET title=($1), link=($2), category=($3) WHERE id=($4)", [req.body.title, req.body.link, req.body.category, id], (err, result) => {
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
	var study_links = [];
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
        var query = pgClient.query('DELETE FROM study_link WHERE id=($1);', [id]);
        res.redirect('/list')
	});
})
