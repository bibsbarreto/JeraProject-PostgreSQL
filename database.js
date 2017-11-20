//database.js

var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://postgres:1234@localhost:5432/linksdb';

var client = new pg.Client(connectionString);
client.connect();


var query = client.query('CREATE TABLE IF NOT EXISTS study_link(id SERIAL PRIMARY KEY, title VARCHAR(100) not null, link VARCHAR(255) not null, category VARCHAR(100) not null)');
query.on('end', function() { client.end(); });