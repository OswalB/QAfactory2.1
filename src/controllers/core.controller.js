const coreCtrl = {};
//const  = require('../services/serv.db');

coreCtrl.test = async(req, res, next) =>{
    try {    
        con 
        res.status(200).json({ message: 'Operación exitosa core!!' });
    } catch (error) {
        next(error);
    }
}

module.exports = coreCtrl;