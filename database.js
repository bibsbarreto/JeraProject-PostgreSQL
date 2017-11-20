//database.js

var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://postgres:1234@localhost:5432/booksdb';

var client = new pg.Client(connectionString);
client.connect();



//CREATE TABLE IF NOT EXISTS book (id int NOT NULL AUTO_INCREMENT, name varchar(100) NOT NULL, author varchar(100) NOT NULL, picture varchar(255), pages_number int NOT NULL, list BOOLEAN NOT NULL DEFAULT false, PRIMARY KEY(id))

var query = client.query('CREATE TABLE book(id SERIAL PRIMARY KEY, name VARCHAR(100) not null, author VARCHAR(100) not null, picture VARCHAR(255), pages_number VARCHAR(100) not null, list BOOLEAN NOT NULL DEFAULT false)');
query.on('end', function() { client.end(); });