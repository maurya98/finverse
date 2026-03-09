# Customer Service – API Documentation

Base URL (example): `http://localhost:3000`  
Customer routes are mounted under `/customer` (e.g. if using `app.use("/api", apiRouter)`, use `http://localhost:3000/api/customer`).

All request/response bodies are JSON. Success responses follow the shape used by `@finverse/utils` (e.g. `{ data, message }`).

### Nested relations (create, update, get, delete)

Related data is handled through the same customer endpoints (no separate APIs):

- **Create / upsert / bulk create**: Request body may include nested relation **arrays** for `address`, `utmSources`, `gstDetails`, `bureauScores`, `deviceDetails`, `companyDetails`, `paStampMaster`. Pass an array of objects (e.g. `address: [ { addressline1, pincode, city, state, country, address_type } ]`). The API converts these to Prisma create operations.
- **Update / bulk update**: Same: pass relation keys as arrays to create new related rows (e.g. `address: [ { ... } ]`). For update/delete/connect use the full Prisma shape if needed.
- **GET single / GET bulk**: Use query param `includeRelations=true` or `include=<any value>` to return the customer(s) with all related records (address, utmSources, gstDetails, etc.). Without it, only customer scalar fields are returned.
- **Delete**: Hard delete removes the customer and **all related records** (addresses, utm sources, GST details, etc.) via cascade. Soft delete only sets `is_active: false` on the customer; relations are unchanged.

---

## 1. Create customer

**POST** `/customer`

Creates a single customer. All fields are optional except that unique fields (email, phone, alternate_phone, pan, aadhaar) must not conflict with existing records. You may include **nested relation data** in the same request (see Nested relations above).

### Request body (all fields optional)

| Field             | Type    | Description                    |
|------------------|---------|--------------------------------|
| fname            | string  | First name                     |
| lname            | string  | Last name                      |
| email            | string  | Email (unique)                 |
| phone            | string  | Phone (unique)                 |
| alternate_phone   | string  | Alternate phone (unique)       |
| pan              | string  | PAN (unique)                   |
| aadhaar          | string  | Aadhaar (unique)               |
| gender           | string  | Gender                         |
| dob              | string  | Date of birth (ISO date)      |
| employment_type  | number  | Employment type                |
| income           | number  | Income                         |
| marital_status   | string  | `SINGLE` \| `MARRIED` \| `DIVORCED` \| `WIDOWED` |
| is_active        | boolean | Default: `true`                |
| address          | array  | Nested: `[ { addressline1, pincode, city, state, country, address_type } ]` |
| utmSources       | array  | Nested: `[ { utm_source, utm_medium, ... } ]` |
| gstDetails       | array  | Nested: `[ { gst_number, gst_type, ... } ]` |
| bureauScores     | array  | Nested: `[ { bureau_score, bureau_provider, ... } ]` |
| deviceDetails    | array  | Nested: `[ { device_id, device_type, ... } ]` |
| companyDetails   | array  | Nested: `[ { company_name, company_category, ... } ]` |
| paStampMaster    | array  | Nested: `[ { offer_id, product_id, ... } ]` |

### cURL

```bash
curl -X POST http://localhost:3000/customer \
  -H "Content-Type: application/json" \
  -d '{
    "fname": "John",
    "lname": "Doe",
    "email": "john.doe@example.com",
    "phone": "+919876543210",
    "gender": "M",
    "dob": "1990-05-15",
    "income": 500000,
    "marital_status": "SINGLE",
    "is_active": true
  }'
```

### Example payload (minimal)

```json
{
  "email": "jane@example.com",
  "phone": "+919876543211"
}
```

### Example payload (with nested address and GST)

```json
{
  "fname": "John",
  "lname": "Doe",
  "email": "john.doe@example.com",
  "phone": "+919876543210",
  "address": [
    {
      "addressline1": "123 Main St",
      "pincode": 110001,
      "city": "New Delhi",
      "state": "Delhi",
      "country": "India",
      "address_type": "PERMANENT"
    }
  ],
  "gstDetails": [
    {
      "gst_number": "29AABCT1332L1ZN",
      "gst_type": "Regular",
      "gst_state": "Delhi"
    }
  ]
}
```

### Response

- **201** – Customer created; body includes the created customer object.
- **400** – Request body missing or invalid.
- **409** – Unique constraint violation (e.g. duplicate email/phone/pan/aadhaar).
- **500** – Server error.

---

## 2. Create or update customer (upsert)

**PUT** `/customer/upsert`

