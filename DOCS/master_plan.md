# 🏭 TraceIntel AG-1 — MASTER PLAN (Simple Format)

> **Ek line mein**: Factory mein galat part lagane se roko, aur jab material kharab nikle toh turant batao ki kaunse parts, customers aur gaadiyaan affect hui hain.

---

## 📌 PART 1: Project Kya Hai?

### Problem 1: Galat Part Lag Gaya (Wrong Part Used)
```
Operator ne galti se wrong part utha liya
    → Kisi ko pata nahi chala
        → Poora batch reject ho gaya
            → Company ko lakho ka nuksaan ❌
```
**Solution**: Scan karo → System turant check karega → Galat hai toh BLOCK kar dega ✅

### Problem 2: Material Kharab Nikla (Defective Lot)
```
Raw material lot defective nikla
    → Kaunse parts bane? Pata nahi
        → Kaunse customers ko gaye? Excel mein dhundho
            → 2-3 din lag gaye trace karne mein ❌
```
**Solution**: Ek button dabao → System 3 second mein bata dega: batches, customers, VINs ✅

---

## 📌 PART 2: Technology Stack (Kya Use Karenge)

```
┌─────────────────────────────────────────────────────────┐
│                    BROWSER (User)                        │
│                                                          │
│   React Frontend ─── Vite ─── Vanilla CSS ─── Framer    │
│   (Scan page, Trace page, Dashboard, Admin pages)        │
│                         │                                │
│                    REST APIs (JSON)                       │
│                         │                                │
│   Spring Boot Backend ─── Java 21 ─── Spring Security    │
│   (Business logic, JWT auth, Scan validation, Trace)     │
│                         │                                │
│                    PostgreSQL Database                    │
│   (18 tables, Flyway migrations, Indexes for speed)      │
└─────────────────────────────────────────────────────────┘
```

| Technology | Kaam Kya Hai |
|-----------|-------------|
| **React** | Frontend — jo user screen pe dekhta hai (pages, buttons, tables) |
| **Java 21** | Backend language — saari logic Java mein likhi hai |
| **Spring Boot 3.4** | Java framework — server banata hai, APIs handle karta hai |
| **Spring Security + JWT** | Login system — token deta hai, role check karta hai |
| **PostgreSQL** | Database — saara data yahan store hota hai |
| **Flyway** | Database migrations — tables automatic banti hain SQL scripts se |
| **ZXing** | QR code generate karta hai (demo ke liye) |
| **JUnit + Mockito** | Testing — code sahi kaam kar raha hai ya nahi |
| **Framer Motion** | Frontend animations — smooth transitions, fade effects |
| **html5-qrcode** | Browser se QR code scan (camera se) |

---

## 📌 PART 3: Users & Roles (Kaun Kya Kar Sakta Hai)

5 Roles hain. Har role ke alag permissions hain:

| Role | Kaun Hai | Kya Kar Sakta Hai |
|------|---------|------------------|
| **ADMIN** | IT Administrator | Sab kuch — users banao, parts banao, settings, data import |
| **OPERATOR** | Production line worker | Scan karo, shipment scan karo, dashboard dekho |
| **SUPERVISOR** | Line supervisor | Scan karo + manual entry approve karo + hold request karo |
| **QUALITY_ENGINEER** | Quality team | Trace chalao, hold request karo, hold approve karo |
| **MANAGER** | Plant manager | Trace dekho, reports dekho, audit log dekho, hold approve karo |

---

## 📌 PART 4: Database (18 Tables — Kaunsi Table Kya Store Karti Hai)

> Sochlo ek chain hai: **Supplier → Material Lot → Batch → Part (Serial) → Shipment → Customer → VIN (Gaadi)**
> Trace isi chain ko follow karta hai!

### Group 1: Users & Access (Kaun hai, kya kar sakta hai)
| # | Table | Kya Store Karta Hai | Example |
|---|-------|-------------------|---------|
| 1 | `roles` | 5 roles (Admin, Operator, etc.) | ADMIN, OPERATOR |
| 2 | `users` | Login accounts — username, password, role | operator1 / Rajesh Kumar / OPERATOR |

