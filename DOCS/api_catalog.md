# TraceIntel AG-1 — Complete API Catalog

## Summary: 42 REST API Endpoints across 13 Controllers

---

## 1. Authentication (2 APIs)
| # | Method | Endpoint | Description | Auth Required |
|---|--------|----------|-------------|---------------|
| 1 | `POST` | `/api/auth/login` | Login → returns JWT token, role, name | ❌ No |
| 2 | `POST` | `/api/auth/register` | Register new user (admin only in prod) | ✅ ADMIN |

**Request/Response Example:**
```json
// POST /api/auth/login
Request:  { "username": "operator1", "password": "pass123" }
Response: { "token": "eyJhbG...", "role": "OPERATOR", "fullName": "Rajesh Kumar", "expiresIn": 86400000 }
```

---

## 2. Dashboard (3 APIs)
| # | Method | Endpoint | Description | Roles |
|---|--------|----------|-------------|-------|
| 3 | `GET` | `/api/dashboard/stats` | KPI counters (total batches, scans today, blocks, holds) | ALL |
| 4 | `GET` | `/api/dashboard/scan-activity` | Scan counts by day (last 7 days) for chart | ALL |
| 5 | `GET` | `/api/dashboard/recent-scans` | Latest 20 scan events (live table) | ALL |

---

## 3. Scan & Validation — ⭐ Core Feature (4 APIs)
| # | Method | Endpoint | Description | Roles |
|---|--------|----------|-------------|-------|
| 6 | `POST` | `/api/scan/validate` | **THE CORE API** — validates a part scan | OPERATOR, SUPERVISOR, ADMIN |
| 7 | `POST` | `/api/scan/material-lot` | Record material lot scan at batch start | OPERATOR, SUPERVISOR, ADMIN |
| 8 | `GET` | `/api/scan/events` | List scan events with filters | OPERATOR, SUPERVISOR, ADMIN |
| 9 | `GET` | `/api/scan/events/{id}` | Get single scan event detail | OPERATOR, SUPERVISOR, ADMIN |