Creates a customer if none exists with the given **email** or **phone**, otherwise updates the existing one. Request body must include **at least one of** `email` or `phone`; that value is used to find the customer. All other fields are optional.

### Request body

| Field             | Type    | Required | Description                    |
|------------------|---------|----------|--------------------------------|
| email            | string  | one of   | Email (unique); used as lookup if provided |
| phone            | string  | one of   | Phone (unique); used as lookup if provided |
| fname            | string  | No       | First name                     |
| lname            | string  | No       | Last name                      |
| alternate_phone   | string  | No       | Alternate phone (unique)       |
| pan              | string  | No       | PAN (unique)                   |
| aadhaar          | string  | No       | Aadhaar (unique)               |
| gender           | string  | No       | Gender                         |
| dob              | string  | No       | Date of birth (ISO date)      |
| employment_type  | number  | No       | Employment type                |
| income           | number  | No       | Income                         |
| marital_status   | string  | No       | `SINGLE` \| `MARRIED` \| `DIVORCED` \| `WIDOWED` |
| is_active        | boolean | No       | Default: `true`                |

### cURL

```bash
curl -X PUT http://localhost:3000/customer/upsert \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "fname": "John",
    "lname": "Doe",
    "phone": "+919876543210",
    "income": 550000
  }'
```

### Example payload (create or update by email)

```json
{
  "email": "john.doe@example.com",
  "fname": "John",
  "lname": "Doe",
  "income": 550000
}
```

### Example payload (create or update by phone)

```json
{
  "phone": "+919876543210",
  "fname": "John",
  "lname": "Doe"
}
```

### Response

- **201** – Customer was **created**; body includes `{ customer, created: true }`.
- **200** – Customer was **updated**; body includes `{ customer, created: false }`.
- **400** – Request body missing, invalid, or neither email nor phone provided.
- **409** – Unique constraint violation on another field (e.g. pan/aadhaar).
- **500** – Server error.

---

## 3. Get customer (single)

**GET** `/customer`

Fetches one customer by `id`, `email`, or `phone`. Exactly one of these query parameters is required. For `email` and `phone`, only active customers (`is_active: true`) are returned. Use **`includeRelations=true`** or **`include=1`** (or any value) to include related records (address, utmSources, gstDetails, bureauScores, deviceDetails, companyDetails, paStampMaster) in the response.

### Query parameters

| Parameter        | Type   | Required | Description        |
|------------------|--------|----------|--------------------|
| id               | number | one of   | Customer ID        |
| email            | string | one of   | Customer email     |
| phone            | string | one of   | Customer phone     |
| includeRelations | string | No       | Set to `true` to include all relation arrays in response |
| include          | string | No       | If present (any value), same as includeRelations=true |

### cURL (by id)

```bash
curl -X GET "http://localhost:3000/customer?id=1"
```

### cURL (by email)

```bash
curl -X GET "http://localhost:3000/customer?email=john.doe@example.com"
```

### cURL (by phone)

```bash
curl -X GET "http://localhost:3000/customer?phone=%2B919876543210"
```

### cURL (with relations included)

```bash
curl -X GET "http://localhost:3000/customer?id=1&includeRelations=true"
```

### Response

- **200** – Customer found. If `includeRelations=true` or `include` was used, the body includes arrays: `address`, `utmSources`, `gstDetails`, `bureauScores`, `deviceDetails`, `companyDetails`, `paStampMaster`. Otherwise only customer scalar fields are returned.
- **400** – Missing or invalid query (e.g. no id/email/phone, or invalid id).
- **404** – Customer not found.
- **500** – Server error.

---

## 4. Update customer

**PUT** `/customer`

Updates a single customer by `id`. Request body must include `id`; all other fields are optional and only provided fields are updated. You may include **nested relation arrays** in the same request: pass `address`, `utmSources`, `gstDetails`, etc. as arrays (e.g. `address: [ { ... } ]`) to create new related rows; the API converts arrays to create operations.

### Request body

| Field   | Type   | Required | Description        |
|---------|--------|----------|--------------------|
| id      | number | Yes      | Customer ID        |
| fname   | string | No       | First name         |
| lname   | string | No       | Last name          |
| email   | string | No       | Email (unique)     |
| phone   | string | No       | Phone (unique)     |
| ...     | ...    | No       | Same optional fields as create; plus nested `address`, `gstDetails`, etc. as arrays to create new related rows |

### cURL

```bash
curl -X PUT http://localhost:3000/customer \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "fname": "John",
    "lname": "Doe",
    "income": 600000
  }'
```

### Example payload

```json
{
  "id": 1,
  "email": "john.updated@example.com",
  "income": 600000
}
```

