# 📊 TraceIntel AG-1 — Data Plan

## Strategy: 80% Real-World + 20% Demo-Specific

```
Total Seed Data
├── 80% Real-World Data
│   ├── Real Indian OEM customer names
│   ├── Real Motherson product lines
│   ├── Real tier-2 supplier names
│   ├── Real factory equipment types
│   ├── Real WMI codes for VINs
│   └── Industry-standard part/lot/batch numbering
│
└── 20% Demo-Specific Data
    ├── 1 defective lot (ON_HOLD) for trace demo
    ├── 1 pending hold request for approval demo
    ├── Pre-linked VINs to batches
    ├── Mix of ACCEPTED + BLOCKED scan events
    └── Pre-created shipments to show trace chain
```

---

## Real Data: Customers (OEMs) — 6

| # | Code | Name | City | Why Real |
|---|------|------|------|----------|
| 1 | MARUTI | Maruti Suzuki India Ltd | Gurugram, Haryana | Motherson's largest customer |
| 2 | TATA | Tata Motors Ltd | Pune, Maharashtra | Major Indian OEM |
| 3 | HYUNDAI | Hyundai Motor India Ltd | Sriperumbudur, Tamil Nadu | Top 3 OEM in India |
| 4 | MAHINDRA | Mahindra & Mahindra Ltd | Mumbai, Maharashtra | SUV segment leader |
| 5 | TOYOTA | Toyota Kirloskar Motor | Bidadi, Karnataka | Japanese OEM, India ops |
| 6 | KIA | Kia India Pvt Ltd | Anantapur, Andhra Pradesh | Growing OEM |

---

## Real Data: Parts (Motherson Product Lines) — 8

| # | Part Number | Name | Cost | Parts/Vehicle | Category |
|---|------------|------|------|---------------|----------|
| 1 | MTH-DH-001 | Door Handle Assembly | ₹300 | 4 | Exterior |
| 2 | MTH-WH-002 | Wiring Harness Module | ₹850 | 1 | Electrical |
| 3 | MTH-BG-003 | Bumper Guard Front | ₹450 | 1 | Exterior |
| 4 | MTH-RM-004 | Rearview Mirror Housing | ₹620 | 2 | Exterior |
| 5 | MTH-IP-005 | Instrument Panel Trim | ₹1200 | 1 | Interior |
| 6 | MTH-SA-006 | Seat Adjustment Mechanism | ₹780 | 4 | Interior |
| 7 | MTH-HL-007 | Headlamp Assembly | ₹950 | 2 | Lighting |
| 8 | MTH-FW-008 | Fender Wheel Arch | ₹380 | 4 | Exterior |

### BOM (Bill of Materials) — Example for Door Handle Assembly

```
MTH-DH-001: Door Handle Assembly
├── RAW-STL-001: Steel Sheet (qty: 2)
├── RAW-PLY-001: ABS Polymer Granules (qty: 0.5 kg)
├── RAW-SPR-001: Spring Mechanism (qty: 1)
└── RAW-SCR-001: Mounting Screws (qty: 6)

MTH-WH-002: Wiring Harness Module
├── RAW-COP-001: Copper Wire Bundle (qty: 3 meters)
├── RAW-CON-001: Electrical Connectors (qty: 12)
└── RAW-INS-001: PVC Insulation Sleeve (qty: 3 meters)
```

---

## Real Data: Suppliers (Tier-2) — 5

| # | Code | Name | Material | City |
|---|------|------|----------|------|
| 1 | SUP-TSL | Tata Steel Ltd | Steel sheets, bars | Mumbai |
| 2 | SUP-SAB | SABIC Polymers India | ABS, PP, PE polymers | Bengaluru |
| 3 | SUP-BEL | Bharat Electronics Ltd | Connectors, switches | Bengaluru |
| 4 | SUP-SUN | Sundram Fasteners Ltd | Screws, bolts, fasteners | Chennai |
| 5 | SUP-HAV | Havells India Ltd | Copper wire, cables | Noida |

---

## Real Data: Machines — 6

| # | Code | Name | Station | Type |
|---|------|------|---------|------|
| 1 | IM-001 | Injection Molding Machine 1 | Station-A | Molding |
| 2 | IM-002 | Injection Molding Machine 2 | Station-A | Molding |
| 3 | CNC-001 | CNC Lathe Machine | Station-B | Machining |
| 4 | HP-001 | Hydraulic Press 200T | Station-C | Pressing |
| 5 | ASM-001 | Assembly Station 1 | Station-D | Assembly |
| 6 | QI-001 | Quality Inspection Station | Station-E | Inspection |

---

## Real Data: Users — 6

| # | Username | Full Name | Role | Purpose |
|---|----------|-----------|------|---------|
| 1 | admin | Amit Verma | ADMIN | System setup, data management |
| 2 | operator1 | Rajesh Kumar | OPERATOR | Production line scan |
| 3 | operator2 | Suresh Yadav | OPERATOR | Second shift scan |
| 4 | supervisor1 | Deepak Chauhan | SUPERVISOR | Line supervision, manual entry approve |
| 5 | priya | Priya Sharma | QUALITY_ENGINEER | QE — hold request, trace |
| 6 | vikram | Vikram Singh | MANAGER | Manager — hold approve, reports |

**Passwords**: All passwords are `pass123` (BCrypt hashed in DB)

---

## Real Data: VINs — Using Real WMI Codes

