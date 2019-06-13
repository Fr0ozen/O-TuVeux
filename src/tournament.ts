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

module.exports = {
    createTournament: createTournament
};