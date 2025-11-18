const { Router } = require('express');
const authController = require('../controllers/authController');

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/users', authController.listUsers);
router.delete('/users/:id', authController.deleteUser);

module.exports = router;


