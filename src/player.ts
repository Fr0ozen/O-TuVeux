const { poolPromisePlayer } = require('./database.ts');

async function createPlayer(req, res) {
    let fname = req.body.player.fname;
    let lname = req.body.player.lname;
    let pseudo = req.body.player.pseudo;
    let level = req.body.player.level;
    let origin = req.body.player.origin;
    let sex = req.body.player.sex;
    
    if (fname && lname && pseudo && typeof level !== undefined && origin && typeof sex !== undefined) {
        const pool = await poolPromisePlayer;
        await pool.request().query('INSERT INTO [PLAYER](fname, lname, pseudo, level, origin, sex) VALUES (\'' + fname + '\', \'' + lname + '\', \'' + pseudo + '\', ' + level + ', \'' + origin + '\', ' + sex + ');').catch(err => {
            return res.status(400).send('Une erreur est survenue: ' + err);
        });
        
        return res.status(200).send({
            message: 'Le joueur a bien été créé'
        });
    } else {
         return res.status(400).send('Paramètre manquant');
    }
}

async function getAllPlayer(req, res) {
    const pool = await poolPromisePlayer;
    const result = await pool.request().query('SELECT * FROM [PLAYER];').catch(err => {
        return res.status(400).send('Une erreur est survenue: ' + err);
    });
    
    return res.status(200).send({
        players: result.recordset
    });
}

async function getIdPlayerByPseudo(pseudo) {
    if (pseudo) {
        const pool = await poolPromisePlayer;
        const result = await pool.request().query('SELECT id FROM [PLAYER] WHERE pseudo = \'' + pseudo + '\';').catch(err => {
            return err;
        });
        
        return result.recordset;
    } else {
        return 'pas de pseudo fourni';
    }
}

module.exports = {
    createPlayer: createPlayer,
    getAllPlayer: getAllPlayer,
    getIdPlayerByPseudo: getIdPlayerByPseudo
};