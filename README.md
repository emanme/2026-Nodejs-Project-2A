# Simple Store API (Node.js + Express + MySQL)

This repository is designed for **real-world Git workflow practice**.

## Branches
- `main` — production/stable
- `release` — upcoming version branch with **35 seeded issues** (bugs, missing features, and improvements)

## Student Workflow
1. Checkout `release`
2. Create a branch using:
   `####-lastname+initial-3word-description`
   Example: `0402-delacruzj-payment-verification-database`
3. Fix the assigned issue
4. Push and open PR → `release`

## Quick Start
```bash
npm install
docker compose up -d
cp .env.example .env
npm run db:init
npm run dev
```

## Main Endpoints
- `POST /users/register`
- `POST /users/login`
- `GET /users/me`
- `GET /products` (pagination + search)
- `POST /products` (auth)
- `PUT /products/:id` (auth)
- `DELETE /products/:id` (auth)
- `POST /orders` (auth)
- `GET /orders` (auth)
- `GET /health`

## Release Issues
See **ISSUES.md**. In `release`, issues are tagged in code as `ISSUE-####`.
