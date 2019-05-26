const database = require('./database.ts');

function createPlayer(req, res) {
    let fname = req.body.data.fname;
    let lname = req.body.data.lname;
    let pseudo = req.body.data.pseudo;
    let level = req.body.data.level;
    let origin = req.body.data.origin;
    let sex = req.body.data.sex;
    
    if (fname && lname && pseudo && typeof level !== undefined && origin && typeof sex !== undefined) {
        database.executeMainQuery('INSERT INTO PLAYER(fname, lname, pseudo, level, origin, sex) VALUES (\'' + fname + '\', \'' + lname + '\', \'' + pseudo + '\', ' + level + ', \'' + origin + '\', ' + sex + ');').then(result => {
            if (parseInt(JSON.parse(JSON.stringify(result)).rowsAffected, 10) === 1) {
                return res.status(200).send({
                    message: 'L\'utilisateur a bien été créé'
                });
            } else {
                return res.status(400).send('Une erreur est survenue');
            }
        }).catch(err => {
            return res.status(400).send('Ce pseudonyme est déjà utilisé par quelqu\'un');
        });
    } else {
         return res.status(400).send('Paramètre manquant');
    }
}

function getAllPlayer(req, res) {
    database.executeMainQuery('SELECT * FROM PLAYER;').then(result => {
        if (result.recordset.length > 1) {
            return res.status(200).send({
                players: result.recordset
            });
        } else {
            return res.status(400).send('Une erreur est survenue');
        }
    }).catch(err => {
        return res.status(400).send('Une erreur est survenue: ' + err);
    });
}

module.exports = {
    createPlayer: createPlayer,
    getAllPlayer: getAllPlayer
};