const apiCtrl = {};
const passport = require('passport');
//const Note = require('../models/Note');
const DvService = require('../services/serv.db');

apiCtrl.gc = async (req, res) => {
    const panel = { "titulo":"TEST","boton-nuevo":true, "boton-pagination":true};
    res.json([{'countTotal':11}])   
};

apiCtrl.test = async (req, res) => {
    const panel = { "titulo":"TEST","boton-nuevo":true, "boton-pagination":true};
    res.render('test',{panel})   
};



apiCtrl.intercambiador = async (req, res, next) => {
    try {     
        res.render('interc');
    } catch (error) {
      next(error);
    }
};

apiCtrl.logout = async (req, res, next) => {
    try { 
        req.logout(function(err) {
            if (err) { return ; }
        res.redirect('/');
        });
        req.flash('success_msg','Ha cerrado su sesión.');
        res.redirect('/signin'); 
        
    } catch (error) {
        next(error);
    }
};

apiCtrl.renderIndex = async (req, res, next) => {
    try {     
        res.render('index/index')
    } catch (error) {
        next(error);
    }
};

apiCtrl.render_signin = async (req, res, next) => {
    try {     
        res.render('users/signin')
    } catch (error) {
        next(error);
    }
};

apiCtrl.user_auth = passport.authenticate('local',{
   
        failureRedirect:'/signin',
        successRedirect:'/intercambiador',
        failureFlash: true,  
    
});




module.exports = apiCtrl  ;