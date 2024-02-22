const {Router} = require('express');
const router = Router();

const { 
    
    deleteDocument,
    editContent,
    genCount,
    getKeys,
    listCollections,
    logout,
    
    renderEditor,
    renderIndex,
    renderSignin,
    saveDocument,
    userAuth,
    
    
} = require('../controllers/core.controller');

const {isAuthenticated, isAdmin, authorization} = require('../helpers/auth');
const errorHandler = require('../middlewares/errorHandler');

router.delete('/core/document',authorization, deleteDocument);

router.get('/', renderIndex);
router.get('/core/editor', isAdmin,  renderEditor);
router.get('/core/list-collections',isAdmin, listCollections);
router.get('/logout', logout);
router.get('/signin', renderSignin);

router.post('/core/gen-count',authorization, genCount);
router.post('/core/editor-content',authorization, editContent);
router.post('/core/keys',authorization, getKeys);

router.post('/signin', userAuth);

router.put('/core/save', authorization, saveDocument);


router.use(errorHandler);

module.exports = router;