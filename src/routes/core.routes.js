const {Router} = require('express');
const router = Router();

const { 
    changepass,
    deleteDocument,
    editContent,
    getKeys,
    getLotesVigentes,
    intercambiador,
    listCollections,
    logout,
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
router.get('/core/editor', isAdmin,  renderEditor);
router.get('/core/list-collections',isAdmin, listCollections);
router.get('/intercambiador', intercambiador);
router.get('/logout', logout);
router.get('/signin', renderSignin);

router.post('/changepass',changepass);
router.post('/core/editor-content',authorization, editContent);
router.post('/core/keys',authorization, getKeys);
router.post('/core/lotes/vigentes',isAuthenticated, getLotesVigentes);
router.post('/signin', userAuth);
router.post('/core/reset-pass', isAdmin, resetPass);

router.put('/core/save', authorization, saveDocument);


router.use(errorHandler);

module.exports = router;