const { poolPromise } = require('./database.ts');

async function createTournament(req, res) {
    const arenaId = req.body.tournament.arena.id;
    const name = req.body.tournament.name;
    let cashprize = req.body.tournament.cashprize;
    let sponsor = req.body.tournament.sponsor;
    const matchList = req.body.matchList;
    
    if (arenaId && name) {
        let requestValue;
        
        if (cashprize === '' && sponsor === '') {
            requestValue = '\'' + name + '\', null, null, \'' + arenaId + '\'';
        } else if (sponsor === '') {
            requestValue = '\'' + name + '\', \'' + cashprize + '\', null, \'' + arenaId + '\'';
        } else if (cashprize === '') {
            requestValue = '\'' + name + '\', null, \'' + sponsor + '\', \'' + arenaId + '\'';
        } else {
            requestValue = '\'' + name + '\', \'' + cashprize + '\', \'' + sponsor + '\', \'' + arenaId + '\'';
        }
        
        const pool = await poolPromise;
        await pool.request().query('INSERT INTO [TOURNAMENT] (name, cashprize, sponsor, idarena) VALUES (' + requestValue + ');').catch(err => {
            return res.status(400).send('Une erreur est survenue: ' + err);
        });
        
        const resultTournament = await pool.request().query('SELECT id FROM [TOURNAMENT] WHERE name = \'' + req.body.tournament.name + '\';').catch(err => {
            return err;
        });
        
        for (const match of matchList) {
            await pool.request().query('INSERT INTO [MATCH] (startinghour, map, isstarted, isover, ranktournament, idtournament) VALUES (\'' + match.match.startinghour + '\', \'' + match.match.map + '\', \'' + match.match.isstarted + '\', \'' + match.match.isover + '\', \'' + match.match.ranktournament + '\', \'' + resultTournament.recordset[0].id + '\')').catch(err => {
                return res.status(400).send('Une erreur est survenue: ' + err);
            });
            
            const resultMatch = await pool.request().query('SELECT id FROM [MATCH] WHERE ranktournament = \'' + match.match.ranktournament + '\' AND idtournament = \'' + resultTournament.recordset[0].id + '\';').catch(err => {
                return err;
            });
            
            await pool.request().query('INSERT INTO [ROUND] (idmatch, idteam, roundnumber, startingtime, endingtime, isct, iswinner) VALUES (\'' + resultMatch.recordset[0].id + '\', \'' + match.team1.id + '\', 0, null, null, null, null)').catch(err => {
                return res.status(400).send('Une erreur est survenue: ' + err);
            });
            
            await pool.request().query('INSERT INTO [ROUND] (idmatch, idteam, roundnumber, startingtime, endingtime, isct, iswinner) VALUES (\'' + resultMatch.recordset[0].id + '\', \'' + match.team2.id + '\', 0, null, null, null, null)').catch(err => {
                return res.status(400).send('Une erreur est survenue: ' + err);
            });
            
            await pool.request().query('INSERT INTO [MATCHREFEREE] (idmatch, idreferee) VALUES (\'' + resultMatch.recordset[0].id + '\', \'' + match.match.referee.id + '\')').catch(err => {
                return res.status(400).send('Une erreur est survenue: ' + err);
            });
        }
        
        return res.status(200).send({
            message: 'Le tournoi à bien été créé'
        });
    } else {
        return res.status(400).send('Paramètre manquant');
    }
}

async function getBracketByTournament(req, res) {
    const tournamentId = req.body.tournament.id;
    
    if (tournamentId) {
        const pool = await poolPromise;
        const resultTournament = await pool.request().query('SELECT t.name, m.ranktournament, SUM(CAST(r.iswinner AS INT)) score FROM [MATCH] m, [ROUND] r, [TEAM] t WHERE m.id = r.idmatch AND r.idteam = t.id AND m.idtournament = \'' + tournamentId + '\' GROUP BY t.name, m.ranktournament ORDER BY m.ranktournament, t.name;').catch(err => {
            return err;
        });
        
        const value = resultTournament.recordset;
        let teams = [];
        let inresults = [];
        let results = [];
        
        teams.push([value[0].name, value[1].name]);
        teams.push([value[2].name, value[3].name]);
        teams.push([value[4].name, value[5].name]);
        teams.push([value[6].name, value[7].name]);
        teams.push([value[8].name, value[9].name]);
        teams.push([value[10].name, value[11].name]);
        teams.push([value[12].name, value[13].name]);
        teams.push([value[14].name, value[15].name]);
        
        inresults.push(
            [value[0].score, value[1].score], 
            [value[2].score, value[3].score], 
            [value[4].score, value[5].score], 
            [value[6].score, value[7].score], 
            [value[8].score, value[9].score], 
            [value[10].score, value[11].score], 
            [value[12].score, value[13].score], 
            [value[14].score, value[15].score]
        );
        results.push(inresults);
        
        inresults = [];
        
        if (value.length === 20) {
            inresults.push(
                [value[16].score, value[17].score],
                [value[18].score, value[19].score],
                [value[20].score, value[21].score],
                [value[22].score, value[23].score]
            );   
        } else {
            inresults.push([null, null], [null, null], [null, null], [null, null]);
        }
        
        results.push(inresults);
        
        inresults = [];
        
        if (value.length === 22) {
            inresults.push(
                [value[24].score, value[25].score],
                [value[26].score, value[27].score]
            );
        } else {
            inresults.push([null, null], [null, null]);
        }
        
        results.push(inresults);
        
        inresults = [];
        
        if (value.length === 23) {
            inresults.push([value[28].score, value[29].score]);
        } else {
            inresults.push([null, null]);
        }
        
        results.push(inresults);
        
        const bracket = {
            teams : teams,
            results : [results]
        }
        
        return res.status(200).send({
            message: '',
            bracket: bracket
        });
    } else {
        return res.status(400).send('Paramètre manquant');
    }
}

async function getAllTournament(req, res) {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM [TOURNAMENT];').catch(err => {
        return res.status(400).send('Une erreur est survenue: ' + err);
    });
    
    return res.status(200).send({
        tournaments: result.recordset
    });
}

module.exports = {
    createTournament: createTournament,
    getBracketByTournament: getBracketByTournament,
    getAllTournament: getAllTournament
};