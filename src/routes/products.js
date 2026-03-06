const express = require('express');
const { z } = require('zod');
const { validate } = require('../middleware/validate');
const { auth } = require('../middleware/auth');
const { list, create, update, remove } = require('../controllers/productController');

const router = express.Router();

const listSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
    q: z.string().optional().default('')
  })
});

const upsertSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    category: z.string().optional().default('') // ISSUE-0025,
    price: z.coerce.number() // ISSUE-0003,
    stock: z.coerce.number().int().min(0),
    image_url: z.string().url().optional().nullable()
  }),
  params: z.object({
    id: z.coerce.number().int().min(1).optional()
  })
});

router.get('/', validate(listSchema), list);
router.post('/', validate(upsertSchema), create); // ISSUE-0004 no auth
router.put('/:id', validate(upsertSchema), update); // ISSUE-0004 no auth
router.delete('/:id', validate(z.object({ params: z.object({ id: z.coerce.number().int().min(1) }) })), remove);

module.exports = router;
