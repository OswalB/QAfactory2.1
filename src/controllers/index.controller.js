const indexCtrl = {};
const passport = require('passport');
//const Note = require('../models/Note');


indexCtrl.funcionControlador1 = async (req, res, next) => {
    try {     
      consoles.log('todo bien')
      res.status(200).json({ message: 'Operación exitosa' });
    } catch (error) {
      next(error);
    }
  };

















indexCtrl._testrole = async (req, res) => {
    console.log({'role:':'aceptado'})
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