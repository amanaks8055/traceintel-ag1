# 🎬 TraceIntel AG-1 — Demo Script (Interview Showcase)

## Total Time: 3 minutes 30 seconds

> **Before starting**: Both servers should be running (backend on 8080, frontend on 5173). Browser open to login page.

---

## Scene 1: Login & Dashboard (30 seconds)

### What to DO:
1. Type username: `operator1`
2. Type password: `pass123`
3. Click **Sign In**
4. Dashboard loads with animated counters

### What to SAY:
> *"Yeh TraceIntel AG-1 hai — ek manufacturing traceability application jo auto-parts factory ke liye banayi hai. Login JWT token-based hai with role-based access control.*
>
> *Dashboard pe dekh sakte hain — aaj ke scan counts, blocked scans, active holds. Yeh sab real-time data hai database se."*

### What's on SCREEN:
```
┌──────────────────────────────────┐
│  📊 Total Batches: 8  (counting up animation)
│  🔍 Scans Today: 47
│  ❌ Blocked Today: 2
│  🛑 Active Holds: 1
│
│  📈 7-day scan activity chart
│  📋 Recent scan events table
└──────────────────────────────────┘
```

---

## Scene 2: Wrong Part BLOCKED ⭐ (45 seconds)

### What to DO:
1. Click **Scan Station** in sidebar
2. Select batch: `B-2026-003` (Door Handle Assembly batch)
3. Type serial: `MTH-WH-002-00015` (this is a **Wiring Harness** — WRONG part!)
4. Click **Submit** / Press Enter
5. Screen shows **❌ BLOCKED** with RED glow and shake animation

### What to SAY:
> *"Ab main production line pe scan karta hoon. Batch B-2026-003 Door Handle Assembly ka batch hai. Maine galti se Wiring Harness ka serial scan kar diya.*
>
> *Dekho — system ne turant block kar diya. Reason: 'Part Wiring Harness is not in BOM for this batch.' Agar yeh system nahi hota toh galat part lag jaata aur poora batch reject hota — lakho ka nuksaan."*

### What's on SCREEN:
```
┌──────────────────────────────────┐
│         ❌ BLOCKED               │
│                                  │
│  Serial: MTH-WH-002-00015       │
│  Part:   Wiring Harness         │
│                                  │
│  ⚠ WRONG PART: Part 'Wiring     │
│  Harness' is not in BOM for     │
│  batch B-2026-003 (expected:    │
│  Door Handle Assembly)           │
│                                  │
│  (Red border glow + shake)       │
└──────────────────────────────────┘
```

### Quick Follow-Up (Optional):
6. Now type correct serial: `MTH-DH-001-00043`
7. Click Submit → **✅ ACCEPTED** (green glow)
8. *"Sahi part scan kiya — accepted. System ne BOM match verify kiya."*

---

## Scene 3: Two-Person Hold Approval ⭐ (60 seconds)

### Step 3A: Request Hold (as Quality Engineer)
1. Click **Logout** (bottom of sidebar)
2. Login as: `priya` / `pass123` (Quality Engineer)
3. Click **Hold Management** in sidebar
4. Click **+ Request New Hold**
5. Select lot: `LOT-PLY-2026-002`
6. Type reason: `Failed incoming inspection — polymer viscosity out of spec`
7. Click **Submit Request**
8. See hold created with status: **REQUESTED**

### What to SAY (Step 3A):
> *"Ab Quality Engineer Priya ne incoming inspection mein polymer lot fail paya. Wo hold request karti hai. Dekho — status REQUESTED hai, lot abhi OK hai."*

### Step 3B: Approve Hold (as DIFFERENT person — Manager)
9. Click **Logout**
10. Login as: `vikram` / `pass123` (Manager)
11. Click **Hold Management**
12. See pending approval → Click **✅ Approve**
13. Type notes: `Confirmed. Quarantine lot immediately.`
14. Click **Confirm Approve**
15. Status changes to: **APPROVED**, lot status → **ON_HOLD**

### What to SAY (Step 3B):
> *"Ab Manager Vikram approve karta hai — dekho, DOOSRA aadmi hai. Agar Priya khud approve karti toh system error deta — 'Requester and approver cannot be same person.' Yeh IATF 16949 compliance ke liye hai — two-person rule."*

### What's on SCREEN:
```
┌──────────────────────────────────┐
│  Hold #2                         │
│  Lot: LOT-PLY-2026-002          │
│  Requested by: Priya Sharma      │
│  Approved by: Vikram Singh       │
│  Status: ✅ APPROVED             │
│  Lot Status: 🔴 ON_HOLD         │
└──────────────────────────────────┘
```

