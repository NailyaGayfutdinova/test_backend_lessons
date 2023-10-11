const pgPromise = require('pg-promise');
require('dotenv').config();

const pgp = pgPromise();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
};

const db = pgp(config);

module.exports = db;
