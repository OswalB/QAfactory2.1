const {Router} = require('express');
const router = Router();
const { 
    despachos,
    getHistory,
    getHistoryAveria,
    getEmbodegar,
    intercambiador,
    misClientes,
    pedidos,
    renderDespachos,
    renderPedidos,
    salesProducts,
    sugeridos,
    saveAverias,
    savePedido,
    setState,
    stateLotes,
    updateAveria,
    updateDespacho,
    updateHistoryDisp
    
    
} = require('../controllers/domain.controller');

const {isAuthenticated, isAdmin,  authorization, isDispatcher} = require('../helpers/auth');
const errorHandler = require('../middlewares/errorHandler');

router.get('/domain/despachos',isDispatcher, renderDespachos);
router.get('/domain/embodegar',isAuthenticated, getEmbodegar);
router.get('/domain/intercambiador', intercambiador);
router.get('/domain/pedidos',isAuthenticated, renderPedidos);

router.post('/domain/despachos',isDispatcher, despachos);
router.post('/domain/despachos/history',isDispatcher, getHistory);
router.post('/domain/averias/history',isDispatcher, getHistoryAveria);
router.post('/domain/mis-clientes',isAuthenticated, misClientes);
router.post('/domain/pedidos',isAuthenticated, pedidos);
router.post('/domain/pedidos/suggested',isAuthenticated, sugeridos);
router.post('/domain/ventas/productos',isAuthenticated, salesProducts);

router.put('/domain/averias/save', isAuthenticated, saveAverias);
router.put('/domain/averias/update', isDispatcher, updateAveria);
router.put('/domain/despachos/update', isDispatcher, updateDespacho);
router.put('/domain/despachos-hist/update', isDispatcher, updateHistoryDisp);
router.put('/domain/lotes/state', isAuthenticated, stateLotes);
router.put('/domain/order/state', isDispatcher, setState);
router.put('/domain/pedido/save', isAuthenticated, savePedido);








router.use(errorHandler);
module.exports = router;