### Group 2: Master Data (Factory ki basic info)
| # | Table | Kya Store Karta Hai | Example |
|---|-------|-------------------|---------|
| 3 | `parts` | Part details — name, number, cost | Door Handle Assembly / MTH-DH-001 / ₹300 |
| 4 | `bom_items` | Bill of Materials — kaunsi part kis part mein lagti hai | Door Handle Assembly mein Steel Sheet + Plastic Cover lagta hai |
| 5 | `suppliers` | Supplier details | Tata Steel Ltd / SUP-001 |
| 6 | `customers` | Customer (OEM) details | Maruti Suzuki India Ltd / MARUTI |
| 7 | `machines` | Machines on production line | Injection Molding M1 / Station-A |

### Group 3: Production (Kya bana, kisse bana, kab bana)
| # | Table | Kya Store Karta Hai | Example |
|---|-------|-------------------|---------|
| 8 | `material_lots` | Raw material lot — supplier, status (OK/ON_HOLD) | LOT-STL-2026-005 / Tata Steel / OK |
| 9 | `production_batches` | Batch — kaunsi part, kis machine pe, kis operator ne | B-2026-003 / Door Handle / Machine M1 / Day shift |
| 10 | `batch_material_consumption` | **LINK**: Batch X ne kaunsa Lot use kiya | B-2026-003 ne LOT-STL-2026-005 use kiya |
| 11 | `serial_numbers` | Har part ka unique serial number | MTH-DH-001-00042 (batch B-2026-003 ka) |

### Group 4: Scan Events (Har scan ka record)
| # | Table | Kya Store Karta Hai | Example |
|---|-------|-------------------|---------|
| 12 | `scan_events` | Har scan — accepted ya blocked, reason kya | Serial MTH-DH-001-00042 / ACCEPTED / Station A1 |

### Group 5: Shipping (Kisko bheja)
| # | Table | Kya Store Karta Hai | Example |
|---|-------|-------------------|---------|
| 13 | `shipments` | Shipment — kis customer ko, kab | SH-2026-001 / Maruti Suzuki / 20-Oct-2026 |
| 14 | `shipment_items` | **LINK**: Shipment mein kaunsa batch gaya | SH-2026-001 mein B-2026-003 gaya |

### Group 6: VIN & Quality (Gaadi aur quality hold)
| # | Table | Kya Store Karta Hai | Example |
|---|-------|-------------------|---------|
| 15 | `vehicle_links` | **LINK**: VIN (gaadi) → batch/serial | VIN MA3FJEB1S00123456 → batch B-2026-003 |
| 16 | `quality_holds` | Hold request — kis lot pe, kisne manga, kisne approve kiya | LOT-005 / Priya ne manga / Vikram ne approve kiya |
| 17 | `trace_runs` | Har trace ka record — result aur kitna time laga | Lot 5 trace / 47ms / Forward |

### Bonus: Audit Log
| # | Table | Kya Store Karta Hai |
|---|-------|-------------------|
| — | `audit_logs` | Kaun ne kya kiya kab — security trail |

### 🔗 Trace Chain (Yeh samajhna SABSE important hai!)

```
           TRACE FORWARD (Lot se shuru)
           ════════════════════════════

  LOT-STL-2026-005 (Defective material lot)
         │
         ▼ (batch_material_consumption table)
  ┌──────────────────┬──────────────────┐
  │ B-2026-003       │ B-2026-007       │  ← Kaunse batches ne yeh lot use kiya?
  │ (500 pcs, shipped)│ (300 pcs, factory)│
  └──────┬───────────┴──────────────────┘
         │
         ▼ (shipment_items table)
  ┌──────────────────┐
  │ SH-2026-001      │  ← Kaunsi shipment mein gaya?
  │ Maruti Suzuki     │
  └──────┬───────────┘
         │
         ▼ (vehicle_links table)
  ┌──────────────────┐
  │ VIN: MA3FJ...456 │  ← Kaunsi gaadiyaan affected hain?
  │ VIN: MA3FJ...457 │
  │ VIN: MA3FJ...458 │
  └──────────────────┘


           TRACE BACKWARD (VIN se shuru)
           ═════════════════════════════

  VIN: MA3FJEB1S00123456 (Customer ne report kiya)
         │
         ▼ (vehicle_links table)
  Serial: MTH-DH-001-00042 → Batch: B-2026-003
         │
         ▼ (batch_material_consumption table)
  Lot: LOT-STL-2026-005 → Supplier: Tata Steel Ltd
```

