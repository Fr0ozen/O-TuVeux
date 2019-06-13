const { poolPromise } = require('./database.ts');
const propertiesReader = require('properties-reader');
const properties = propertiesReader('properties.ini');

async function getLiveMatches(req, res){
    const pool = await poolPromise;
    const query = 'SELECT [MATCH].id, [ROUND].idteam, ISNULL(SUM(IIF(iswinner = 1, 1, 0)), 0)  FROM [MATCH] LEFT JOIN [ROUND] ON [ROUND].idmatch = [MATCH].id WHERE [MATCH].isstarted = 1 AND [MATCH].isover = 0 GROUP BY [MATCH].id, [ROUND].idteam;';
    const result = await pool.request().query(query).catch(err => {
        return res.status(400).send('Une erreur est survenue: ' + err);
    });
    
    return res.status(200).send({
        matches: result.recordset
    });
}

module.exports = {
    getLiveMatches: getLiveMatches
};