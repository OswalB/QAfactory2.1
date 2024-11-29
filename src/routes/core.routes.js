const { Router } = require('express');
const router = Router();

const {
    changepass,
    deleteDocument,
    deleteSubPlanilla,
    editContent,
    embodegar,
    getKeys,
    getCriterios,
    getInsumos,
    getLotesparaProduccion, getLotesVigentes,
    getNewLote,
    getOpers,
    getPool, getTraza,
    intercambiador,
    listCollections,
    logout,lotesManager,
    operarios,
    procesosList,
    proveedoresList,
    renderChangepass,
    renderEditor,
    renderIndex,
    renderSignin,
    resetPass,
    saveDocument,
    updateDoc,
    updateSubPlanilla,
    userAuth,


} = require('../controllers/core.controller');

const { isAuthenticated, isAdmin, authorization, isOperator } = require('../helpers/auth');
const errorHandler = require('../middlewares/errorHandler');

router.delete('/core/document', authorization, deleteDocument);
router.delete('/core/planilla/sub', isAuthenticated, deleteSubPlanilla);

router.get('/', intercambiador);
router.get('/change-pass', isAuthenticated, renderChangepass);
router.get('/core/criterios', isOperator, getCriterios);
router.get('/core/editor', isAdmin, renderEditor);
//router.get('/core/insumos', isAuthenticated, insumosList);
router.get('/core/insumos', isAuthenticated, getInsumos);
router.get('/core/list-collections', isAdmin, listCollections);
router.get('/core/opers', isAuthenticated, getOpers);
router.get('/core/operarios', isAuthenticated, operarios);

router.get('/core/procesos', isAuthenticated, procesosList);

router.get('/core/proveedores', isOperator, proveedoresList);
router.get('/core/pool/:id', isAuthenticated, getPool);
router.get('/intercambiador', intercambiador);
router.get('/logout', logout);
router.get('/signin', renderSignin);

router.post('/changepass', changepass);
router.post('/core/editor-content', authorization, editContent);
router.post('/core/embodegar', isAuthenticated, embodegar);

router.post('/core/keys', authorization, getKeys);
router.post('/core/lotes/test', isAuthenticated, getNewLote);
router.post('/core/lotes/manager', isAuthenticated, lotesManager);
router.post('/core/lotes/vigentes', isAuthenticated, getLotesVigentes);

router.post('/core/produccion/lotes', isAuthenticated, getLotesparaProduccion);
router.post('/core/reset-pass', isAdmin, resetPass);
router.post('/core/traza', isAuthenticated, getTraza);
router.post('/core/update', authorization, updateDoc);
router.post('/signin', userAuth);

router.put('/core/planilla/sub', isAuthenticated, updateSubPlanilla);
router.put('/core/save', authorization, saveDocument);


router.use(errorHandler);

module.exports = router;