---

## 📌 PART 5: All 42 APIs (Har API Kya Karti Hai)

### 🔐 Authentication (Login) — 2 APIs
| # | API | Kya Karta Hai |
|---|-----|--------------|
| 1 | `POST /api/auth/login` | Username + password do → JWT token milega |
| 2 | `POST /api/auth/register` | Naya user banao (sirf Admin) |

### 📊 Dashboard — 3 APIs
| # | API | Kya Karta Hai |
|---|-----|--------------|
| 3 | `GET /api/dashboard/stats` | Numbers dikhata hai — total batches, scans today, blocks, holds |
| 4 | `GET /api/dashboard/scan-activity` | Last 7 din ka chart data (kitne scans per day) |
| 5 | `GET /api/dashboard/recent-scans` | Latest 20 scan events (live table) |

### 🔍 Scan & Validation — 4 APIs ⭐⭐⭐
| # | API | Kya Karta Hai |
|---|-----|--------------|
| 6 | `POST /api/scan/validate` | **MAIN API** — Part scan karo, system check karega: sahi hai ya galat |
| 7 | `POST /api/scan/material-lot` | Batch start hone pe material lot scan karo (lot → batch link banta hai) |
| 8 | `GET /api/scan/events` | Saare scan events dekho (filter ke saath) |
| 9 | `GET /api/scan/events/{id}` | Ek specific scan ki detail |

**API #6 ke andar kya hota hai (Validation Logic):**
```
Step 1: Serial number dhundho database mein
Step 2: Lot status check karo → ON_HOLD hai? → ❌ BLOCKED "Lot on hold"
Step 3: Part sahi hai? BOM se match karo → Galat part? → ❌ BLOCKED "Wrong part"
Step 4: Duplicate check → Pehle se scan hua? → ❌ BLOCKED "Duplicate serial"
Step 5: Sab sahi hai? → ✅ ACCEPTED
Step 6: Scan event save karo (accepted ho ya blocked — dono save hote hain)
```

### 🔎 Trace — 3 APIs ⭐⭐⭐
| # | API | Kya Karta Hai |
|---|-----|--------------|
| 10 | `POST /api/trace/forward` | Lot select karo → **Trace button** → affected batches, customers, VINs dikhao |
| 11 | `POST /api/trace/backward` | VIN ya serial do → peeche ja ke batao ki kaunsa lot, supplier tha |
| 12 | `GET /api/trace/history` | Pichle saare trace runs dekho (kitna time laga) |

### 🛑 Quality Hold — 4 APIs ⭐⭐⭐
| # | API | Kya Karta Hai |
|---|-----|--------------|
| 13 | `POST /api/holds/request` | Hold request karo (Step 1 — ek aadmi karta hai) |
| 14 | `PUT /api/holds/{id}/approve` | Hold approve karo (Step 2 — DOOSRA aadmi karta hai, same nahi ho sakta!) |
| 15 | `GET /api/holds` | Saare holds ki list dekho |
| 16 | `GET /api/holds/{id}` | Ek hold ki detail |

### 📦 Shipments — 5 APIs
| # | API | Kya Karta Hai |
|---|-----|--------------|
| 17 | `GET /api/shipments` | Saari shipments ki list |
| 18 | `GET /api/shipments/{id}` | Ek shipment ki detail (kaunse batches gaye) |
| 19 | `POST /api/shipments` | Nayi shipment banao |
| 20 | `POST /api/shipments/{id}/items` | Batch add karo shipment mein (dispatch pe scan) |
| 21 | `PUT /api/shipments/{id}` | Shipment update karo |

