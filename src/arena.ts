const { poolPromise } = require('./database.ts');

async function createArena(req, res) {
    const town = req.body.arena.town;
    const arenaName = req.body.arena.name;
    
    if (town && arenaName) {
        const pool = await poolPromise;
        await pool.request().query('INSERT INTO [ARENA](town, name) VALUES (\'' + town + '\', \'' + arenaName + '\');').catch(err => {
            return res.status(400).send('Une erreur est survenue: ' + err);
        }); 
        
        return res.status(200).send({
            message: 'L\'arène à bien été créé'
        });
    } else {
        return res.status(400).send('Paramètre manquant');
    }
}

async function getAllArena(req, res) {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM [ARENA];').catch(err => {
        return res.status(400).send('Une erreur est survenue: ' + err);
    });
    
    return res.status(200).send({
        arenas: result.recordset
    });
}

module.exports = {
    createArena: createArena,
    getAllArena: getAllArena
};