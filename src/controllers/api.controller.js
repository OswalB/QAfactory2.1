const apiCtrl = {};

//const Note = require('../models/Note');



apiCtrl.test = async (req, res) => {
    res.json({'respuesta':'test de API'})    
};

module.exports = apiCtrl  ;