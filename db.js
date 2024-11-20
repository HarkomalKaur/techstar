const mysql = require('mysql2');

/*
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'P@ssw0rd123!', // A senha que você definiu
    database: 'company_performance9'
});
 */

const connection = mysql.createConnection({
    host: '34.136.110.251',
    user: 'rootagnelo',
    password: 'company_performance9', // A senha que você definiu
    database: 'company_performance'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the MySQL database:', err);
        return;
    }
    console.log('Connected to the MySQL database');
});

module.exports = connection;
