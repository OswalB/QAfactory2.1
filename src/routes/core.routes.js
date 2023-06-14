const {Router} = require('express');
const router = Router();

const { 
    test
    
} = require('../controllers/core.controller');
const {isAuthenticated, isAdmin} = require('../helpers/auth');
const errorHandler = require('../middlewares/errorHandler');

router.get('/core/test',  test);





router.use(errorHandler);

module.exports = router;