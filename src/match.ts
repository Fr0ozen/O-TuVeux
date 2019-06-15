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

async function getAllMatchStartedForGrid(req, res) {
    let arrayForGrid = [];
    
    const pool = await poolPromise;
    const result1 = await pool.request().query('SELECT m.id, tou.name, m.ranktournament, m.map FROM [TOURNAMENT] tou, [MATCH] m WHERE tou.id = m.idtournament AND m.isstarted = 1;').catch(err => {
        return res.status(400).send('Une erreur est survenue: ' + err);
    });
    
    for (const data of result1.recordset) {
        const result2 = await pool.request().query('SELECT t.name, SUM(CAST(r.iswinner AS INT)) score FROM [MATCH] m, [ROUND] r, [TEAM] t WHERE m.id = r.idmatch AND r.idteam = t.id AND m.id = \'' + data.id + '\' GROUP BY t.name, m.ranktournament ORDER BY t.name;').catch(err => {
            return res.status(400).send('Une erreur est survenue: ' + err);
        });
        
        let ranktournament = '';
        
        if (data.ranktournament > 8) {
            ranktournament = 'Huitième de finale';
        } else if (data.ranktournament < 8 && data.ranktournament > 4) {
            ranktournament = 'Quart de finale';   
        } else if (data.ranktournament < 4 && data.ranktournament > 2) {
            ranktournament = 'Demi finale';   
        } else if (data.ranktournament < 2 && data.ranktournament > 1) {
            ranktournament = 'Finale';   
        }
        
        arrayForGrid.push({
            name: data.name,
            phase: ranktournament,
            map: data.map,
            team: result2.recordset[0].name + ' vs ' + result2.recordset[1].name,
            score: result2.recordset[0].score + ' - ' + result2.recordset[1].score
        });
    }
    
    return res.status(200).send(arrayForGrid);
}

module.exports = {
    getLiveMatches: getLiveMatches,
    getAllMatchStartedForGrid: getAllMatchStartedForGrid
};