const {Router} = require('express');
const router = Router();
const { 
    intercambiador,
    pedidos,
    renderPedidos,
    
    
    
} = require('../controllers/domain.controller');

const {isAuthenticated, isAdmin,  authorization} = require('../helpers/auth');
const errorHandler = require('../middlewares/errorHandler');

router.get('/domain/intercambiador', intercambiador);

router.get('/domain/pedidos',isAuthenticated, renderPedidos);

router.post('/domain/pedidos',isAuthenticated, pedidos);










router.use(errorHandler);
module.exports = router;