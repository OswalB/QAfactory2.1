const {Router} = require('express');
const router = Router();

const { 
    test
    
} = require('../controllers/api.controller');
const {isAuthenticated, isAdmin} = require('../helpers/auth');

router.get('/api/test',  test);
//router.get('/notes', isAuthenticated, test);


module.exports = router;