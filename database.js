//database.js

var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://postgres:1234@localhost:5432/booksdb';

var client = new pg.Client(connectionString);
client.connect();


var query = client.query('CREATE TABLE IF NOT EXISTS book(id SERIAL PRIMARY KEY, name VARCHAR(100) not null, author VARCHAR(100) not null, picture VARCHAR(255), pages_number VARCHAR(100) not null)');
var query = client.query('CREATE TABLE IF NOT EXISTS reminder(id SERIAL PRIMARY KEY, date TIMESTAMP WITHOUT TIME ZONE not null, book_id integer not null REFERENCES book (id))');
query.on('end', function() { client.end(); });