const { poolPromise } = require('./database.ts');

async function getAllMatchStartedForGrid(req, res) {
    let arrayForGrid = [];
    
    const pool = await poolPromise;
    const result1 = await pool.request().query('SELECT m.id, tou.name, m.ranktournament, m.map FROM [TOURNAMENT] tou, [MATCH] m WHERE tou.id = m.idtournament AND m.isstarted = 1 AND m.isover = 0;').catch(err => {
        return res.status(400).send('Une erreur est survenue: ' + err);
    });
    
    for (const data of result1.recordset) {
        const result2 = await pool.request().query('SELECT m.id, t.name, SUM(CAST(r.iswinner AS INT)) score FROM [MATCH] m, [ROUND] r, [TEAM] t WHERE m.id = r.idmatch AND r.idteam = t.id AND m.id = \'' + data.id + '\' GROUP BY m.id, t.name, m.ranktournament ORDER BY t.name;').catch(err => {
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
        
        let score1 = 0;
        let score2 = 0;
        
        if (result2.recordset[0].score !== null) {
            score1 = result2.recordset[0].score;
        }
        
        if (result2.recordset[1].score !== null) {
            score2 = result2.recordset[1].score;
        }
        
        arrayForGrid.push({
            id: data.id,
            name: data.name,
            phase: ranktournament,
            map: data.map,
            team: result2.recordset[0].name + ' vs ' + result2.recordset[1].name,
            score: score1 + ' - ' + score2
        });
    }
    
    return res.status(200).send(arrayForGrid);
}

async function getMatchById(req, res) {
    const idmatch = req.body.idmatch;
    
    const pool = await poolPromise;
    const match = await pool.request().query('SELECT * FROM [MATCH] WHERE id = \'' + idmatch + '\';').catch(err => {
        return res.status(400).send('Une erreur est survenue: ' + err);
    });
    
    return res.status(200).send({'match': match.recordset});
}

async function getAllMatchRefereeForGrid(req, res) {
    const userId = req.body.user.id
    let arrayForGrid = [];
    
    const pool = await poolPromise;
    const result1 = await pool.request().query('SELECT m.id, tou.name, m.ranktournament, m.map FROM [TOURNAMENT] tou, [MATCH] m , [MATCHREFEREE] mr, [USER] u WHERE tou.id = m.idtournament AND m.id = mr.idmatch AND mr.idreferee = u.id AND m.isstarted = 0 AND m.isover = 0 AND u.id = \'' + userId + '\';').catch(err => {
        return res.status(400).send('Une erreur est survenue: ' + err);
    });
    
    for (const data of result1.recordset) {
        const result2 = await pool.request().query('SELECT m.id, t.name FROM [MATCH] m, [ROUND] r, [TEAM] t WHERE m.id = r.idmatch AND r.idteam = t.id AND m.id = \'' + data.id + '\' GROUP BY m.id, t.name, m.ranktournament ORDER BY t.name;').catch(err => {
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
            id: data.id,
            name: data.name,
            phase: ranktournament,
            map: data.map,
            team: result2.recordset[0].name + ' vs ' + result2.recordset[1].name
        });
    }
    
    return res.status(200).send(arrayForGrid);
}

async function startMatch(req, res) {
    const matchId = req.body.idmatch;
    
    const pool = await poolPromise;
    await pool.request().query('UPDATE [MATCH] SET isstarted = 1 WHERE id = \'' + matchId + '\';').catch(err => {
        return res.status(400).send('Une erreur est survenue: ' + err);
    });
    
    return res.status(200).send({'message': ''});
}

module.exports = {
    getAllMatchStartedForGrid: getAllMatchStartedForGrid,
    getMatchById: getMatchById,
    getAllMatchRefereeForGrid: getAllMatchRefereeForGrid,
    startMatch: startMatch
};