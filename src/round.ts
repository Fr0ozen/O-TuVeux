const { poolPromise } = require('./database.ts');

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
        let query = 'INSERT INTO [ROUND](idmatch,idteam,roundnumber,startingtime,endingtime,isct,iswinner) VALUES (\'' +idmatch + '\', \'' +idteam + '\', \'' +roundnumber + '\', \'' +startingtime + '\', \'' +endingtime + '\', \'' +isct + '\', \'' +iswinner + '\');';
        query = query + 'INSERT INTO [ROUND](idmatch,idteam,roundnumber,startingtime,endingtime,isct,iswinner) VALUES (\'' +idmatch2 + '\', \'' +idteam2 + '\', \'' +roundnumber2 + '\', \'' +startingtime2 + '\', \'' +endingtime2 + '\', \'' +isct2 + '\', \'' +iswinner2 + '\');';
        console.log(query);
        await pool.request().query(query)
            .catch(err => {
            return res.status(400).send('Une erreur est survenue: ' + err);
        });
        
        return res.status(200).send({
            message: '',
            idwinningteam: req.body.idwinningteam
        });
    } else {
            return res.status(400).send('Paramètre manquant');
    }
}

async function getCurrentRounds(req, res){
    let idmatch = req.body.idmatch;
    const pool = await poolPromise;
    let query = 'SELECT * FROM [ROUND] WHERE idmatch = \'' +idmatch+'\';'; 
    const result = await pool.request().query(query)
        .catch(err => {
            return res.status(400).send('Une erreur est survenue: ' + err);
    });
        
    return res.status(200).send({
        message: '',
        teamScore: result.recordsets
    });
}

module.exports = {
    addRound: addRound,
    getCurrentRounds: getCurrentRounds
};