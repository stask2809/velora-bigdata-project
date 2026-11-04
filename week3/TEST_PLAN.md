# VELORA — Week 3 Test Plan (fill in after real testing)

| ID | Test | Steps | Expected result | Actual result (you fill) | Pass? |
|---|---|---|---|---|---|
| T1 | Home page | Open public URL on phone | Product grid loads | | |
| T2 | Search | Search for “hoodie” | Matching products only | | |
| T3 | Filter | Choose T-shirts | Only T-shirts appear | | |
| T4 | Product detail | Open a product | PostgreSQL product + MongoDB reviews | | |
| T5 | Checkout | Valid customer + available variant | 201 response and order saved | | |
| T6 | Stock rule | Order more than available stock | 409 error; transaction rolled back | | |
| T7 | Validation | Submit empty checkout | 400 error; no crash | | |
| T8 | XSS | Submit review text `<b>hello</b>` | Displayed as text, not rendered HTML | | |
| T9 | Dashboard | Open analytics page | SQL + MongoDB stats shown | | |
| T10 | Browser console | Press F12 on each page | No red errors | | |
