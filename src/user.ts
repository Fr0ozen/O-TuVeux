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

module.exports = {
    getAllUser: getAllUser
};