| WMI Code | Manufacturer | Example VINs |
|----------|-------------|-------------|
| MA3 | Maruti Suzuki India | MA3FJEB1S00123456, MA3FJEB1S00123457, MA3FJEB1S00123458 |
| MAT | Tata Motors | MATNAT51SJT100201, MATNAT51SJT100202 |
| MAL | Hyundai India | MALBB51BLHM200301, MALBB51BLHM200302 |
| MA1 | Mahindra | MA1HA2HS7PH300101 |

> VIN format: 17 characters, first 3 = WMI (World Manufacturer Identifier)

---

## Real Data: Numbering Formats

| Entity | Format | Example | Logic |
|--------|--------|---------|-------|
| Part Number | MTH-XX-NNN | MTH-DH-001 | MTH=Motherson, XX=category, NNN=sequence |
| Lot Number | LOT-MAT-YYYY-NNN | LOT-STL-2026-005 | MAT=material code, YYYY=year |
| Batch Number | B-YYYY-NNN | B-2026-003 | Sequential per year |
| Shipment Number | SH-YYYY-NNN | SH-2026-001 | Sequential per year |
| Serial Number | PartNo-NNNNN | MTH-DH-001-00042 | PartNumber + 5-digit sequence |

---

## Demo-Specific Data (20%)

### Data for Scan Demo
| # | Serial | Part | Lot | Lot Status | Expected Result |
|---|--------|------|-----|------------|-----------------|
| 1 | MTH-DH-001-00042 | Door Handle | LOT-STL-2026-005 | ON_HOLD | ❌ BLOCKED (lot on hold) |
| 2 | MTH-DH-001-00043 | Door Handle | LOT-STL-2026-001 | OK | ✅ ACCEPTED |
| 3 | MTH-WH-002-00015 | Wiring Harness | LOT-COP-2026-001 | OK | ❌ BLOCKED (wrong part for DH batch) |

### Data for Trace Demo

```
LOT-STL-2026-005 (Defective — ON_HOLD)
    │
    ├── Consumed by: B-2026-003 (500 pcs, Door Handle Assembly)
    │       │
    │       ├── Shipped in: SH-2026-001 → Maruti Suzuki
    │       │
    │       └── VINs: MA3FJEB1S00123456, MA3FJEB1S00123457, MA3FJEB1S00123458
    │
    └── Consumed by: B-2026-007 (300 pcs, Door Handle Assembly)
            │
            └── NOT SHIPPED — still in factory (can be quarantined)
```

### Data for Hold Demo

| Hold | Lot | Requested By | Status | Approved By |
|------|-----|-------------|--------|-------------|
| Hold 1 | LOT-STL-2026-005 | Priya (QE) | APPROVED | Vikram (Manager) |
| Hold 2 (NEW) | LOT-PLY-2026-002 | — | For live demo — user creates this | — |

### Pre-existing Scan Events (for Dashboard Charts)

| Day | Accepted | Blocked | Total |
|-----|----------|---------|-------|
| Oct 21 | 180 | 5 | 185 |
| Oct 22 | 210 | 8 | 218 |
| Oct 23 | 195 | 3 | 198 |
| Oct 24 | 220 | 12 | 232 |
| Oct 25 | 205 | 6 | 211 |
| Oct 26 | 190 | 9 | 199 |
| Oct 27 | 45 | 2 | 47 |

---

## Kaggle CSV Import (If User Downloads Later)

### Step 1: Download 3 files from Kaggle
1. `parts-manufacturing-industry-dataset` → `parts_mfg.csv`
2. `vehicle-sales-data` → `vehicle_sales.csv`
3. `predicting-manufacturing-defects-dataset` → `defects.csv`

### Step 2: Place in project folder
```
data/kaggle/
├── parts_mfg.csv
├── vehicle_sales.csv
└── defects.csv
```

### Step 3: Import Mapping

| Kaggle Column | TraceIntel Column | Table |
|--------------|------------------|-------|
| parts_mfg: `measurement_1..5` | Part quality specs | parts (extend later) |
| parts_mfg: `operator` | Operator names | users |
| vehicle_sales: `vin` | VIN | vehicle_links |
| vehicle_sales: `make` | Customer mapping | customers |
| vehicle_sales: `model` | Vehicle model | vehicle_links (extended) |
| vehicle_sales: `year` | Vehicle year | vehicle_links (extended) |
| defects: `DefectStatus` | Lot status | material_lots |
| defects: `ProductionVolume` | Batch quantity | production_batches |

### Step 4: API Endpoint
```
POST /api/admin/vin/import
Content-Type: multipart/form-data
Body: file = vehicle_sales.csv
```

---

## Seed Data SQL Summary (V2__seed_demo_data.sql)

```
Inserts:
├── 5 roles
├── 6 users (with BCrypt hashed passwords)
├── 5 suppliers
├── 6 customers
├── 6 machines
├── 8 finished parts + 8 raw material parts = 16 parts total
├── 12 BOM items (linking raw materials to finished parts)
├── 10 material lots (1 ON_HOLD for demo)
├── 8 production batches
├── 10 batch_material_consumption links
├── 50 serial numbers
├── ~1200 scan events (spread across 7 days)
├── 3 shipments
├── 5 shipment items
├── 10 vehicle links (VINs)
├── 1 quality hold (APPROVED)
└── 5 audit log entries

Total: ~1,320 rows of seed data
```
