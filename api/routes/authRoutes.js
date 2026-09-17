const express = require('express');
const passport = require('passport');
const router = express.Router();
const authController = require('../controllers/authController');
const { isLibrarian } = require('../middleware/auth');

router.post('/register', isLibrarian, authController.register);

router.post('/login', passport.authenticate('local'), authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.getCurrentUser);
router.get('/current-user', authController.getCurrentUser);

module.exports = router;