### Example payload (with nested relation – add addresses)

```json
{
  "id": 1,
  "income": 600000,
  "address": [
    { "addressline1": "456 New St", "pincode": 110002, "city": "New Delhi", "state": "Delhi", "country": "India", "address_type": "CURRENT" }
  ]
}
```

### Response

- **200** – Customer updated; body includes the updated customer object.
- **400** – Missing or invalid `id`.
- **404** – Customer not found.
- **409** – Unique constraint violation.
- **500** – Server error.

---

## 5. Delete customer

**DELETE** `/customer`

Deletes one customer by `id`. ID can be sent as query parameter or in request body. Optional soft delete: set `soft=true` (query or body) to set `is_active: false` instead of hard delete.

- **Hard delete**: Removes the customer and **all related records** (addresses, utm sources, GST details, bureau scores, device details, company details, PA stamp master) via database cascade.
- **Soft delete**: Only sets `is_active: false` on the customer; related records are not changed.

### Query / body

| Parameter | Type    | Required | Description      |
|-----------|---------|----------|------------------|
| id        | number  | Yes      | Customer ID      |
| soft      | boolean | No       | If `true`, soft delete (deactivate) |

### cURL (hard delete, id in query)

```bash
curl -X DELETE "http://localhost:3000/customer?id=1"
```

### cURL (soft delete, id in query)

```bash
curl -X DELETE "http://localhost:3000/customer?id=1&soft=true"
```

### cURL (id in body)

```bash
curl -X DELETE http://localhost:3000/customer \
  -H "Content-Type: application/json" \
  -d '{"id": 1}'
```

### cURL (soft delete, id in body)

```bash
curl -X DELETE http://localhost:3000/customer \
  -H "Content-Type: application/json" \
  -d '{"id": 1, "soft": true}'
```

### Response

- **200** – Customer deleted (or deactivated if soft); body includes the (updated) customer object.
- **400** – Missing or invalid `id`.
- **404** – Customer not found.
- **500** – Server error.

---

## 6. Get bulk customers

**GET** `/customer/bulk`

Returns a list of customers with optional pagination and filters. Use **`includeRelations=true`** or **`include=<any value>`** to include all relation arrays (address, utmSources, gstDetails, etc.) for each customer.

### Query parameters

| Parameter        | Type   | Required | Description                                  |
|------------------|--------|----------|----------------------------------------------|
| skip             | number | No       | Number of records to skip (default: 0)      |
| take             | number | No       | Max records to return (default: 100, max 500) |
| is_active        | boolean| No       | Filter by `true` or `false`                 |
| ids              | string | No       | Comma-separated customer IDs (e.g. `1,2,3`) |
| includeRelations | string | No       | Set to `true` to include all relation arrays |
| include          | string | No       | If present (any value), same as includeRelations=true |

### cURL (paginated)

```bash
curl -X GET "http://localhost:3000/customer/bulk?skip=0&take=20"
```

### cURL (active only)

```bash
curl -X GET "http://localhost:3000/customer/bulk?is_active=true"
```

### cURL (by ids)

```bash
curl -X GET "http://localhost:3000/customer/bulk?ids=1,2,3"
```

### cURL (combined)

```bash
curl -X GET "http://localhost:3000/customer/bulk?skip=10&take=50&is_active=true"
```

### cURL (with relations)

```bash
curl -X GET "http://localhost:3000/customer/bulk?includeRelations=true"
```

### Response

- **200** – Array of customer objects. If `includeRelations=true` or `include` was used, each customer includes `address`, `utmSources`, `gstDetails`, `bureauScores`, `deviceDetails`, `companyDetails`, `paStampMaster` arrays.
- **500** – Server error.

---

## 7. Create bulk customers

**POST** `/customer/bulk`

Creates multiple customers in one request. Request body must be a JSON array of customer create payloads (same shape as create single). Each item may include **nested relation data** (address, gstDetails, etc.) as in Create customer.

### Request body

Array of objects; each object has the same optional fields as **Create customer** (no `id`).

### cURL

```bash
curl -X POST http://localhost:3000/customer/bulk \
  -H "Content-Type: application/json" \
  -d '[
    {
      "fname": "Alice",
      "lname": "Smith",
      "email": "alice@example.com",
      "phone": "+919876543212"
    },
    {
      "fname": "Bob",
      "lname": "Smith",
      "email": "bob@example.com",
      "phone": "+919876543213"
    }
  ]'
```

### Example payload

