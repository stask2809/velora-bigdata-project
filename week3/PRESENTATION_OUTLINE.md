# VELORA — 8–10 slide presentation

1. **Title** — VELORA, logo/name, student, course.
2. **Business idea** — customer problem, target audience, product concept.
3. **Features** — catalogue, variants, wishlist, cart, checkout, reviews, dashboard.
4. **Architecture** — browser → Express → PostgreSQL + MongoDB → cloud hosting.
5. **Database / ER diagram** — show tables, PK/FK, M:N junction tables.
6. **SQL + Big Data** — one JOIN/analytics query, 500,000 rows, actual index timing.
7. **MongoDB** — reviews, 10,000 events, aggregation/funnel.
8. **Website demo** — home, product detail, add to cart, checkout, dashboard.
9. **Deployment + testing** — public URL, T1–T10 results, security.
10. **Conclusion / roadmap** — what works now and future improvements.

## Seven-minute demo timing
- 0:00–0:45 — introduce VELORA and the business problem.
- 0:45–1:30 — architecture and why two databases.
- 1:30–2:15 — ER diagram and M:N relation.
- 2:15–3:45 — live website: search, detail, select variant, checkout.
- 3:45–4:45 — show order in PostgreSQL and MongoDB activity.
- 4:45–5:45 — show dashboard and actual index experiment.
- 5:45–6:30 — explain transaction/security.
- 6:30–7:00 — roadmap and conclusion.

## Defence questions to prepare
1. Why do you need `order_items` and `wishlist_items`?
2. Why are money fields `NUMERIC`, not `FLOAT`?
3. Why are orders in PostgreSQL and reviews/events in MongoDB?
4. What do `BEGIN`, `COMMIT` and `ROLLBACK` do?
5. What happens if a customer orders more stock than is available?
6. What does your index speed up? What are index trade-offs?
7. How do `$1`, `$2` SQL parameters prevent SQL injection?
8. How does your website combine data from both databases?
