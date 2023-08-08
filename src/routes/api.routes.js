const {Router} = require('express');
const router = Router();

const { 
    content,
    gc,
    getKeys,
    test,
    intercambiador,
    listCollections,
    logout,
    renderEditor,
    renderIndex,
    render_signin,
    user_auth
    
} = require('../controllers/api.controller');

const {isAuthenticated, isAdmin} = require('../helpers/auth');
const errorHandler = require('../middlewares/errorHandler');

router.get('/', renderIndex);
router.get('/api/editor',  renderEditor);
router.get('/api/editor/listCollections',isAdmin, listCollections);
router.get('/api/test',  test);
router.get('/intercambiador', intercambiador);
router.get('/logout', logout);
router.get('/signin', render_signin);

//router.post('/api/gen_count', gc);
router.post('/api/content', content);
router.post('/editor/keys', getKeys);
router.post('/signin', user_auth);


router.use(errorHandler);
module.exports = router;