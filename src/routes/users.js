const express = require('express');
const { z } = require('zod');
const { validate } = require('../middleware/validate');
const { auth } = require('../middleware/auth');
const { register, login, me } = require('../controllers/userController');

const router = express.Router();

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    name: z.string().min(2),
    password: z.string().min(1) // ISSUE-0008 weak policy in release
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1)
  })
});

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', auth, me);

module.exports = router;