### 📥 VIN Import — 2 APIs
| # | API | Kya Karta Hai |
|---|-----|--------------|
| 22 | `POST /api/admin/vin/import` | CSV file upload karo — VIN data import hota hai |
| 23 | `GET /api/admin/vin/links` | Import hui VIN links dekho |

### ⚙️ Admin CRUD — 19 APIs
| Module | APIs | Operations |
|--------|------|-----------|
| **Parts** (4) | `/api/admin/parts` | List, Create, Update, Delete |
| **BOM** (3) | `/api/admin/bom` | Get BOM for part, Add item, Remove item |
| **Suppliers** (3) | `/api/admin/suppliers` | List, Create, Update |
| **Machines** (3) | `/api/admin/machines` | List, Create, Update |
| **Customers** (3) | `/api/admin/customers` | List, Create, Update |
| **Users** (2) | `/api/admin/users` | List, Create |
| **Audit** (1) | `/api/audit/logs` | View audit trail |

---

## 📌 PART 6: Frontend Pages (User Kya Dekhega)

### Design Style: Premium Dark Theme (Motionsite.ai inspired)
- **Dark background** (almost black) with glass cards
- **Teal + purple glow** effects on hover
- **Smooth animations** — elements fade up when scrolling
- **Animated numbers** — dashboard counters count up

### All Pages:

| # | Page | URL | Kya Dikhta Hai |
|---|------|-----|---------------|
| 1 | **Login** | `/login` | Username + password form → JWT token milta hai |
| 2 | **Dashboard** | `/dashboard` | 4 KPI cards (batches, scans, blocks, holds) + charts + recent scans table |
| 3 | **Scan Station** | `/scan` | ⭐ Text input ya camera se scan → ACCEPTED (green glow) ya BLOCKED (red shake) |
| 4 | **Trace** | `/trace` | ⭐ Lot select → Trace button → affected batches/customers/VINs + time |
| 5 | **Backward Trace** | `/trace/backward` | VIN ya serial enter karo → chain dikhao (VIN → batch → lot → supplier) |
| 6 | **Hold Management** | `/holds` | ⭐ Hold request karo + pending approvals list + approve/reject |
| 7 | **Shipments** | `/shipments` | Shipment list + create + add batches |
| 8 | **Parts Manager** | `/admin/parts` | Parts CRUD table |
| 9 | **BOM Manager** | `/admin/bom` | BOM tree view |
| 10 | **Suppliers** | `/admin/suppliers` | Suppliers CRUD table |
| 11 | **Machines** | `/admin/machines` | Machines CRUD table |
| 12 | **Customers** | `/admin/customers` | Customers CRUD table |
| 13 | **Users** | `/admin/users` | Users CRUD table with role assignment |
| 14 | **VIN Import** | `/admin/vin-import` | CSV file upload + preview + confirm |
| 15 | **Audit Log** | `/audit` | Who did what when — readonly table |

---

## 📌 PART 7: Data Strategy (80% Real + 20% Demo)

### Real Data (80%) — Verified Motherson Context

| Category | Real Data | Source |
|----------|-----------|--------|
| **Customers** | Maruti Suzuki India, Tata Motors, Hyundai Motor India, Mahindra & Mahindra, Toyota Kirloskar | Real Motherson customers |
| **Parts** | Door Handle Assembly, Wiring Harness, Bumper Guard, Rearview Mirror Housing, Instrument Panel Trim, Seat Adjustment Mechanism | Real Motherson product lines |
| **Suppliers** | Tata Steel Ltd, SABIC Polymers, Bharat Electronics, Sundram Fasteners, Apollo Tyres | Real tier-2 supplier patterns |
| **Machines** | Injection Molding Machine, CNC Lathe, Hydraulic Press, Assembly Station, Quality Inspection | Real factory equipment |
| **VINs** | MA3 (Maruti WMI), MAT (Tata WMI), MAL (Hyundai WMI) — real WMI codes | Real Indian manufacturer codes |
| **Part Numbers** | MTH-DH-001, MTH-WH-002 format (MTH = Motherson) | Industry standard format |

