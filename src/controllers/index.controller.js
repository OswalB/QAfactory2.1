const indexCtrl = {};
const passport = require('passport');
//const Note = require('../models/Note');


indexCtrl.logout = async (req, res, next) => {
    try {     
        req.logout(function(err) {
            if (err) { return ; }
        res.redirect('/');
        });
        req.flash('success_msg','Ha cerrado su sesión.');
        res.redirect('/index/signin')
    } catch (error) {
      next(error);
    }
  };


indexCtrl._testrole = async (req, res) => {
    console.log({'role:':'aceptado'})
    console.log(req.user)
    res.json({'role:':'aceptado'})
      
};


indexCtrl.intercambiador = async (req, res) => {
    res.render('interc')
      
};








indexCtrl.render_signin = async (req, res) => {
    res.render('test')
      
};

indexCtrl.user_auth = passport.authenticate('local',{
    failureRedirect:'/index/signin',
    successRedirect:'/index/intercambiador',
    failureFlash: true,
    
})





module.exports = indexCtrl  ;