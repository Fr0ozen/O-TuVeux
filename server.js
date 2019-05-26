const express = require('express');
const bodyParser = require('body-parser')
const all_routes = require('express-list-endpoints');
const token = require('./src/token.ts');
const player = require('./src/player.ts');

const port = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, x-access-token');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.post('/createToken', token.createToken);
app.post('/createPlayer', token.checkOrganizerToken, player.createPlayer);
app.post('/getAllPlayer', token.checkOrganizerToken, player.getAllPlayer);

const server = app.listen(port, function () {
    console.log('Express server listening on port ' + port);
    console.log(all_routes(app));
});