### Demo Data (20%) — For Demo Flow
| What | Why |
|------|-----|
| 1 lot with ON_HOLD status | Demo the hold/trace flow |
| Pre-created scan events (mix of ACCEPTED + BLOCKED) | Show dashboard charts |
| 1 pending hold request | Demo the 2-person approval |
| Pre-linked VINs to batches | Demo the trace result |

---

## 📌 PART 8: Build Phases (Step by Step Kaise Banega)

### Phase 1: Backend Foundation 🔧
```
Step 1A: Project setup         → pom.xml, application.yml, main class           ✅ DONE
Step 1B: Database schema       → V1__init_schema.sql (18 tables)                 ✅ DONE  
Step 1C: Entities + Repos      → 18 entity classes + 17 repositories             🔄 IN PROGRESS
Step 1D: Security              → JWT filter, token provider, SecurityConfig
Step 1E: Exceptions            → 8 custom exceptions + global handler
Step 1F: DTOs                  → Request/Response classes for each API
Step 1G: Services              → ScanService, TraceService, HoldService (CORE LOGIC)
Step 1H: Controllers           → 13 REST controllers (42 endpoints)
```
**Files: ~65 Java files**

### Phase 2: Frontend 🎨
```
Step 2A: React setup           → Vite init, npm packages, design system (CSS)
Step 2B: Auth + Layout         → Login page, Sidebar, TopBar, ProtectedRoute
Step 2C: Dashboard             → KPI cards, charts, recent scans table
Step 2D: Scan Station          → Text input + camera scan + result animation
Step 2E: Trace Page            → Lot dropdown + Trace button + result tables
Step 2F: Hold Management       → Request form + approval list
Step 2G: Admin pages           → CRUD tables for Parts, BOM, Suppliers, etc.
Step 2H: VIN Import            → CSV upload + preview
```
**Files: ~35 JSX/CSS files**

### Phase 3: Demo Data 📊
```
Step 3A: Seed SQL              → V2__seed_demo_data.sql (realistic data)
Step 3B: QR utility            → QR code generation endpoint
Step 3C: CSV import            → VIN import from CSV file
```

### Phase 4: Testing 🧪
```
Step 4A: ScanServiceTest       → Wrong part blocked, duplicate rejected, lot on hold blocked
Step 4B: HoldServiceTest       → Same person can't approve, different person can
Step 4C: TraceServiceTest      → Forward trace returns correct chain
Step 4D: EstimateServiceTest   → Vehicle and loss calculations correct
```
**Files: ~5 test classes**

### Phase 5: Verification ✅
```
Step 5A: Build + run backend
Step 5B: Build + run frontend
Step 5C: Full demo walkthrough (3-4 minutes)
```

---

## 📌 PART 9: Java Project Structure (Har File Kahan Hai)

