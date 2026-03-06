const express = require('express');
const { z } = require('zod');
const { validate } = require('../middleware/validate');
const { auth } = require('../middleware/auth');
const { create, list } = require('../controllers/orderController');

const router = express.Router();

const createSchema = z.object({
  body: z.object({
    items: z.array(z.object({
      product_id: z.coerce.number().int().min(1),
      quantity: z.coerce.number().int().min(1)
    })).min(1)
  })
});

router.post('/', auth, create); // ISSUE-0020 + ISSUE-0009
router.get('/', auth, list);

module.exports = router;