```json
[
  {
    "fname": "Alice",
    "lname": "Smith",
    "email": "alice@example.com",
    "phone": "+919876543212",
    "marital_status": "SINGLE"
  },
  {
    "fname": "Bob",
    "lname": "Smith",
    "email": "bob@example.com",
    "phone": "+919876543213"
  }
]
```

### Response

- **201** – `{ count, customers }` with created customer objects.
- **400** – Body is not an array.
- **409** – Unique constraint violation on one or more items.
- **500** – Server error.

---

## 8. Update bulk customers

**PUT** `/customer/bulk`

Updates multiple customers. Request body must be a JSON array of objects; each object must include `id` and any fields to update. Nested relation **arrays** (e.g. `address: [ { ... } ]`) are supported in each item to create new related rows.

### Request body

Array of objects:

| Field | Type   | Required | Description        |
|-------|--------|----------|--------------------|
| id    | number | Yes      | Customer ID        |
| ...   | *      | No       | Any customer fields to update |

### cURL

```bash
curl -X PUT http://localhost:3000/customer/bulk \
  -H "Content-Type: application/json" \
  -d '[
    {"id": 1, "income": 550000},
    {"id": 2, "email": "bob.updated@example.com", "lname": "Brown"}
  ]'
```

### Example payload

```json
[
  { "id": 1, "income": 550000, "marital_status": "MARRIED" },
  { "id": 2, "email": "bob.updated@example.com", "lname": "Brown" }
]
```

### Response

- **200** – `{ count, customers }` with updated customer objects.
- **400** – Body is not an array or an item has missing/invalid `id`.
- **404** – One or more customers not found.
- **409** – Unique constraint violation.
- **500** – Server error.

---

## 9. Delete bulk customers

**DELETE** `/customer/bulk`

Deletes multiple customers by ID. Request body must include `ids` (array of numbers). Optional `soft: true` to deactivate instead of hard delete. **Hard delete** removes each customer and all related records (cascade). **Soft delete** only sets `is_active: false` on the customers.

### Request body

| Field | Type     | Required | Description                |
|-------|----------|----------|----------------------------|
| ids   | number[] | Yes      | Customer IDs to delete    |
| soft  | boolean  | No       | If `true`, soft delete    |

### cURL (hard delete)

```bash
curl -X DELETE http://localhost:3000/customer/bulk \
  -H "Content-Type: application/json" \
  -d '{"ids": [1, 2, 3]}'
```

### cURL (soft delete)

```bash
curl -X DELETE http://localhost:3000/customer/bulk \
  -H "Content-Type: application/json" \
  -d '{"ids": [1, 2, 3], "soft": true}'
```

### Example payload (hard delete)

```json
{
  "ids": [1, 2, 3]
}
```

### Example payload (soft delete)

```json
{
  "ids": [1, 2, 3],
  "soft": true
}
```

### Response

- **200** – `{ count }` number of customers deleted (or deactivated).
- **400** – Missing or invalid `ids` array.
- **500** – Server error.

---

## Summary table

| Method | Path           | Description        |
|--------|----------------|--------------------|
| POST   | `/customer`    | Create one customer |
| PUT    | `/customer/upsert` | Create or update one customer (by email or phone) |
| GET    | `/customer`    | Get one by id / email / phone |
| PUT    | `/customer`    | Update one customer |
| DELETE | `/customer`    | Delete one (optional soft) |
| GET    | `/customer/bulk` | List customers (pagination/filters) |
| POST   | `/customer/bulk` | Create multiple customers |
| PUT    | `/customer/bulk` | Update multiple customers |
| DELETE | `/customer/bulk` | Delete multiple (optional soft) |

---

## Customer model reference (schema)

Fields used in API payloads (from `schema.prisma`):

- **id** (read-only on create) – number, auto-increment  
- **fname**, **lname** – string, optional  
- **email**, **phone**, **alternate_phone** – string, optional, unique  
- **pan**, **aadhaar** – string, optional, unique  
- **gender** – string, optional  
- **dob** – date (ISO string), optional  
- **employment_type**, **income** – number, optional  
- **marital_status** – `SINGLE` | `MARRIED` | `DIVORCED` | `WIDOWED`, optional  
- **is_active** – boolean, default `true`  
- **createdAt**, **updatedAt** – set by server  

Related models (included when `includeRelations=true`): **address**, **utmSources**, **gstDetails**, **bureauScores**, **deviceDetails**, **companyDetails**, **paStampMaster**. Schema uses `onDelete: Cascade` from these to Customer, so hard-deleting a customer removes all related rows.

Replace `http://localhost:3000` with your actual base URL (and add `/api` or other prefix if your app mounts the customer router under a base path).
