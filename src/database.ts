const sql = require('mssql');
const propertiesReader = require('properties-reader');
const properties = propertiesReader('properties.ini');

const config = {
    user: properties.get('database.username'),
    password: properties.get('database.password'),
    server: properties.get('database.server'),
    port: properties.get('database.port'),
    database: properties.get('database.databasename')
}

const poolPromise = new sql.ConnectionPool(config).connect().then(pool => {
    return pool
}).catch(err => {
    return 'Database Connection Failed! Bad Config: ' + err;
});

module.exports = {
    poolPromise
};