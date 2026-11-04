# VELORA — Big Data Clothing Brand Project

A three-week student project based on the course guide:
PostgreSQL + MongoDB + Node.js/Express + HTML/CSS/JavaScript.

## Project structure
- `week1/sql/01_schema.sql` — PostgreSQL tables, keys, constraints and indexes
- `week1/sql/02_seed.sql` — sample VELORA data (Uzbek customers, UZS prices)
- `week1/sql/03_queries.sql` — 20 SQL practice/business queries
- `week1/sql/04_big_data.sql` — 500,000 generated product-view events and index test
- `week1/mongo/01_setup.mongodb.js` — MongoDB reviews + 10,000 events
- `week1/mongo/02_queries.mongodb.js` — 12 MongoDB queries
- `server/` — Express API and four website pages
- `week3/` — report, test plan, presentation and demo templates

## Requirements
- PostgreSQL 16/17 and pgAdmin 4
- MongoDB Community Server and MongoDB Compass
- Node.js 20 or 22 LTS
- VS Code (Thunder Client extension recommended)
- Git + GitHub account

## Run locally
1. Create PostgreSQL database named `velora`.
2. In pgAdmin, run `week1/sql/01_schema.sql`, then `02_seed.sql`, then `03_queries.sql` query-by-query.
3. In MongoDB Compass connect to `mongodb://127.0.0.1:27017`.
4. Open `week1/mongo/01_setup.mongodb.js` in MongoDB for VS Code Playground, or paste it into Compass Mongosh and run. Then run queries from `02_queries.mongodb.js` one block at a time.
5. Open the `server` folder in VS Code.
6. Copy `.env.example` to `.env`; enter your own PostgreSQL password. Never upload `.env`.
7. In the VS Code terminal (inside `server`), run `npm install`, then `npm run dev`.
8. Open `http://localhost:3000`.

## Important
- SQL scripts use `DROP TABLE IF EXISTS`; re-running the schema resets project data. Do not run it after you have entered real work you need to keep.
- Product images use remote Unsplash source URLs as placeholders. Replace them with images you have permission to use if needed.
- The sample records are fictional demonstration data.
- Before submission, run the actual tests, capture your own screenshots and write down your actual index timings. Do not claim a deployment or test passed unless you personally verified it.