---

## Scene 4: Forward Trace ⭐ (45 seconds)

### What to DO:
1. Click **Forward Trace** in sidebar
2. Select lot: `LOT-STL-2026-005` (pre-existing defective lot)
3. Click **🔍 TRACE** button
4. Loading animation → Results appear

### What to SAY:
> *"Ab sabse important feature — Trace. LOT-STL-2026-005 defective lot hai — Tata Steel ka steel batch. Ek button dabaya — system ne 47 milliseconds mein bata diya:*
>
> *— Do batches affected hain: B-2026-003 jo ship ho chuka hai, aur B-2026-007 jo abhi factory mein hai*
> *— Maruti Suzuki ko shipment gayi thi*
> *— 3 gaadiyaan affected hain — VIN numbers dikh rahe hain*
> *— Estimated loss ₹3 lakh*
>
> *Pehle yeh kaam Excel mein 2-3 din lagta tha. Yahan 47ms mein ho gaya. Aur yeh time measured hai — database mein save hota hai."*

### What's on SCREEN:
```
┌──────────────────────────────────┐
│  ⏱️ Trace completed in 47ms     │
│                                  │
│  Affected Batches: 2            │
│  ├ B-2026-003 (500 pcs) 📦 SHIP│
│  └ B-2026-007 (300 pcs) 🏭 HERE│
│                                  │
│  Affected Customers: 1          │
│  └ Maruti Suzuki India Ltd      │
│                                  │
│  Affected VINs: 3               │
│  ├ MA3FJEB1S00123456            │
│  ├ MA3FJEB1S00123457            │
│  └ MA3FJEB1S00123458            │
│                                  │
│  Loss Estimate: ₹3,04,000      │
└──────────────────────────────────┘
```

---

## Scene 5: Backward Trace (30 seconds)

### What to DO:
1. Click **Backward Trace** in sidebar
2. Enter VIN: `MA3FJEB1S00123456`
3. Click **Trace**
4. Chain appears

### What to SAY:
> *"Backward trace ulta kaam karta hai — Maruti ne call kiya ki gaadi mein problem hai, VIN diya. Maine VIN enter kiya — system ne bataya ki yeh part Batch B-2026-003 se aaya, jismein LOT-STL-2026-005 use hua, jo Tata Steel se aaya tha.*
>
> *Full chain — VIN se supplier tak — ek click mein."*

### What's on SCREEN:
```
┌──────────────────────────────────┐
│  VIN: MA3FJEB1S00123456         │
│    ↓                             │
│  Customer: Maruti Suzuki India   │
│    ↓                             │
│  Serial: MTH-DH-001-00042      │
│    ↓                             │
│  Batch: B-2026-003 (Door Handle)│
│    ↓                             │
│  Lot: LOT-STL-2026-005         │
│    ↓                             │
│  Supplier: Tata Steel Ltd       │
│  Status: 🔴 ON_HOLD            │
└──────────────────────────────────┘
```

---

## Closing (15 seconds)

### What to SAY:
> *"Toh basically TraceIntel do problems solve karta hai:*
> *1. Wrong part lagane se rokta hai — scan pe BOM validation*
> *2. Defective lot milne pe turant batata hai ki kya affected hua — trace chain*
>
> *42 REST APIs, 17 database tables, JWT authentication, 5 roles ke saath RBAC, aur har trace ka time measured aur saved hai. JUnit aur Mockito se 28 unit tests likhe hain."*

---

## Quick Reference — Login Credentials for Demo

| Step | Username | Password | Role | Purpose |
|------|----------|---------|------|---------|
| Scene 1-2 | operator1 | pass123 | OPERATOR | Scan demo |
| Scene 3A | priya | pass123 | QUALITY_ENGINEER | Hold request |
| Scene 3B | vikram | pass123 | MANAGER | Hold approve |
| Scene 4-5 | vikram | pass123 | MANAGER | Trace (stay logged in) |

---

## Pre-Demo Checklist

- [ ] Backend running (`mvn spring-boot:run` — port 8080)
- [ ] Frontend running (`npm run dev` — port 5173)
- [ ] PostgreSQL running with `traceintel` database
- [ ] Browser opened to `http://localhost:5173`
- [ ] No network issues (everything is localhost)
- [ ] Screen sharing set up (if remote)
