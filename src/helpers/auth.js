const helpers = {};

helpers.authorization  = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/signin');
    }

    const modelPermissions = {
        admin: ['Editable', 'Errorl', 'Order', 'User', 'Client', 'Product','Serial', 'Averia', 
            'Planilla', 'Reason', 'Store', 'Template'],
        dispatcher: ['Order', 'Client', 'Product','Serial', 'Averia', 'Planilla', 'Reason', 'Store', 'Template'],
        operator: ['', '', 'Client', 'Product','Serial', 'Planilla'],
        seller: ['Order', '', 'Client', 'Product','Serial', '', 'Reason'],
        
    };
    const modelName = req.body.modelo;
    const user = req.user;
    const models = [];
    if (user.administrador) {
        models.push(...modelPermissions.admin);
    }
    if (user.despachador) {
        models.push(...modelPermissions.dispatcher);
    }
    if (user.operario) {
        models.push(...modelPermissions.operator);
    }
    if (user.vendedor) {
        models.push(...modelPermissions.seller);
    }
    const uniqueModels = [...new Set(models)];
    if (uniqueModels.includes(modelName)) {
        return next();
    } else {
        console.log('n/a',modelName);
        return res.status(403).send({message:'Acceso  no autorizado :-('});
    }


    
}


helpers.isAuthenticated = (req, res, next) => {
    if(req.isAuthenticated()){
        
        return next();
    }
    
    res.redirect('/signin');
}

helpers.isAdmin = (req, res, next) => {
    if (req.isAuthenticated()) {
        const user = req.user;
        if(user.administrador){
            return next();
        }else {
            // Si el usuario no tiene la combinación de roles adecuada, mostrar un mensaje de error o redirigirlo a una página de acceso denegado
            return res.status(403).send({message:'Acceso  no autorizado :-('});
        }

    }

    
    //req.flash('error_msg','No es administrador');
    res.redirect('/signin');
}

helpers.isDispatcher = (req, res, next) => {
    if (req.isAuthenticated()) {
        const user = req.user;
        if(user.despachador){
            return next();
        }else {
            return res.status(403).send({message:'Acceso  no autorizado :-('});
        }
    }
    res.redirect('/signin');
}
module.exports = helpers;

