const { poolPromise } = require('./database.ts');

async function getAllUser(req, res) {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT id, username, lname, fname, nationality, age, isorganizer FROM [USER];').catch(err => {
        return res.status(400).send('Une erreur est survenue: ' + err);
    });
    
    return res.status(200).send({
        users: result.recordset
    });
}

async function isReferee(req, res) {
    const userId = req.body.user.id;
    const matchId = req.body.idmatch;
    
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT COUNT(*) isReferee FROM [MATCHREFEREE] WHERE idmatch = \'' + matchId + '\' AND idreferee = \'' + userId + '\';').catch(err => {
        return res.status(400).send('Une erreur est survenue: ' + err);
    });
    
    return res.status(200).send(result.recordset);
}

module.exports = {
    getAllUser: getAllUser,
    isReferee: isReferee
};