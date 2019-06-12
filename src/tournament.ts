const { poolPromise } = require('./database.ts');

async function createTournament(req, res) {
    const arenaId = req.body.tournament.arena.id;
    const name = req.body.tournament.name;
    let cashprize = req.body.tournament.cashprize;
    let sponsor = req.body.tournament.sponsor;
    
    if (arenaId && name) {
        let requestValue;
        
        if (cashprize === '' && sponsor === '') {
            requestValue = '\'' + name + '\', null, null, \'' + arenaId + '\'';
        } else if (sponsor === '') {
            requestValue = '\'' + name + '\', \'' + cashprize + '\', null, \'' + arenaId + '\'';
        } else if (cashprize === '') {
            requestValue = '\'' + name + '\', null, \'' + sponsor + '\', \'' + arenaId + '\'';
        } else {
            requestValue = '\'' + name + '\', \'' + cashprize + '\', \'' + sponsor + '\', \'' + arenaId + '\'';
        }
        
        const pool = await poolPromise;
        await pool.request().query('INSERT INTO [TOURNAMENT](name, cashprize, sponsor, idarena) VALUES (' + requestValue + ');').catch(err => {
            return res.status(400).send('Une erreur est survenue: ' + err);
        }); 
        
        return res.status(200).send({
            message: 'Le tournoi à bien été créé'
        });
    } else {
        return res.status(400).send('Paramètre manquant');
    }
}

module.exports = {
    createTournament: createTournament
};