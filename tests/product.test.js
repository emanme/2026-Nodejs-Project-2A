const request = require('supertest');
const express = require('express');

const productsRouter = require('../routes/products');

const app = express();
app.use(express.json());
app.use('/products', productsRouter);

describe("Product Routes", () => {

  test("GET /products should return 200", async () => {
    const res = await request(app).get('/products');
    expect(res.statusCode).toBe(200);
  });

  test("POST /products should create product", async () => {
    const res = await request(app)
      .post('/products')
      .send({
        name: "Test Product",
        category: "Test",
        price: 100,
        stock: 10
      });

    expect(res.statusCode).toBe(200);
  });

  test("POST /products should fail validation", async () => {
    const res = await request(app)
      .post('/products')
      .send({
        price: 100,
        stock: 10
      });

    expect(res.statusCode).toBe(400);
  });

  test("PUT /products/:id should update", async () => {
    const res = await request(app)
      .put('/products/1')
      .send({
        name: "Updated",
        price: 200,
        stock: 5
      });

    expect(res.statusCode).toBe(200);
  });

  test("DELETE /products/:id should delete", async () => {
    const res = await request(app)
      .delete('/products/1');

    expect(res.statusCode).toBe(200);
  });

});