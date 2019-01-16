const express = require('express');
const bodyParser = require('body-parser')
const all_routes = require('express-list-endpoints');
const token = require('./src/token.ts');

const port = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.post('/createToken', token.createToken);
app.get('/users', token.checkToken, users);

const server = app.listen(port, function () {
    console.log('Express server listening on port ' + port);
    console.log(all_routes(app));
});

function users(req, res) {
    return res.json([{
        id: 1,
        username: 'toto',
        password: 'toto',
        firstname: 'toto',
        lastname: 'toto',
        token: 'toto'
    }]);
}
