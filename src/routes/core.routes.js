const {Router} = require('express');
const router = Router();

const { 
    changepass,
    deleteDocument,
    editContent,
    embodegar,
    getKeys,
    getCriterios,
    getInsumos,
    getLotesVigentes,
    getNewLote,
    getOpers,
    intercambiador,
    listCollections,
    logout,
    proveedoresList,
    renderChangepass,
    renderEditor,
    renderIndex,
    renderSignin,
    resetPass,
    saveDocument,
    userAuth,
    
    
} = require('../controllers/core.controller');

const {isAuthenticated, isAdmin, authorization} = require('../helpers/auth');
const errorHandler = require('../middlewares/errorHandler');

router.delete('/core/document',authorization, deleteDocument);

router.get('/', renderIndex);
router.get('/change-pass', isAuthenticated, renderChangepass);
router.get('/core/criterios', isAdmin,  getCriterios);
router.get('/core/editor', isAdmin,  renderEditor);
router.get('/core/list-collections',isAdmin, listCollections);
router.get('/core/insumos',isAuthenticated, getInsumos);
router.get('/core/opers',isAuthenticated, getOpers);
router.get('/intercambiador', intercambiador);
router.get('/logout', logout);
router.get('/core/proveedores', isAdmin, proveedoresList);
router.get('/signin', renderSignin);

router.post('/changepass',changepass);
router.post('/core/embodegar',isAuthenticated, embodegar);
router.post('/core/editor-content',authorization, editContent);
router.post('/core/keys',authorization, getKeys);
router.post('/core/lotes/test',isAuthenticated, getNewLote);
router.post('/core/lotes/vigentes',isAuthenticated, getLotesVigentes);
router.post('/signin', userAuth);
router.post('/core/reset-pass', isAdmin, resetPass);

router.put('/core/save', authorization, saveDocument);


router.use(errorHandler);

module.exports = router;