const { Router } = require('express');
const router = Router();
const {
    actionsList,
    almacenContent,
    almacenSinfacturar,
    almacenKeys,
    deleteItemFormula,
    despachos,
    formulasKeys,
    formulasContent,
    getHistory,
    getEmbodegar,
    intercambiador,
    misClientes,
    notice,
    pedidos,
    planillas,
    pendientesResum,
    renderAlmacen,
    renderDespachos,
    renderFormulas, renderCostos,
    renderLotes,
    renderPedidos,
    renderPlanillas,
    renderPendientes, renderTraza,
    salesProducts,
    sugeridos,
    saveAlmacen,
    savePedido,
    savePlanilla,
    saveTemplate,
    setItemFormula,
    setState,
    stateLotes,
    templatesList,
    unaFormula,
    updateDespacho,
    updateHistoryDisp


} = require('../controllers/domain.controller');

const { isAuthenticated, isAdmin, authorization, isDispatcher,isOperator } = require('../helpers/auth');
const errorHandler = require('../middlewares/errorHandler');

router.delete('/domain/formula/item', isAuthenticated, deleteItemFormula);

router.get('/domain/almacen', isOperator, renderAlmacen);
router.get('/domain/despachos', isDispatcher, renderDespachos);
router.get('/domain/embodegar', isAuthenticated, getEmbodegar);
router.get('/domain/formulas', isAuthenticated, renderFormulas);
router.get('/domain/costos', isAdmin, renderCostos);
router.get('/domain/intercambiador', intercambiador);
router.get('/domain/lotes', isAuthenticated, renderLotes);
router.get('/domain/pedidos', isAuthenticated, renderPedidos);
router.get('/domain/pendientes', isAuthenticated, renderPendientes);
router.get('/domain/pendientes/resum', isAuthenticated, pendientesResum);
router.get('/domain/planillas', isAuthenticated, renderPlanillas);
router.get('/domain/trazabilidad', isDispatcher, renderTraza);

router.post('/domain/actions-list', isAuthenticated, actionsList);
router.post('/domain/almacen/content', isOperator, almacenContent);
router.post('/domain/almacen/sinfacturar', isAuthenticated, almacenSinfacturar);
router.post('/domain/almacen/keys', isAuthenticated, almacenKeys);
router.post('/domain/despachos', isDispatcher, despachos);
router.post('/domain/despachos/history', isDispatcher, getHistory);
router.post('/domain/formula', isAuthenticated, unaFormula);
router.post('/domain/formulas/keys', isAdmin, formulasKeys);
router.post('/domain/formulas/content', isAuthenticated, formulasContent);

router.post('/domain/mis-clientes', isAuthenticated, misClientes);
router.post('/domain/notice', isDispatcher, notice);
router.post('/domain/pedidos', isAuthenticated, pedidos);
router.post('/domain/pedidos/suggested', isAuthenticated, sugeridos);
router.post('/domain/planillas', isAuthenticated, planillas);
router.post('/domain/templates-list', isAuthenticated, templatesList);
router.post('/domain/ventas/productos', isAuthenticated, salesProducts);

router.put('/domain/almacen', isAuthenticated, saveAlmacen);
router.put('/domain/despachos/update', isDispatcher, updateDespacho);
router.put('/domain/despachos-hist/update', isDispatcher, updateHistoryDisp);
router.put('/domain/formula/item', isAuthenticated, setItemFormula);
router.put('/domain/lotes/state', isAuthenticated, stateLotes);
router.put('/domain/order/state', isDispatcher, setState);
router.put('/domain/pedido/save', isAuthenticated, savePedido);
router.put('/domain/planilla/save', isAuthenticated, savePlanilla);
router.put('/domain/template', isAuthenticated, saveTemplate);








router.use(errorHandler);
module.exports = router;