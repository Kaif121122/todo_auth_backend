const { Router } = require('express');
const { getToDo, saveToDo, deleteToDo, updateToDo, setRegister, setLogin, forgotPassword, resetPasswordPage, resetPassword } = require('../controllers/AuthController');
const authMiddleware = require('../middlewares/AuthMiddleware')

const router = Router();

// Register route

router.post('/register', setRegister);

// Login route

router.post('/login', setLogin);

// Forgot password route 

router.post('/forgot-password', forgotPassword);

// Reset password route 

router.get('/reset-password/:token', resetPasswordPage);

// Set new Password 

router.post('/reset-password/:token', resetPassword)

// Todo route

// Get todo data 

router.get("/todo", authMiddleware, getToDo);

// Add todo data 

router.post("/todo/save", authMiddleware, saveToDo);

// Update todo data 

router.post("/todo/update", authMiddleware, updateToDo);

// Delete todo data 

router.post("/todo/delete", authMiddleware, deleteToDo);

module.exports = router;