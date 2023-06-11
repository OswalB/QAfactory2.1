const helpers = {};

helpers.isAuthenticated = (req, res, next) => {
    if(req.isAuthenticated()){
        
        return next();
    }
    //req.flash('error_msg','No authorized');
    res.redirect('/');
}

helpers.isAdmin = (req, res, next) => {
    if(req.user.administrador){
        return next();
    }
    req.flash('error_msg','No es administrador');
    res.redirect('/');
}
module.exports = helpers;

