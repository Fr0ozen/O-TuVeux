require("dotenv").config();

const cors = require("cors");
const express = require('express');
const bodyParser = require('body-parser')
const all_routes = require('express-list-endpoints');
const token = require('./src/token.ts');
const player = require('./src/player.ts');
const team = require('./src/team.ts');
const arena = require('./src/arena.ts');
const tournament = require('./src/tournament.ts');
const round = require('./src/round.ts');
const user = require('./src/user.ts');
const match = require('./src/match.ts');

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

//All - POST
app.post('/createToken', token.createToken);
app.post('/getMatchScore', round.getMatchScore);
app.post('/getBracketByTournamentId', tournament.getBracketByTournamentId);
app.post('/getMatchById', match.getMatchById);
app.post('/isReferee', user.isReferee);

//Organizer - POST
app.post('/createPlayer', token.checkOrganizerToken, player.createPlayer);
app.post('/getAllPlayer', token.checkOrganizerToken, player.getAllPlayer);
app.post('/createTeam', token.checkOrganizerToken, team.createTeam);
app.post('/getAllTeam', token.checkOrganizerToken, team.getAllTeam);
app.post('/createArena', token.checkOrganizerToken, arena.createArena);
app.post('/getAllArena', token.checkOrganizerToken, arena.getAllArena);
app.post('/createTournament', token.checkOrganizerToken, tournament.createTournament);
app.post('/getAllUser', token.checkOrganizerToken, user.getAllUser);

//Referee - POST
app.post('/addRound', token.checkRefereeOrOrganizerToken, round.addRound);
app.post('/startMatch', token.checkRefereeOrOrganizerToken, match.startMatch);

//User - POST
app.post('/getAllMatchRefereeForGrid', token.checkUserToken, match.getAllMatchRefereeForGrid);

//All - GET
app.get('/getAllTournamentForGrid', tournament.getAllTournamentForGrid);
app.get('/getAllMatchStartedForGrid', match.getAllMatchStartedForGrid);

const server = app.listen(port, function () {
    console.log('Express server listening on port ' + port);
    console.log(all_routes(app));
});