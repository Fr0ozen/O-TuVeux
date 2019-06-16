const { poolPromise } = require('./database.ts');
const propertiesReader = require('properties-reader');
const properties = propertiesReader('properties.ini');
const Pusher = require("pusher");

const pusher = new Pusher({
    appId: properties.get('pusher.id'),
    key: properties.get('pusher.key'),
    secret: properties.get('pusher.secret'),
    cluster: properties.get('pusher.cluster'),
    useTLS: true
});

async function addRound(req, res) {
    const round = req.body.rounds[0];
    const round2 = req.body.rounds[1];
    const teamScore = req.body.teamScore;

    let idmatch = req.body.idmatch;
    let idteam = round.team.id;
    let roundnumber = round.roundnumber;
    let startingtime = round.startingtime;
    let endingtime = round.endingtime;
    let isct = round.isct;
    let iswinner = round.iswinner;

    let idteam2 = round2.team.id;
    let roundnumber2 = round2.roundnumber;
    let startingtime2 = round2.startingtime;
    let endingtime2 = round2.endingtime;
    let isct2 = round2.isct;
    let iswinner2 = round2.iswinner;

    if (roundnumber < 32) {
        if(idmatch && idteam && roundnumber && typeof startingtime !== undefined && endingtime && typeof isct !== undefined && typeof iswinner !== undefined) {
        const pool = await poolPromise;
            let query = 'INSERT INTO [ROUND](idmatch, idteam, roundnumber, startingtime, endingtime, isct, iswinner) VALUES (\'' + idmatch + '\', \'' + idteam + '\', \'' + roundnumber + '\', \'' + startingtime + '\', \'' + endingtime + '\', \'' + isct + '\', \'' + iswinner + '\');';
            query = query + 'INSERT INTO [ROUND](idmatch, idteam, roundnumber, startingtime, endingtime, isct, iswinner) VALUES (\'' + idmatch + '\', \'' + idteam2 + '\', \'' + roundnumber2 + '\', \'' + startingtime2 + '\', \'' + endingtime2 + '\', \'' + isct2 + '\', \'' + iswinner2 + '\');';

            await pool.request().query(query).catch(err => {
                return res.status(400).send('Une erreur est survenue: ' + err);
            });

            pusher.trigger('events-channel', 'updating-score', {
                teamNumber: req.body.teamNumber,
                rounds: req.body.rounds,
                teamScore: req.body.teamScore,
                idwinningteam: req.body.idwinningteam
            });
            
            if (roundnumber === 31 || teamScore === 16) {
                await pool.request().query('UPDATE [MATCH] SET isover = 1 WHERE id = \'' + idmatch + '\';').catch(err => {
                    return res.status(400).send('Une erreur est survenue: ' + err);
                });
            }

            return res.status(200).send({
                message: 'Le score à bien été mis à jour'
            });
        } else {
            return res.status(400).send('Paramètre manquant');
        }   
    } else {
        return res.status(400).send('Le match est terminé !');
    }
}

async function getMatchScore(req, res) {
    let idmatch = req.body.idmatch;
    const pool = await poolPromise;
    let query = 'SELECT t.id, t.name, SUM(CAST(r.iswinner AS INT)) score FROM [MATCH] m, [ROUND] r, [TEAM] t WHERE m.id = r.idmatch AND r.idteam = t.id AND m.id = \'' + idmatch + '\' GROUP BY t.id, t.name ORDER BY t.id, t.name;'; 
    
    const result = await pool.request().query(query).catch(err => {
        return res.status(400).send('Une erreur est survenue: ' + err);
    });
        
    return res.status(200).send(result.recordsets);
}

module.exports = {
    addRound: addRound,
    getMatchScore: getMatchScore
};