```
backend/
├── pom.xml                                          ← Maven config (dependencies)
└── src/
    ├── main/
    │   ├── java/com/traceintel/
    │   │   ├── TraceIntelApplication.java            ← Main class (server start)
    │   │   │
    │   │   ├── config/                               ← Configuration
    │   │   │   ├── SecurityConfig.java               ← Spring Security rules
    │   │   │   ├── JwtTokenProvider.java              ← JWT token generate/validate
    │   │   │   ├── JwtAuthenticationFilter.java       ← Har request pe token check
    │   │   │   ├── CustomUserDetailsService.java      ← User load from DB
    │   │   │   └── CorsConfig.java                    ← Frontend se connect allow
    │   │   │
    │   │   ├── entity/                               ← Database tables = Java classes
    │   │   │   ├── BaseEntity.java                   ← Abstract (id, createdAt, updatedAt)
    │   │   │   ├── Role.java                         
    │   │   │   ├── User.java                         
    │   │   │   ├── Part.java                         
    │   │   │   ├── BomItem.java                      
    │   │   │   ├── Supplier.java                     
    │   │   │   ├── Customer.java                     
    │   │   │   ├── Machine.java                      
    │   │   │   ├── MaterialLot.java                  
    │   │   │   ├── ProductionBatch.java              
    │   │   │   ├── BatchMaterialConsumption.java     
    │   │   │   ├── SerialNumber.java                 
    │   │   │   ├── ScanEvent.java                    
    │   │   │   ├── Shipment.java                     
    │   │   │   ├── ShipmentItem.java                 
    │   │   │   ├── VehicleLink.java                  
    │   │   │   ├── QualityHold.java                  
    │   │   │   ├── TraceRun.java                     
    │   │   │   └── AuditLog.java                     
    │   │   │
    │   │   ├── enums/                                ← Fixed value lists
    │   │   │   ├── RoleType.java                     ← ADMIN, OPERATOR, etc.
    │   │   │   ├── LotStatus.java                    ← OK, ON_HOLD, REJECTED
    │   │   │   ├── ScanResult.java                   ← ACCEPTED, BLOCKED
    │   │   │   ├── HoldStatus.java                   ← REQUESTED, APPROVED, REJECTED
    │   │   │   └── ShiftType.java                    ← DAY, NIGHT, GENERAL
    │   │   │
    │   │   ├── repository/                           ← Database queries (1 per entity)
    │   │   │   ├── RoleRepository.java
    │   │   │   ├── UserRepository.java
    │   │   │   ├── PartRepository.java
    │   │   │   ├── ... (17 total)
    │   │   │
    │   │   ├── dto/                                  ← Request/Response formats
    │   │   │   ├── request/
    │   │   │   │   ├── LoginRequest.java
    │   │   │   │   ├── ScanRequest.java
    │   │   │   │   ├── TraceRequest.java
    │   │   │   │   ├── HoldRequest.java
    │   │   │   │   ├── HoldApprovalRequest.java
    │   │   │   │   └── ... (more)
    │   │   │   └── response/
    │   │   │       ├── LoginResponse.java
    │   │   │       ├── ScanResponse.java
    │   │   │       ├── TraceResponse.java
    │   │   │       ├── DashboardStatsResponse.java
    │   │   │       └── ... (more)
    │   │   │
    │   │   ├── exception/                            ← Custom errors
    │   │   │   ├── GlobalExceptionHandler.java        ← Sab errors ek jagah handle
    │   │   │   ├── PartNotFoundException.java
    │   │   │   ├── LotNotFoundException.java
    │   │   │   ├── BatchNotFoundException.java
    │   │   │   ├── CustomerNotFoundException.java
    │   │   │   ├── WrongPartException.java            ← Part BOM mein nahi hai
    │   │   │   ├── DuplicateSerialException.java      ← Serial pehle scan ho chuka
    │   │   │   ├── LotOnHoldException.java            ← Lot ON_HOLD hai
    │   │   │   └── InvalidApprovalException.java      ← Same person approve nahi kar sakta
    │   │   │
    │   │   ├── service/                              ← Business logic (INTERFACES)
    │   │   │   ├── ScanService.java                   ← Scan validation interface
    │   │   │   ├── TraceService.java                  ← Trace forward/backward interface
    │   │   │   ├── HoldService.java                   ← Hold request/approve interface
    │   │   │   ├── DashboardService.java
    │   │   │   ├── ShipmentService.java
    │   │   │   ├── VinImportService.java
    │   │   │   ├── AuditService.java
    │   │   │   └── impl/                              ← IMPLEMENTATIONS
    │   │   │       ├── ScanServiceImpl.java           ← ⭐ Core scan logic
    │   │   │       ├── TraceServiceImpl.java          ← ⭐ Core trace logic
    │   │   │       ├── HoldServiceImpl.java           ← ⭐ Core hold logic
    │   │   │       └── ... (more)
    │   │   │
    │   │   ├── controller/                           ← REST API endpoints
    │   │   │   ├── AuthController.java                ← /api/auth/*
    │   │   │   ├── DashboardController.java           ← /api/dashboard/*
    │   │   │   ├── ScanController.java                ← /api/scan/*  ⭐
    │   │   │   ├── TraceController.java               ← /api/trace/* ⭐
    │   │   │   ├── HoldController.java                ← /api/holds/* ⭐
    │   │   │   ├── ShipmentController.java            ← /api/shipments/*
    │   │   │   ├── PartController.java                ← /api/admin/parts
    │   │   │   ├── BomController.java                 ← /api/admin/bom
    │   │   │   ├── SupplierController.java            ← /api/admin/suppliers
    │   │   │   ├── MachineController.java             ← /api/admin/machines
    │   │   │   ├── CustomerController.java            ← /api/admin/customers
    │   │   │   ├── UserController.java                ← /api/admin/users
    │   │   │   └── VinImportController.java           ← /api/admin/vin/*
    │   │   │
    │   │   └── util/                                 ← Helper classes
    │   │       └── QRCodeUtil.java                    ← QR code generation (ZXing)
    │   │
    │   └── resources/
    │       ├── application.yml                        ← Server config (DB, JWT, CORS)
    │       └── db/migration/
    │           ├── V1__init_schema.sql                ← 18 tables create
    │           └── V2__seed_demo_data.sql             ← Demo data insert
    │
    └── test/java/com/traceintel/
        ├── service/
        │   ├── ScanServiceTest.java                   ← Scan tests
        │   ├── TraceServiceTest.java                  ← Trace tests
        │   ├── HoldServiceTest.java                   ← Hold approval tests
        │   └── EstimateServiceTest.java               ← Loss calculation tests
```

