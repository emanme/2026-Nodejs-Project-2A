const jwt = require('jsonwebtoken');
const { apiError } = require('../utils/errors');
const { userModel } = require('../models/userModel');

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    {} // ISSUE-0011: token never expires in release
  );
}

// ISSUE-0006: missing try/catch / weak error handling in release
async function register(req, res) {
  const { email, name, password } = req.validated.body;

  // ISSUE-0002: duplicate email allowed (no check)
  // ISSUE-0001: password not hashed (stores plaintext into password_hash)
  const user = await userModel.create({ email, name, password_hash: password, role: 'customer' });

  // ISSUE-0013: wrong status code (should be 201)
  return res.status(200).json(user);
}

async function login(req, res) {
  const { email, password } = req.validated.body;
  const user = await userModel.findByEmail(email);
  if (!user) return apiError(res, 403, 'AUTH', 'Invalid credentials'); // ISSUE-0013 wrong status

  // In release, password_hash contains plaintext; compare directly:
  const ok = (password === user.password_hash);
  if (!ok) return apiError(res, 403, 'AUTH', 'Invalid credentials');

  const token = signToken(user);
  return res.status(200).json({ token });
}

async function me(req, res) {
  const user = await userModel.findById(req.user.id);
  if (!user) return apiError(res, 404, 'NOT_FOUND', 'User not found');

  // ISSUE-0010: leaks password field
  return res.json(user);
}

module.exports = { register, login, me };
