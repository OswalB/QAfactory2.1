const errorHandler = async (err, req, res, next) => {
    console.error(err.stack);
    const Errorl = require('../models/Errorl');
    const controllerName = req.route ? req.route.path : 'Desconocido';
    const userName = req.user ? req.user.name : 'Desconocido';
    const requestBody = JSON.stringify(req.body);

    // Crear un objeto de registro con los datos recolectados
    let fechaHora = new Date();
    fechaHora = fechaHora.toLocaleDateString('es-us',{weekday: 'short',day:'2-digit',month:'short',hour:'2-digit', minute:'2-digit'});
    
    const logData = {

        errorTxt: err,
        user: userName,
        modulo: controllerName,
        body: requestBody,
        fechaHora : fechaHora
    };

    const newErrorlog = new Errorl(logData);
    await newErrorlog.save();
    
    console.log('Error Log:', logData);

   
    res.status(500).json({ error: 'Ocurrió un error en el servidor' });
};


module.exports = errorHandler;