---

## 📌 PART 10: Frontend Structure

```
frontend/
├── package.json
├── vite.config.js
├── index.html
└── src/
    ├── main.jsx                    ← App start
    ├── App.jsx                     ← Routes define
    ├── index.css                   ← 🎨 Design system (dark theme, colors, glow effects)
    │
    ├── api/
    │   ├── axios.js                ← API client setup (base URL, JWT header)
    │   ├── authApi.js              ← Login/register API calls
    │   ├── scanApi.js              ← Scan validation API calls
    │   ├── traceApi.js             ← Trace API calls
    │   ├── holdApi.js              ← Hold API calls
    │   ├── dashboardApi.js         ← Dashboard stats API calls
    │   └── adminApi.js             ← All admin CRUD API calls
    │
    ├── auth/
    │   ├── AuthContext.jsx          ← Login state store (token, role, user)
    │   ├── ProtectedRoute.jsx       ← Page guard (redirect if not logged in)
    │   └── LoginPage.jsx            ← Login form (dark themed)
    │
    ├── components/                  ← Reusable UI pieces
    │   ├── Sidebar.jsx              ← Left navigation menu
    │   ├── TopBar.jsx               ← Top header with user info
    │   ├── Layout.jsx               ← Sidebar + TopBar wrapper
    │   ├── Card.jsx                 ← Glassmorphic card component
    │   ├── DataTable.jsx            ← Animated table component
    │   ├── Modal.jsx                ← Popup dialog
    │   ├── StatusBadge.jsx          ← OK / ON_HOLD / BLOCKED colored badge
    │   ├── AnimatedCounter.jsx      ← Numbers that count up (dashboard)
    │   └── QRScanner.jsx            ← Camera QR scan (html5-qrcode)
    │
    └── pages/
        ├── Dashboard.jsx            ← KPI cards + charts + recent scans
        ├── ScanStation.jsx          ← ⭐ Scan page (text input + camera + result)
        ├── TracePage.jsx            ← ⭐ Forward trace (lot → everything affected)
        ├── BackwardTracePage.jsx    ← Backward trace (VIN → lot)
        ├── HoldManagement.jsx       ← ⭐ Hold request + approve list
        ├── ShipmentPage.jsx         ← Shipment management
        ├── AuditLog.jsx             ← Audit trail viewer
        └── admin/
            ├── PartsManager.jsx     ← Parts CRUD
            ├── BOMManager.jsx       ← BOM tree/list
            ├── SuppliersManager.jsx ← Suppliers CRUD
            ├── MachinesManager.jsx  ← Machines CRUD
            ├── CustomersManager.jsx ← Customers CRUD
            ├── UsersManager.jsx     ← Users + role assignment
            └── VINImport.jsx        ← CSV upload + preview
```

---

## 📌 PART 11: Unit Tests (Kya Test Karenge)

