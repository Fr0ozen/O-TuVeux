const fs = require('fs-extra');
const jwt = require('jsonwebtoken');
const database = require('./database.ts');

function createToken(req, res) {
    let privateKey = fs.readFileSync('./keys/private.key', 'utf8');
    let username = req.body.username;
    let password = req.body.password;

    if (username && password) {
        database.executeMainQuery('SELECT id, username, lname, fname, nationality, age, isorganizer FROM [USER] WHERE username = \'' + username + '\' AND password = \'' + password + '\';').then(result => {
            if (result.recordset.length === 1) {
                let token = jwt.sign({username: username}, privateKey, {algorithm: 'RS256', expiresIn: '2h'});
                return res.status(200).send({
                    message: 'Succès de l\'authentification!',
                    user: result.recordset[0],
                    token: token
                });
            } else {
                return res.status(403).send('Le nom d\'utilisateur ou le mot de passe est incorrect');
            }
        }).catch(err => {
            return res.status(400).send('Une erreur c\'est produite: ' + err);
        });
    } else {
         return res.status(400).send('L\'authentification a échoué');
    }
}

function checkUserToken(req, res, next) {
    let publicKey = fs.readFileSync('./keys/public.key', 'utf8');
    let token = req.headers['x-access-token'] || req.headers['authorization'];

    if (token) {
        jwt.verify(token, publicKey, (err, decoded) => {
            if (err) {
                return res.status(401).send('Le token n\'est plus valide');
            } else {
                next();
            }
        });
    } else {
        return res.status(401).send('Aucun token n\'a été trouvé');
    }
}

function checkOrganizerToken(req, res, next) {
    let publicKey = fs.readFileSync('./keys/public.key', 'utf8');
    let token = req.headers['x-access-token'] || req.headers['authorization'];

    if (token) {
        jwt.verify(token, publicKey, (err, decoded) => {
            if (err) {
                return res.status(401).send('Le token n\'est plus valide');
            } else {
                database.executeMainQuery('SELECT isorganizer FROM [USER] WHERE id = ' + req.body.user.id + ';').then(result => {
                    if (result.recordset[0].isorganizer === true) {
                        next();
                    } else {
                        return res.status(401).send('L\'utilisateur courant n\'est pas organisateur');
                    }
                }).catch(err => {
                    return res.status(400).send('Une erreur c\'est produite: ' + err);
                });
            }
        });
    } else {
        return res.status(401).send('Aucun token n\'a été trouvé');
    }
}

module.exports = {
    createToken: createToken,
    checkUserToken: checkUserToken,
    checkOrganizerToken: checkOrganizerToken
};