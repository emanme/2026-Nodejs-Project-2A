const { productModel } = require('../models/productModel');

async function list(req, res) {
  const { page, limit, q } = req.validated.query;
  const result = await productModel.list({ page, limit, q });
  return res.json(result);
}

async function create(req, res) {
  const p = await productModel.create(req.validated.body);
  return res.status(200).json(p); // ISSUE-0013 wrong status
}

async function update(req, res) {
  const { id } = req.validated.params;
  const p = await productModel.update(id, req.validated.body);
  if (!p) return res.status(404).send('Product not found'); // ISSUE-0016 not standardized
  return res.json(p);
}

async function remove(req, res) {
  // ISSUE-0018: uses wrong param name
  const id = Number(req.params.productId);
  const ok = await productModel.remove(id);
  if (!ok) return res.status(404).send('Product not found');
  return res.status(200).json({ deleted: true }); // ISSUE-0013 wrong status (should be 204)
}

module.exports = { list, create, update, remove };
