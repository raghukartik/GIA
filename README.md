
# Availability, Booking & Pricing System

This project implements a backend system for managing **items that can be booked**, calculating **prices with tax inheritance**, and **preventing double bookings**.  
The design focuses on correctness, extensibility, and clear separation of responsibilities.

---

## 1. Overall Architecture

### High-Level Structure

```
backend/
 ├── controllers/
 │    ├── item.controller.js
 │    ├── booking.controller.js
 │    └── pricing.controller.js   
 │
 ├── routes/
 │    └── restaurantRoutes.js
 │
 ├── db/
 │    ├── pool.js
 │    
 │
 ├── views/
 │    └── tax_inheritance_views.sql
 |
 │── server.js
 
```

### Why This Structure

- **Controllers**: Handle HTTP request/response only.
- **Database layer**: Centralized access and migrations.
- **Views**: Used for tax inheritance to avoid duplication.

---

## 2. ER Diagram (Data Relationships)

```
CATEGORY
+------------------------+
| id (PK)               |
| name                  |
| tax_applicable        |
| tax_percentage        |
+------------------------+
          |
          | 1-to-many
          |
SUBCATEGORY
+------------------------+
| id (PK)               |
| category_id (FK)      |
| name                  |
| tax_applicable (NULL) |
| tax_percentage (NULL) |
+------------------------+
          |
          | 1-to-many
          |
ITEM
+------------------------+
| id (PK)               |
| subcategory_id (FK)   |
| name                  |
| is_bookable           |
| availability_type     |
+------------------------+
          |
          | 1-to-1
          |
ITEM_PRICING
+------------------------+
| item_id (PK, FK)      |
| base_price            |
| currency              |
+------------------------+

ITEM
  |
  | 1-to-many
  |
AVAILABILITY
+------------------------+
| id (PK)               |
| item_id (FK)          |
| day_of_week           |
| start_time            |
| end_time              |
+------------------------+

ITEM
  |
  | 1-to-many
  |
BOOKING
+------------------------+
| id (PK)               |
| item_id (FK)          |
| customer_id           |
| start_datetime        |
| end_datetime          |
| status                |
+------------------------+
```

### ER Design Rationale

- Clear hierarchical structure: **Category → Subcategory → Item**
- Tax inheritance follows hierarchy naturally
- Availability and bookings are decoupled from item metadata
- Pricing isolated to support future extensions (discounts, surge pricing)

---

## 3. Data Modeling Decisions

- Why SQL (PostgreSQL)?
  - The domain is relationship-heavy and rule-driven (Category → Subcategory → Item → Pricing → Booking), which maps naturally to a relational model.

  - Tax inheritance and availability validation are more safely enforced at the database level using joins, views, constraints, and transactions.

  - Preventing double bookings requires strong consistency and transactional guarantees, which SQL databases provide reliably.

  - Complex queries (pricing + tax inheritance + availability checks) are simpler, more expressive, and more performant in SQL compared to a document-based model.
- UUIDs used as primary keys for scalability
- Nullable tax fields at subcategory allow inheritance
- No tax stored at item unless explicitly needed
- Availability stored separately to allow multiple slots

---

## 4. Tax Inheritance Implementation

### Rules

1. If an **item defines tax** → use item tax.
2. Else if **subcategory defines tax** → inherit subcategory tax.
3. Else → inherit **category tax**.
4. If category tax changes → inherited items automatically reflect the change.

### Implementation

- Implemented using **SQL views**
- No tax values duplicated across tables
- Category-level tax updates propagate automatically

```sql
CREATE VIEW effective_item_tax AS
SELECT
  i.id AS item_id,
  COALESCE(sc.tax_percentage, c.tax_percentage) AS effective_tax_percentage,
  COALESCE(sc.tax_applicable, c.tax_applicable) AS tax_applicable
FROM items i
JOIN subcategory sc ON i.subcategory_id = sc.id
JOIN category c ON sc.category_id = c.id;
```

---

## 5. Pricing Engine

### Flow

1. Fetch base price
2. Fetch effective tax from view
3. Calculate final price

```
tax = base_price * tax_percentage / 100
final_price = base_price + tax
```

### Output Example

```json
{
  "base_price": 1000,
  "tax": 180,
  "final_price": 1180,
  "currency": "INR"
}
```

---

## 6. Booking & Availability

- Slot-based availability (day + time range)
- Booking validated inside DB transaction
- Overlapping bookings prevented using range overlap check

---

## 7. Tradeoffs & Simplifications

- No recurring bookings
- No discount engine
- No partial slot booking
- Single currency per item

Chosen to keep focus on **core correctness** and **clarity of logic**.

---

## 8. Run Locally

### Requirements

- Node.js ≥ 18
- PostgreSQL ≥ 14

### Steps

```bash
git clone <repo-url>
cd backend
npm install
cp .env.example .env
npm start
```

Run SQL views manually:

```bash
psql < tax_inheritance_views.sql
```

---

## 8. API Documentation
- This project includes interactive API documentation using Swagger (OpenAPI 3.0) to clearly describe all backend endpoints and their behavior. Swagger UI is available at /api-docs once the server is running and allows users to explore, test, and understand APIs directly from the browser. The documentation covers restaurant and category browsing, item listing and search with filters, pricing with tax inheritance, bookable items, slot availability, and booking with double-booking prevention. Request/response schemas, HTTP status codes, and example responses are provided to serve as a clear contract between backend and frontend and to improve maintainability and clarity for reviewers and future contributors.

- URL: `http://localhost:${PORT}`
## 9. Summary

- Database-driven tax inheritance
- Transaction-safe booking
- Clean separation of concerns
- Easy to extend without redesign


---

## 10. Reflection

### Why did I choose this database?
I chose PostgreSQL because the system is relationship‑heavy and requires strong consistency. SQL makes it easier to model tax inheritance, pricing rules, and booking constraints using joins, transactions, and views. Preventing double bookings reliably was a key reason for preferring a relational database.

### Three things I learned while building this
1. A well‑designed schema simplifies most business logic.
2. SQL views are powerful for implementing inheritance without duplication.
3. Time‑based logic (availability and bookings) needs careful edge‑case handling.

### Hardest technical or design challenge
Correctly preventing double bookings under concurrent requests while handling overlapping time ranges inside a transaction.

### What I would improve or refactor with more time
- Add better indexing and performance tuning for scale.
- Support recurring availability and bookings.
- Further separate pricing and booking logic into dedicated service layers.
- Discounts and tiered pricing were not implemented. I kept the pricing engine focused on base price + tax to avoid overcomplicating the core flow. With more time, I would add a rule-based pricing layer to support discounts, tiered pricing, and promotions in a clean, extensible way without impacting booking or tax logic.
