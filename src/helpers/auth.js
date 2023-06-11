const helpers = {};

helpers.isAuthenticated = (req, res, next) => {
    if(req.isAuthenticated()){
        
        return next();
    }
    //req.flash('error_msg','No authorized');
    res.redirect('/index/signin');
}

helpers.isAdmin = (req, res, next) => {
    if (req.isAuthenticated()) {
        const user = req.user;
        if(user.vendedor){
            return next();
        }else {
            // Si el usuario no tiene la combinación de roles adecuada, mostrar un mensaje de error o redirigirlo a una página de acceso denegado
            return res.status(403).send('Acceso denegado');
        }

    }

    
    req.flash('error_msg','No es administrador');
    res.redirect('/index/signin');
}
module.exports = helpers;

