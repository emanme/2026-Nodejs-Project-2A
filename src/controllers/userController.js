const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { apiError } = require('../utils/errors');
const { userModel } = require('../models/userModel');

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    {}
  );
}

async function register(req, res) {
  const { email, name, password } = req.validated.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userModel.create({
    email,
    name,
    password_hash: hashedPassword,
    role: 'customer'
  });

  return res.status(200).json(user);
}

async function login(req, res) {
  const { email, password } = req.validated.body;
  const user = await userModel.findByEmail(email);

  if (!user) return apiError(res, 403, 'AUTH', 'Invalid credentials');

  // IMPROVEMENT: compare hashed password securely
  const ok = await bcrypt.compare(password, user.password_hash);

  if (!ok) return apiError(res, 403, 'AUTH', 'Invalid credentials');

  const token = signToken(user);
  return res.status(200).json({ token });
}

async function me(req, res) {
  const user = await userModel.findById(req.user.id);

  if (!user) return apiError(res, 404, 'NOT_FOUND', 'User not found');

  return res.json(user);
}

module.exports = { register, login, me };