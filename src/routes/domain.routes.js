const {Router} = require('express');
const router = Router();
const { 
    despachos,
    getHistory,
    intercambiador,
    misClientes,
    pedidos,
    renderDespachos,
    renderPedidos,
    salesProducts,
    sugeridos,
    saveAverias,
    savePedido,
    stateLotes,
    updateDespacho,
    updateHistoryDisp
    
    
} = require('../controllers/domain.controller');

const {isAuthenticated, isAdmin,  authorization, isDispatcher} = require('../helpers/auth');
const errorHandler = require('../middlewares/errorHandler');

router.get('/domain/despachos',isDispatcher, renderDespachos);
router.get('/domain/intercambiador', intercambiador);
router.get('/domain/pedidos',isAuthenticated, renderPedidos);

router.post('/domain/despachos',isDispatcher, despachos);
router.post('/domain/despachos/history',isDispatcher, getHistory);
router.post('/domain/mis-clientes',isAuthenticated, misClientes);
router.post('/domain/pedidos',isAuthenticated, pedidos);
router.post('/domain/pedidos/suggested',isAuthenticated, sugeridos);
router.post('/domain/ventas/productos',isAuthenticated, salesProducts);

router.put('/domain/averias/save', isAuthenticated, saveAverias);
router.put('/domain/despachos/update', isDispatcher, updateDespacho);
router.put('/domain/despachos-hist/update', isDispatcher, updateHistoryDisp);
router.put('/domain/lotes/state', isAuthenticated, stateLotes);
router.put('/domain/pedido/save', isAuthenticated, savePedido);








router.use(errorHandler);
module.exports = router;