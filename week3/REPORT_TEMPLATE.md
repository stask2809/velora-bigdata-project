# VELORA — Big Data Project Report

> Replace all bracketed instructions with your own information. Add screenshots and actual measurements. Do not invent test results or deployment URLs.

## 1. Title page
VELORA — Modern Clothing E-commerce Platform  
Student: [Your name] · Group: [Group] · Course: Big Data · Date: [Date]  
Live URL: [After deployment] · GitHub: [Your repository]

## 2. Business idea
VELORA is a fictional modern clothing brand targeting customers who want minimalist everyday clothing. The website helps customers browse collections, select size and colour, save favourites and place orders. The business earns revenue from clothing sales. Target market: [describe your target customers in Uzbekistan]. Competitors: [research and name two real competitors; briefly compare their positioning].

## 3. System architecture
Browser (HTML/CSS/JavaScript) → Node.js + Express REST API → PostgreSQL + MongoDB.  
PostgreSQL stores structured business data (products, variants, customers, orders, stock, payments). MongoDB stores flexible reviews and high-volume clickstream events. Add your architecture diagram.

## 4. Database design
Insert your ER diagram. Explain primary keys, foreign keys, the `wishlist_items` and `order_items` many-to-many junction tables, constraints, and indexes. List each table and its purpose.

## 5. Queries and analytics
Choose five SQL queries and three MongoDB queries. For each: state the business question, explain the query, add your own result screenshot, and describe what the result means.

## 6. Big Data experiment
Describe the 500,000-row `product_view_log` table. Insert your actual `EXPLAIN ANALYZE` screenshots and a table:
| Query | Before index (ms) | After index (ms) | Notes |
|---|---:|---:|---|
| City + product filter | [actual] | [actual] | [actual explanation] |

Explain why the index helps this filter and mention that indexes also use storage and can slow writes.

## 7. Website and API
Describe the four pages: home, product detail, cart/checkout, dashboard. List API routes:
- GET `/api/health`
- GET `/api/categories`
- GET `/api/products`
- GET `/api/products/:id`
- POST `/api/products` (create)
- PUT `/api/products/:id` (update)
- DELETE `/api/products/:id` (soft delete)
- POST `/api/products/:id/reviews`
- POST `/api/orders`
- GET `/api/customers/:id/orders`
- GET `/api/stats/sales-by-city`
- GET `/api/stats/top-viewed`
- GET `/api/stats/funnel`
Explain the order transaction (BEGIN, COMMIT, ROLLBACK) and stock validation. Add screenshots.

## 8. Deployment and testing
Describe Supabase, MongoDB Atlas and Render setup. Add your actual public URL. Include the completed T1–T10 test table and security checklist. Mention problems encountered and how you fixed them.

## 9. Startup roadmap
Possible next features: customer login, admin product editor, size guide, returns, delivery tracking, inventory alerts, Uzbek/Russian language support, payment gateway integration, personalised recommendations. Explain how analytics could support decisions with 1 million customers.

## 10. Conclusion
Summarise what you built, what you learned, current limitations and next steps.
