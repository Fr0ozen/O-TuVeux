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

    let idmatch = round.idmatch;
    let idteam = round.idteam;
    let roundnumber = round.roundnumber;
    let startingtime = round.startingtime;
    let endingtime = round.endingtime;
    let isct = round.isct;
    let iswinner = round.iswinner;

    let idmatch2 = round2.idmatch;
    let idteam2 = round2.idteam;
    let roundnumber2 = round2.roundnumber;
    let startingtime2 = round2.startingtime;
    let endingtime2 = round2.endingtime;
    let isct2 = round2.isct;
    let iswinner2 = round2.iswinner;

    if(idmatch && idteam && roundnumber && typeof startingtime !== undefined && endingtime && typeof isct !== undefined && typeof iswinner !== undefined) {
        const pool = await poolPromise;
        let query = 'INSERT INTO [ROUND](idmatch, idteam, roundnumber, startingtime, endingtime, isct, iswinner) VALUES (\'' + idmatch + '\', \'' + idteam + '\', \'' + roundnumber + '\', \'' + startingtime + '\', \'' + endingtime + '\', \'' + isct + '\', \'' + iswinner + '\');';
        query = query + 'INSERT INTO [ROUND](idmatch, idteam, roundnumber, startingtime, endingtime, isct, iswinner) VALUES (\'' + idmatch2 + '\', \'' + idteam2 + '\', \'' + roundnumber2 + '\', \'' + startingtime2 + '\', \'' + endingtime2 + '\', \'' + isct2 + '\', \'' + iswinner2 + '\');';

        await pool.request().query(query).catch(err => {
            return res.status(400).send('Une erreur est survenue: ' + err);
        });
        
        pusher.trigger("events-channel", "new-like", {
            teamNumber: req.body.teamNumber,
            rounds: req.body.rounds,
            teamScore: req.body.teamScore,
            idwinningteam: req.body.idwinningteam
        });
        
        return res.status(200).send({
            message: 'Récupartion de l\'équipe gagnante',
            idwinningteam: req.body.idwinningteam
        });
    } else {
        return res.status(400).send('Paramètre manquant');
    }
}

async function getAllRoundsMatch(req, res){
    let idmatch = req.body.idmatch;
    const pool = await poolPromise;
    let query = 'SELECT [MATCH].id, [ROUND].idteam, ISNULL(SUM(IIF(iswinner = 1, 1, 0)), 0) as scoreTeam FROM [MATCH] LEFT JOIN [ROUND] ON [ROUND].idmatch = [MATCH].id WHERE [MATCH].id = \'' + idmatch + '\' GROUP BY [MATCH].id, [ROUND].idteam;'; 
    
    const result = await pool.request().query(query).catch(err => {
        return res.status(400).send('Une erreur est survenue: ' + err);
    });
        
    return res.status(200).send({
        message: '',
        teamScore: result.recordsets
    });
}

module.exports = {
    addRound: addRound,
    getAllRoundsMatch: getAllRoundsMatch
};