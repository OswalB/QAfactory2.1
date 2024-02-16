const {Router} = require('express');
const router = Router();
const { 
    intercambiador,
    renderPedidos,
    
    
    
} = require('../controllers/domain.controller');

const {isAuthenticated, isAdmin,  authorization} = require('../helpers/auth');
const errorHandler = require('../middlewares/errorHandler');

router.get('/domain/intercambiador', intercambiador);

router.get('/domain/ventas-pedidos',isAuthenticated, renderPedidos);











router.use(errorHandler);
module.exports = router;