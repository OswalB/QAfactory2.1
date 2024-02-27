const {Router} = require('express');
const router = Router();
const { 
    intercambiador,
    misClientes,
    pedidos,
    renderPedidos,
    salesProducts
    
    
    
} = require('../controllers/domain.controller');

const {isAuthenticated, isAdmin,  authorization} = require('../helpers/auth');
const errorHandler = require('../middlewares/errorHandler');

router.get('/domain/intercambiador', intercambiador);

router.get('/domain/pedidos',isAuthenticated, renderPedidos);

router.post('/domain/mis-clientes',isAuthenticated, misClientes);
router.post('/domain/pedidos',isAuthenticated, pedidos);
router.post('/domain/ventas/productos',isAuthenticated, salesProducts);









router.use(errorHandler);
module.exports = router;