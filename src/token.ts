const fs = require('fs-extra');
const jwt = require('jsonwebtoken');

function createToken(req, res) {
    let privateKey = fs.readFileSync('./private.key', 'utf8');
    let username = req.body.username;
    let password = req.body.password;
    // For the given username fetch user from DB
    let mockedUsername = 'admin';
    let mockedPassword = 'password';

    if (username && password) {
        if (username === mockedUsername && password === mockedPassword) {
            let token = jwt.sign({username: username}, privateKey, {algorithm: 'RS256', expiresIn: '2h'});
            return res.status(200).send({
                message: 'Authentication successful!',
                token: token
            });
        } else {
            return res.status(403).send('Incorrect username or password');
        }
    } else {
         return res.status(400).send('Authentication failed! Please check the request');
    }
}

function checkToken(req, res, next) {
    let publicKey = fs.readFileSync('./public.key', 'utf8');
    let token = req.headers['x-access-token'] || req.headers['authorization'];

    if (token) {
        jwt.verify(token, publicKey, (err, decoded) => {
            if (err) {
                return res.status(401).send('Token is not valid');
            } else {
                next();
            }
        });
    } else {
        return res.status(401).send('Auth token is not supplied');
    }
}

module.exports = {
    createToken: createToken,
    checkToken: checkToken
}