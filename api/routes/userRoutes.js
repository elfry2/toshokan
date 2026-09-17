const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Adjust path as needed
const { isLibrarian } = require('../middleware/auth');

// GET /api/users - Fetch all users
// POST /api/users - Create a new user
router.route('/')
  .get(isLibrarian, userController.getUsers)
  .post(isLibrarian, userController.createUser);

// GET /api/users/:id - Fetch single user
// PUT /api/users/:id - Update user details/password
// DELETE /api/users/:id - Delete a user
router.route('/:id')
  .get(isLibrarian, userController.getUserById)
  .put(isLibrarian, userController.updateUser)
  .delete(isLibrarian, userController.deleteUser);

module.exports = router;