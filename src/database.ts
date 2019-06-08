const sql = require('mssql');
const propertiesReader = require('properties-reader');
const properties = propertiesReader('properties.ini');

const config = {
    user: properties.get('maindatabase.username'),
    password: properties.get('maindatabase.password'),
    server: properties.get('maindatabase.server'),
    port: properties.get('maindatabase.port'),
    database: properties.get('maindatabase.database')
}

const poolPromise = new sql.ConnectionPool(config).connect().then(pool => {
    return pool
}).catch(err => {
    return 'Database Connection Failed! Bad Config: ' + err;
});

module.exports = {
    poolPromise
};