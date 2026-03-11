require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const users = require('./routes/users');
const products = require('./routes/products');
const orders = require('./routes/orders');

const app = express();

app.use(helmet());

// ISSUE-0031: CORS too open in release

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000'
}));

// ISSUE-0024: server can crash on invalid JSON in release

app.use(express.json());

// ISSUE-0023: request logging missing in release (no morgan)
// ISSUE-0028: rate limiter missing in release
// (can be added later with `morgan` and `express-rate-limit`)

// ISSUE-0035: /health endpoint missing in release
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime()
  });
});

app.use('/users', users);
app.use('/products', products);
app.use('/orders', orders);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`API running on port ${port}`));