| Test | Kya Check Karta Hai | Expected Result |
|------|-------------------|-----------------|
| Wrong part scan | Galat part scan karo jo BOM mein nahi hai | ❌ BLOCKED + reason "Wrong part" |
| Duplicate serial | Same serial dubara scan karo | ❌ BLOCKED + reason "Duplicate" |
| Lot on hold scan | ON_HOLD lot se part scan karo | ❌ BLOCKED + reason "Lot on hold" |
| Valid scan | Sahi part, sahi lot, pehli baar scan | ✅ ACCEPTED |
| Same person approval | Ek hi aadmi request + approve kare | ❌ InvalidApprovalException |
| Different person approval | Alag aadmi approve kare | ✅ Hold approved, lot → ON_HOLD |
| Forward trace | Lot 5 trace karo | ✅ Correct batches, customers, VINs return |
| Backward trace | VIN se trace karo | ✅ Correct batch, lot, supplier return |
| Vehicle estimate | VIN data nahi hai, estimate karo | ✅ affected_parts ÷ parts_per_vehicle |
| Loss estimate | Loss calculate karo | ✅ (parts × cost) + scrap + rework |

---

## 📌 PART 12: Demo Script (Interview mein 3-4 minute)

```
STEP 1: Login as Operator                                     [30 sec]
   → Dashboard dikhao — animated counters, charts
   → "Yeh real-time production data hai"

STEP 2: Scan a WRONG part                                     [45 sec]
   → Scan Station page pe jao
   → Wrong serial type karo
   → Screen pe RED BLOCKED dikhega with reason
   → "System ne turant block kar diya — production line pe galat part nahi lagega"

STEP 3: Put a Lot ON HOLD (2-person approval)                 [60 sec]
   → Login as Quality Engineer (Priya)
   → Hold request karo on Lot LOT-STL-2026-005
   → Reason: "Failed tensile strength test"
   → Logout → Login as Manager (Vikram)
   → Approve the hold
   → "Dekho — do alag logon ne approve kiya, IATF 16949 compliance"

STEP 4: Run TRACE                                             [60 sec]
   → Trace page pe jao
   → Select defective lot → Click TRACE button
   → Animated loading → Results appear:
     - 2 batches affected (1 shipped, 1 still in factory)
     - 1 shipment to Maruti Suzuki
     - 3 VINs affected
     - "Trace completed in 47ms"
   → "Excel mein 2-3 din lagta, system ne 47ms mein kar diya"

STEP 5: Show trace time measurement                            [15 sec]
   → Trace history → "Har trace ka time save hota hai"
   → "Yeh measured hai, claimed nahi"
```

---

## 📌 PART 13: File Count Summary

| Category | Count |
|----------|-------|
| Java Entity classes | 18 |
| Java Enum classes | 5 |
| Java Repository interfaces | 17 |
| Java DTO classes | ~15 |
| Java Exception classes | 9 |
| Java Service interfaces | 7 |
| Java Service implementations | 7 |
| Java Controllers | 13 |
| Java Config classes | 5 |
| Java Util classes | 1 |
| Java Test classes | 4 |
| SQL Migration files | 2 |
| YAML config | 1 |
| **Backend Total** | **~104 files** |
| React pages | 15 |
| React components | 9 |
| React API modules | 7 |
| React auth files | 3 |
| CSS + config | 4 |
| **Frontend Total** | **~38 files** |
| **PROJECT TOTAL** | **~142 files** |

---

> [!TIP]
> **Interview Tip**: Interviewer 3 cheezein zaroor puchega:
> 1. **Trace kaise kaam karta hai?** → "Database mein linked records hain jo scans se bante hain. Trace bas un links ko follow karta hai — batch_material_consumption → shipment_items → vehicle_links"
> 2. **Wrong part kaise rokta hai?** → "Har scan pe BOM check hota hai. Agar part BOM mein nahi hai toh BLOCKED"
> 3. **Two-person approval kyun?** → "IATF 16949 compliance — ek aadmi galti se ya pressure mein hold hata sakta hai, isliye 2 logon ki zaroorat hai"