**Core Scan Validation Flow (API #6):**
```json
// POST /api/scan/validate
Request: {
  "serialInput": "MTH-DH-001-00042",
  "batchId": 3,
  "station": "Assembly-A1",
  "manualEntry": false,
  "approvedBy": null         // required if manualEntry=true
}

// ✅ ACCEPTED Response:
{
  "result": "ACCEPTED",
  "serial": "MTH-DH-001-00042",
  "partName": "Door Handle Assembly",
  "batchNumber": "B-2026-003",
  "message": "Part validated successfully",
  "scanEventId": 156,
  "timestamp": "2026-10-27T22:30:00"
}

// ❌ BLOCKED Response (wrong part):
{
  "result": "BLOCKED",
  "serial": "MTH-WH-002-00015",
  "partName": "Wiring Harness",
  "batchNumber": "B-2026-003",
  "reason": "WRONG_PART",
  "message": "Part 'Wiring Harness' is not in BOM for batch B-2026-003 (expected: Door Handle Assembly)",
  "scanEventId": 157,
  "timestamp": "2026-10-27T22:30:05"
}

// ❌ BLOCKED Response (lot on hold):
{
  "result": "BLOCKED",
  "reason": "LOT_ON_HOLD",
  "message": "Material lot LOT-STL-2026-003 is ON HOLD — cannot use"
}

// ❌ BLOCKED Response (duplicate serial):
{
  "result": "BLOCKED",
  "reason": "DUPLICATE_SERIAL",
  "message": "Serial MTH-DH-001-00042 already scanned in batch B-2026-003"
}
```

---

## 4. Trace — ⭐ Core Feature (3 APIs)
| # | Method | Endpoint | Description | Roles |
|---|--------|----------|-------------|-------|
| 10 | `POST` | `/api/trace/forward` | **Forward trace**: lot → batches → shipments → customers → VINs | QUALITY_ENGINEER, MANAGER, SUPERVISOR, ADMIN |
| 11 | `POST` | `/api/trace/backward` | **Backward trace**: VIN/serial → batch → lot → supplier | QUALITY_ENGINEER, MANAGER, SUPERVISOR, ADMIN |
| 12 | `GET` | `/api/trace/history` | List past trace runs with timing | QUALITY_ENGINEER, MANAGER, ADMIN |

**Forward Trace Flow (API #10):**
```json
// POST /api/trace/forward
Request: { "lotId": 5 }

Response: {
  "lotNumber": "LOT-STL-2026-005",
  "supplier": "Tata Steel Ltd",
  "status": "ON_HOLD",
  "traceTimeMs": 47,
  "affectedBatches": [
    { "batchNumber": "B-2026-003", "partName": "Door Handle Assembly", "quantity": 500, "shipped": true },
    { "batchNumber": "B-2026-007", "partName": "Door Handle Assembly", "quantity": 300, "shipped": false }
  ],
  "affectedShipments": [
    { "shipmentNumber": "SH-2026-001", "customer": "Maruti Suzuki India", "date": "2026-10-20" }
  ],
  "affectedCustomers": [
    { "code": "MARUTI", "name": "Maruti Suzuki India Ltd" }
  ],
  "affectedVINs": [
    "MA3FJEB1S00123456", "MA3FJEB1S00123457", "MA3FJEB1S00123458"
  ],
  "inFactoryBatches": [
    { "batchNumber": "B-2026-007", "quantity": 300, "status": "Not yet shipped" }
  ],
  "estimates": {
    "totalAffectedParts": 800,
    "estimatedVehicles": 800,
    "estimatedLoss": {
      "partsCost": 240000.00,
      "scrapCost": 40000.00,
      "reworkCost": 24000.00,
      "totalLoss": 304000.00
    },
    "note": "Estimates based on available data. Not certain predictions."
  }
}
```

**Backward Trace Flow (API #11):**
```json
// POST /api/trace/backward
Request: { "searchValue": "MA3FJEB1S00123456", "searchType": "VIN" }  // or "SERIAL"

Response: {
  "searchValue": "MA3FJEB1S00123456",
  "traceTimeMs": 23,
  "chain": {
    "vin": "MA3FJEB1S00123456",
    "customer": "Maruti Suzuki India Ltd",
    "serial": "MTH-DH-001-00042",
    "batch": { "number": "B-2026-003", "part": "Door Handle Assembly", "date": "2026-10-15" },
    "lots": [
      { "lotNumber": "LOT-STL-2026-005", "supplier": "Tata Steel Ltd", "status": "ON_HOLD" }
    ]
  }
}
```

---

## 5. Quality Hold — ⭐ Core Feature (4 APIs)
| # | Method | Endpoint | Description | Roles |
|---|--------|----------|-------------|-------|
| 13 | `POST` | `/api/holds/request` | Request a lot hold (step 1 of 2-person approval) | QUALITY_ENGINEER, SUPERVISOR, ADMIN |
| 14 | `PUT` | `/api/holds/{id}/approve` | Approve/reject hold (step 2 — MUST be different person) | QUALITY_ENGINEER, MANAGER, ADMIN |
| 15 | `GET` | `/api/holds` | List all holds with filters (status, lot) | QUALITY_ENGINEER, MANAGER, SUPERVISOR, ADMIN |
| 16 | `GET` | `/api/holds/{id}` | Get hold detail | QUALITY_ENGINEER, MANAGER, SUPERVISOR, ADMIN |

```json
// POST /api/holds/request
Request: { "lotId": 5, "reason": "Failed incoming inspection — tensile strength below spec" }
Response: { "id": 1, "lotNumber": "LOT-STL-2026-005", "status": "REQUESTED", "requestedBy": "Priya Sharma" }

// PUT /api/holds/1/approve  (by a DIFFERENT user)
Request: { "approved": true, "notes": "Confirmed. Quarantine lot immediately." }
Response: { "id": 1, "status": "APPROVED", "lotStatus": "ON_HOLD", "approvedBy": "Vikram Singh" }

// ❌ ERROR if same person:
{ "error": "InvalidApprovalException", "message": "Requester and approver cannot be the same person" }
```

---

## 6. Shipments (5 APIs)
| # | Method | Endpoint | Description | Roles |
|---|--------|----------|-------------|-------|
| 17 | `GET` | `/api/shipments` | List all shipments | OPERATOR, SUPERVISOR, ADMIN |
| 18 | `GET` | `/api/shipments/{id}` | Get shipment with items | OPERATOR, SUPERVISOR, ADMIN |
| 19 | `POST` | `/api/shipments` | Create new shipment | SUPERVISOR, ADMIN |
| 20 | `POST` | `/api/shipments/{id}/items` | Add batch to shipment (scan at dispatch) | OPERATOR, SUPERVISOR, ADMIN |
| 21 | `PUT` | `/api/shipments/{id}` | Update shipment details | SUPERVISOR, ADMIN |

---

## 7. VIN Data Import (2 APIs)
| # | Method | Endpoint | Description | Roles |
|---|--------|----------|-------------|-------|
| 22 | `POST` | `/api/admin/vin/import` | Upload CSV file with VIN data | ADMIN |
| 23 | `GET` | `/api/admin/vin/links` | List imported VIN links | ADMIN, MANAGER |

```
CSV Format expected:
vin,batch_number,serial,customer_code
MA3FJEB1S00123456,B-2026-003,MTH-DH-001-00042,MARUTI
```

---

## 8. Admin CRUD — Parts (3 APIs)
| # | Method | Endpoint | Description | Roles |
|---|--------|----------|-------------|-------|
| 24 | `GET` | `/api/admin/parts` | List all parts (with search/pagination) | ADMIN |
| 25 | `POST` | `/api/admin/parts` | Create new part | ADMIN |
| 26 | `PUT` | `/api/admin/parts/{id}` | Update part | ADMIN |
| 27 | `DELETE` | `/api/admin/parts/{id}` | Delete part | ADMIN |

---

## 9. Admin CRUD — BOM (3 APIs)
| # | Method | Endpoint | Description | Roles |
|---|--------|----------|-------------|-------|
| 28 | `GET` | `/api/admin/bom/{partId}` | Get BOM for a part | ADMIN |
| 29 | `POST` | `/api/admin/bom` | Add BOM item | ADMIN |
| 30 | `DELETE` | `/api/admin/bom/{id}` | Remove BOM item | ADMIN |

---

## 10. Admin CRUD — Suppliers (3 APIs)
| # | Method | Endpoint | Description | Roles |
|---|--------|----------|-------------|-------|
| 31 | `GET` | `/api/admin/suppliers` | List all suppliers | ADMIN |
| 32 | `POST` | `/api/admin/suppliers` | Create supplier | ADMIN |
| 33 | `PUT` | `/api/admin/suppliers/{id}` | Update supplier | ADMIN |

---

## 11. Admin CRUD — Machines (3 APIs)
| # | Method | Endpoint | Description | Roles |
|---|--------|----------|-------------|-------|
| 34 | `GET` | `/api/admin/machines` | List all machines | ADMIN |
| 35 | `POST` | `/api/admin/machines` | Create machine | ADMIN |
| 36 | `PUT` | `/api/admin/machines/{id}` | Update machine | ADMIN |

---

## 12. Admin CRUD — Customers (3 APIs)
| # | Method | Endpoint | Description | Roles |
|---|--------|----------|-------------|-------|
| 37 | `GET` | `/api/admin/customers` | List all customers | ADMIN |
| 38 | `POST` | `/api/admin/customers` | Create customer | ADMIN |
| 39 | `PUT` | `/api/admin/customers/{id}` | Update customer | ADMIN |

---

## 13. Admin — Users & Audit (3 APIs)
| # | Method | Endpoint | Description | Roles |
|---|--------|----------|-------------|-------|
| 40 | `GET` | `/api/admin/users` | List all users | ADMIN |
| 41 | `POST` | `/api/admin/users` | Create user with role | ADMIN |
| 42 | `GET` | `/api/audit/logs` | View audit trail | ADMIN, MANAGER |

---

## API Count by Module

```
┌──────────────────────────┬───────────┐
│ Module                   │ API Count │
├──────────────────────────┼───────────┤
│ Authentication           │     2     │
│ Dashboard                │     3     │
│ Scan & Validation  ⭐    │     4     │
│ Trace              ⭐    │     3     │
│ Quality Hold       ⭐    │     4     │
│ Shipments                │     5     │
│ VIN Import               │     2     │
│ Parts CRUD               │     4     │
│ BOM CRUD                 │     3     │
│ Suppliers CRUD           │     3     │
│ Machines CRUD            │     3     │
│ Customers CRUD           │     3     │
│ Users & Audit            │     3     │
├──────────────────────────┼───────────┤
│ TOTAL                    │    42     │
└──────────────────────────┴───────────┘
```

## For Interview: Key APIs to Explain

The 3 most important APIs to demonstrate and explain in your viva:

1. **`POST /api/scan/validate`** — The scan validation engine (checks lot status, BOM match, duplicate serial)
2. **`POST /api/trace/forward`** — The trace button (joins batch_material_consumption → shipment_items → vehicle_links)
3. **`PUT /api/holds/{id}/approve`** — Two-person approval (validates requester ≠ approver)

> These 3 APIs contain 80% of the business logic and directly solve the 2 problems stated in the spec.
