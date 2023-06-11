const indexCtrl = {};
const passport = require('passport');
//const Note = require('../models/Note');


indexCtrl._testrole = async (req, res) => {
    console.log({'role:':'aceptado'})
    res.json({'role:':'aceptado'})
      
};


indexCtrl.intercambiador = async (req, res) => {
    res.render('interc')
      
};


index.logout = (req, res)=>{
    //req.logout();
    try{
    req.logout(function(err) {
        if (err) { return ; }
    res.redirect('/');
    });
    req.flash('success_msg','Ha cerrado su sesión.');
    res.redirect('/terceros/signin')
    }catch(e){
        fx.errorlog('logout',JSON.stringify(req.body), e, req.user);
        let result = [];
        result.push({"fail" : true});
        res.json(result);
        console.log(e);
    }
}

indexCtrl.render_signin = async (req, res) => {
    res.render('test')
      
};

indexCtrl.user_auth = passport.authenticate('local',{
    failureRedirect:'/index/signin',
    successRedirect:'/index/intercambiador',
    failureFlash: true,
    
})





module.exports = indexCtrl  ;