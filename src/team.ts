const { poolPromise } = require('./database.ts');
const player = require('./player.ts');

async function createTeam(req, res) {
    const name = req.body.team.name;
    const origin = req.body.team.origin;
    const players = req.body.team.playerList;
    
    if (name && origin) {
        const pool = await poolPromise;
        await pool.request().query('INSERT INTO [TEAM](name, origin) VALUES (\'' + name + '\', \'' + origin + '\');').catch(err => {
            return res.status(400).send('Le nom de l\'équipe est déjà utilisé');
        }); 

        const teamIdResult = await getIdTeamByName(name).catch(err => {
            return res.status(400).send('Une erreur est survenue');
        });
        
        const teamId = teamIdResult[0].id;
        
        for (const teamPlayer of players) {
            const playerIdResult = await player.getIdPlayerByPseudo(teamPlayer.pseudo).catch(err => {
                return res.status(400).send('Une erreur est survenue');
            });
            
            const playerId = playerIdResult[0].id;
            
            if (teamId && playerId) {
                await pool.request().query('INSERT INTO [TEAMPLAYER](idteam, idplayer, joiningdate, iscapitain) VALUES (\'' + teamId + '\', \'' + playerId + '\', \'' + teamPlayer.joiningDate + '\', \'' + teamPlayer.isCapitain + '\');').catch(err => {
                    return res.status(400).send('Une erreur c\'est produit lors de l\'insertion d\'un joueur dans une équipe');
                });
            }
        }
        
        return res.status(200).send({
            message: 'L\'équipe à bien été créé'
        });
    } else {
         return res.status(400).send('Paramètre manquant');
    }
}

async function getIdTeamByName(name) {
    if (name) {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT id FROM [TEAM] WHERE name = \'' + name + '\';').catch(err => {
            return err;
        });
        
        return result.recordset;
    } else {
        return 'pas de nom fourni';
    }
}

module.exports = {
    createTeam: createTeam
};