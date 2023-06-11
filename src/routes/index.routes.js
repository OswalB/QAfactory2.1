const {Router} = require('express');
const router = Router();

const { 

    _testrole,
    intercambiador,
    render_signin,
    user_auth
    
} = require('../controllers/index.controller');
const {isAuthenticated, isAdmin} = require('../helpers/auth');

router.get('/testrole',_testrole)
router.get('/index/signin', render_signin);
router.get('/index/intercambiador', intercambiador);

router.post('/index/signin', user_auth);




module.exports = router;