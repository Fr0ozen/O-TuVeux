const sql = require('mssql');
const propertiesReader = require('properties-reader');
const properties = propertiesReader('properties.ini');

const mainConfig = {
    user: properties.get('maindatabase.username'),
    password: properties.get('maindatabase.password'),
    server: properties.get('maindatabase.server'),
    port: properties.get('maindatabase.port'),
    database: properties.get('maindatabase.database')
}

function executeMainQuery(request) {    
    return new Promise(function (resolve, reject) {
        sql.connect(mainConfig).then(conn => {
            conn.query(request).then(result => {
                resolve(result);
                conn.close();
                sql.close();
            }).catch(err => {
                reject(err);
                conn.close();
                sql.close();
            });
        });
    });
}                      

function executeContainerQuery(config, request) {    
    sql.connect(config).then(pool => {
        return pool.request().query(request);
    }).then(result => {
        return result;
    }).catch(err => {
        console.log(err);
    });
}

module.exports = {
    executeMainQuery: executeMainQuery,
    executeContainerQuery: executeContainerQuery
};