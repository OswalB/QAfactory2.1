const coreCtrl = {};
//const  = require('../services/serv.db');

const config = require('../config/settings'); // Importa el archivo config.js

const maxProductos = config.maxProductos;
const maxUsuarios = config.maxUsuarios;

console.log('Cantidad máxima de productos:', maxProductos);
console.log('Cantidad máxima de usuarios:', maxUsuarios);

coreCtrl.test = async(req, res, next) =>{
    try {    
        
        res.status(200).json({ message: 'Operación exitosa core!!',
        'Cantidad máxima de productos:': maxProductos,
        'Cantidad máxima de usuarios:': maxUsuarios

     });
    } catch (error) {
        next(error);
    }
}

module.exports = coreCtrl;