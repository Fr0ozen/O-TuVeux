require("dotenv").config();

const cors = require("cors");
const Pusher = require("pusher");

const express = require('express');
const bodyParser = require('body-parser')
const all_routes = require('express-list-endpoints');
const token = require('./src/token.ts');
const player = require('./src/player.ts');
const team = require('./src/team.ts');
const round = require('./src/round.ts');

const port = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors());
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
app.post('/createTeam', token.checkOrganizerToken, team.createTeam);
app.post("/update", function(req, res) {
    round.addRound(req, res);
    pusher.trigger("events-channel", "new-like", {
        teamNumber: `${req.body.teamNumber}`,
        rounds: `${req.body.rounds}`,
        teamScore: `${req.body.teamScore}`,
        idwinningteam: `${req.body.idwinningteam}`
        // likes : `${req.body.likes}`
    });
});
app.post('/getAllRoundsMatch', function(req, res){
    round.getCurrentRounds(req, res);
});

const server = app.listen(port, function () {
    console.log('Express server listening on port ' + port);
    console.log(all_routes(app));
});

const pusher = new Pusher({
    appId: `${process.env.PUSHER_APP_ID}`,
    key: `${process.env.PUSHER_API_KEY}`,
    secret: `${process.env.PUSHER_API_SECRET}`,
    cluster: `${process.env.PUSHER_APP_CLUSTER}`,
    encrypted: true
});