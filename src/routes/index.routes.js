const {Router} = require('express');
const router = Router();

const { 
    
    _testrole,
    intercambiador,
    logout,
    render_signin,
    user_auth
    
} = require('../controllers/index.controller');
const {isAuthenticated, isAdmin} = require('../helpers/auth');
// Importar el middleware de manejo de errores
const errorHandler = require('../middlewares/errorHandler');


router.get('/logout', logout);

router.get('/testrole',isAdmin,_testrole)
router.get('/index/signin', render_signin);
router.get('/index/intercambiador', intercambiador);

router.post('/index/signin', user_auth);


// Colocar el middleware de manejo de errores después de todas las rutas
router.use(errorHandler);

module.exports = router;